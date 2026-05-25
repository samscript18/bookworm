import { QueryFilter } from "mongoose";
import axios from "axios";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book, BookDocument, IBook } from "../models/book.model";
import { getPaginationData } from "../utils/helpers/helper";
import { PaginationQuery } from "../types/pagination.type";
import { User } from "../models/user.model";
import { SyncState } from "../models/sync-state.model";

const GUTENDEX_SYNC_KEY = "gutendex-books";
const GUTENDEX_URL = "https://gutendex.com/books?languages=en&mime_type=text%2Fplain";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_COVER_IMAGE = "https://www.gutenberg.org/gutenberg/pg-logo-129x80.png";

type GutendexBook = {
	id: number;
	title?: string;
	authors?: { name?: string }[];
	summaries?: string[];
	subjects?: string[];
	bookshelves?: string[];
	languages?: string[];
	formats?: Record<string, string>;
	download_count?: number;
	copyright?: boolean;
};

type GutendexResponse = {
	results?: GutendexBook[];
};

type NormalizedExternalBook = {
	title: string;
	author: string;
	description: string;
	coverImage: string;
	publisher: string;
	genres: string[];
	tags: string[];
	readingUrl: string;
	source: string;
	externalId: string;
	language: string;
	totalReviews: number;
	averageRating: number;
};

const pickFormatUrl = (formats: Record<string, string> | undefined, matcher: (key: string) => boolean) => {
	if (!formats) return undefined;

	const entry = Object.entries(formats).find(([key, value]) => matcher(key.toLowerCase()) && typeof value === "string" && value.startsWith("http"));
	return entry?.[1];
};

const normalizeGenre = (value: string) => value.split("--")[0]?.trim().toLowerCase();

const normalizeGutendexBook = (book: GutendexBook): NormalizedExternalBook | null => {
	const readingUrl = pickFormatUrl(book.formats, (key) => key.includes("text/plain"));
	if (!book.id || !book.title || !readingUrl) return null;

	const subjects = [...(book.subjects ?? []), ...(book.bookshelves ?? [])];
	const genres = Array.from(new Set(subjects.map(normalizeGenre).filter((genre): genre is string => Boolean(genre)))).slice(0, 4);
	const tags = Array.from(
		new Set(
			subjects
				.flatMap((subject) => subject.split(/--|,|\./))
				.map((tag) => tag.trim().toLowerCase())
				.filter(Boolean),
		),
	).slice(0, 5);

	return {
		title: book.title,
		author: book.authors?.map((author) => author.name).filter(Boolean).join(", ") || "Unknown Author",
		description: book.summaries?.[0] || `A public-domain book from Project Gutenberg: ${book.title}.`,
		coverImage: pickFormatUrl(book.formats, (key) => key.includes("image/jpeg")) ?? DEFAULT_COVER_IMAGE,
		publisher: "Project Gutenberg",
		genres: genres.length > 0 ? genres : ["classic"],
		tags: tags.length > 0 ? tags : ["public domain", "classic"],
		readingUrl,
		source: "gutendex",
		externalId: `gutendex:${book.id}`,
		language: book.languages?.[0] ?? "en",
		totalReviews: 0,
		averageRating: 0,
	};
};

export class BookService {
	static async createBook(data: { title: string; author: string; coverImage: string; description: string; pages?: number; publisher?: string; publishYear?: number; isbn?: string; genres?: string[]; tags?: string[]; readingUrl?: string; source?: string; externalId?: string; language?: string }) {
		const book = await Book.create(data);
		return book;
	}

	static async getAllBooks(query: { cursor?: string; limit: number; search?: string; genre?: string }) {
		await this.syncExternalBooksSafely();

		const _query: QueryFilter<IBook> = {};

		if (query.search) {
			_query.$or = [{ title: { $regex: query.search, $options: "i" } }, { author: { $regex: query.search, $options: "i" } }];
		}

		if (query.genre && query.genre.toLowerCase() !== "all") {
			_query.genres = query.genre.toLowerCase();
		}

		if (query.cursor) {
			_query.createdAt = { $lt: new Date(query.cursor) };
		}

		const books = await Book.find(_query)
			.sort({ createdAt: -1 })
			.limit(query.limit + 1)
			.lean();

		const nextCursor = books.length > 0 ? ((books[books.length - 1] as { createdAt?: Date })?.createdAt ?? null) : null;

		return {
			books,
			nextCursor,
		};
	}

