import { QueryFilter } from "mongoose";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book, BookDocument, IBook } from "../models/book.model";
import { getPaginationData } from "../utils/helpers/helper";
import { PaginationQuery } from "../types/pagination.type";
import { User } from "../models/user.model";

export class BookService {
	static async createBook(data: { title: string; author: string; coverImage: string; description: string; pages?: number; publisher?: string; publishYear?: number; isbn?: string; genres?: string[]; tags?: string[] }) {
		const book = await Book.create(data);
		return book;
	}

	static async getAllBooks(query: { page?: number; limit?: number; search?: string; genre?: string }) {
		const _query: QueryFilter<IBook> = {};
		const paginationQuery: PaginationQuery = {};

		if (query.page && query.page) {
			paginationQuery.page = query.page || 1;
			paginationQuery.limit = query.limit || 30;
		}

		if (query.search) {
			_query.$or = [{ title: { $regex: query.search, $options: "i" } }, { author: { $regex: query.search, $options: "i" } }];
		}

		if (query.genre && query.genre.toLowerCase() !== "all") {
			_query.genres = query.genre.toLowerCase();
		}

		const count = await Book.countDocuments(_query);

		const { limit, offset, totalPages } = getPaginationData(paginationQuery, count);

		const result = await Book.find(_query).skip(offset).limit(limit).sort({ createdAt: -1 }).lean();

		return {
			books: result,
			meta: {
				totalPages,
				currentPage: paginationQuery.page || 1,
				count,
			},
		};
	}

	static async getTrendingBooks() {
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

		const isSaved = user.savedBooks.some((id) => id.toString() === book._id.toString());

		const updatedUser = await User.findByIdAndUpdate(userId, isSaved ? { $pull: { savedBooks: book._id } } : { $addToSet: { savedBooks: book._id } }, { returnDocument: "after" });

		return {
			saved: !isSaved,
			savedBooksCount: updatedUser?.savedBooks.length,
		};
	}

	static async getSavedBooks(userId: string) {
		const user = await User.findById(userId).select("savedBooks").populate("savedBooks", "title author description coverImage averageRating totalReviews");
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		return user.savedBooks;
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
