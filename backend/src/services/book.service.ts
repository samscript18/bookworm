import { QueryFilter } from "mongoose";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book, IBook } from "../models/book.model";
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

		if (query.genre) {
			_query.genres = { $in: [query.genre] };
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
				limit,
			},
		};
	}

	static async getTrendingBooks() {
		const trendingBooks = await Book.aggregate([
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

		return trendingBooks;
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
}