	static async getTrendingBooks() {
		await this.syncExternalBooksSafely();

		const trendingBooks: BookDocument[] = await Book.aggregate([
			{ $match: { totalReviews: { $gt: 0 } } },
			{
				$addFields: {
					trendingScore: {
						$add: [
							{ $multiply: ["$averageRating", 10] },
							{ $min: ["$totalReviews", 50] },
							{
								$divide: [1000, { $add: [{ $subtract: [new Date(), "$createdAt"] }, 1] }],
							},
						],
					},
				},
			},
			{ $sort: { trendingScore: -1, totalReviews: -1, averageRating: -1, createdAt: -1 } },
			{ $limit: 10 },
			{ $project: { trendingScore: 0 } },
		]);

		const books = trendingBooks.map((book) => ({
			_id: book._id,
			title: book.title,
			coverImage: book.coverImage,
			averageRating: book.averageRating,
			genres: book.genres,
			tags: book.tags,
		}));

		return books;
	}

	static async getBookById(bookId: string) {
		const book = await Book.findById(bookId);
		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		return book;
	}

	static async reactToBook(bookId: string, userId: string) {
		const book = await Book.findById(bookId);
		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		const user = await User.findById(userId).select("savedBooks");
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		const isSaved = user.savedBooks.some((id) => id.equals(book._id));

		const update = isSaved ? { $pull: { savedBooks: book._id } } : { $addToSet: { savedBooks: book._id } };

		const updatedUser = await User.findByIdAndUpdate(userId, update, { returnDocument: "after" });

		return {
			saved: !isSaved,
			savedBooksCount: updatedUser?.savedBooks.length,
		};
	}

	static async saveBookToLibrary(bookId: string, userId: string) {
		const book = await Book.findById(bookId);
		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		const user = await User.findByIdAndUpdate(userId, { $addToSet: { savedBooks: book._id } }, { returnDocument: "after" }).select("savedBooks");
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		return {
			saved: true,
			savedBooksCount: user.savedBooks.length,
		};
	}

	static async getSavedBooks(userId: string) {
		const user = await User.findById(userId).select("savedBooks").populate("savedBooks", "title author description coverImage averageRating totalReviews readingUrl source externalId language");
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		return user.savedBooks;
	}

	static async syncExternalBooks() {
		await Book.updateMany({ source: "gutendex", averageRating: 0, totalReviews: { $ne: 0 } }, { $set: { totalReviews: 0 } });

		const syncState = await SyncState.findOne({ key: GUTENDEX_SYNC_KEY }).lean();
		if (syncState && Date.now() - syncState.lastSyncedAt.getTime() < ONE_DAY_MS) {
			return { inserted: 0, skipped: true };
		}

		const response = await axios.get<GutendexResponse>(GUTENDEX_URL, {
			headers: { Accept: "application/json" },
			timeout: 15000,
		});

		const payload = response.data;
		const books = (payload.results ?? []).map(normalizeGutendexBook).filter((book): book is NormalizedExternalBook => Boolean(book));

		if (books.length === 0) {
			await SyncState.findOneAndUpdate({ key: GUTENDEX_SYNC_KEY }, { key: GUTENDEX_SYNC_KEY, lastSyncedAt: new Date(), metadata: { inserted: 0 } }, { upsert: true });
			return { inserted: 0, skipped: false };
		}

		const existing = await Book.find({ externalId: { $in: books.map((book) => book.externalId) } }).select("externalId").lean();
		const existingIds = new Set(existing.map((book) => book.externalId).filter(Boolean));
		const newBooks = books.filter((book) => !existingIds.has(book.externalId));

		if (newBooks.length > 0) {
			await Book.insertMany(newBooks, { ordered: false });
		}

		await SyncState.findOneAndUpdate({ key: GUTENDEX_SYNC_KEY }, { key: GUTENDEX_SYNC_KEY, lastSyncedAt: new Date(), metadata: { inserted: newBooks.length } }, { upsert: true });

		return { inserted: newBooks.length, skipped: false };
	}

	private static async syncExternalBooksSafely() {
		try {
			await this.syncExternalBooks();
		} catch (error) {
			console.warn("External book sync failed", error);
		}
	}

	static async getAllGenres(page = 1, limit = 20) {
		const skip = (page - 1) * limit;

		const genres = await Book.aggregate([
			{ $unwind: "$genres" },
			{
				$group: {
					_id: "$genres",
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: "total" }],
				},
			},
		]);

		const result = genres[0];

		return {
			genres: result.data.map((g: any) => ({
				name: g._id,
				count: g.count,
			})),
			meta: {
				count: result.meta[0]?.total || 0,
			},
		};
	}

	static async getTrendingGenres(limit = 10) {
		const trending = await Book.aggregate([
			{ $unwind: "$genres" },
			{
				$group: {
					_id: "$genres",
					score: {
						$sum: {
							$add: [
								{ $multiply: ["$averageRating", 0.7] },
								{
									$multiply: [{ $ln: { $add: ["$totalReviews", 1] } }, 0.3],
								},
							],
						},
					},
				},
			},
			{ $sort: { score: -1 } },
			{ $limit: limit },
		]);

		return trending.map((g: any) => ({
			name: g._id,
		}));
	}
}
