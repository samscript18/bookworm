import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book } from "../models/book.model";
import { resolvePagination } from "../utils/helpers/helper";

export class BookService {
	static async createBook(data: { title: string; author: string; image: string }) {
		const book = await Book.create(data);
		return book;
	}

	static async getAllBooks(query: { page?: number; limit?: number; search?: string }) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const { skip, limit: limitVal } = resolvePagination(0, page, limit);

		const pipeline: any[] = [];

		if (query.search) {
			pipeline.push({
				$match: { title: { $regex: query.search, $options: "i" } },
			});
		}

		pipeline.push({
			$addFields: {
				rating: {
					$cond: [{ $gt: [{ $size: { $ifNull: ["$ratings", []] } }, 0] }, { $round: [{ $avg: "$ratings.rating" }, 2] }, 0],
				},
			},
		});

		pipeline.push({
			$facet: {
				metadata: [{ $count: "total" }],
				data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limitVal }],
			},
		});

		const [result] = await Book.aggregate(pipeline);

		const totalCount = result.metadata[0]?.total || 0;
		const pagination = resolvePagination(totalCount, page, limit);

		return {
			books: result.data,
			pagination,
		};
	}

	static async getBookById(bookId: string) {
		const book = await Book.findById(bookId);
		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		const ratings = book.ratings || [];
		const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

		return {
			...book.toObject(),
			ratings: parseFloat(averageRating.toFixed(2)),
		};
	}

	static async rateBook(bookId: string, userId: string, rating: number) {
		let book = await Book.findOneAndUpdate({ _id: bookId, "ratings.user": userId }, { $set: { "ratings.$.rating": rating } }, { new: true });

		if (!book) {
			book = await Book.findByIdAndUpdate(bookId, { $push: { ratings: { user: userId, rating } } }, { new: true });
		}

		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		const ratings = book.ratings || [];
		const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

		return {
			...book.toObject(),
			rating: parseFloat(averageRating.toFixed(2)),
		};
	}
}
