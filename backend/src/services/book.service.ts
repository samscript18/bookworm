import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book } from "../models/book.model";

export class BookService {
	static async createBook(data: { title: string; author: string; image: string }) {
		const book = await Book.create(data);
		return book;
	}

	static async getAllBooks() {
		const books = await Book.find({}).lean();

		const formattedBooks = books.map((book) => {
			const ratings = book.ratings || [];
			const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

			return {
				...book,
				ratings: parseFloat(averageRating.toFixed(2)),
			};
		});

		return formattedBooks;
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
		const book = await Book.findById(bookId);
		if (!book) throw new NotFoundException("Book not found", ErrorCode.NOT_FOUND);

		const index = book.ratings.findIndex((r) => r.user.toString() === userId);
		if (index >= 0 && book.ratings[index]) book.ratings[index].rating = rating;
		else book.ratings.push({ user: userId, rating });

		await book.save();

		const ratings = book.ratings || [];
		const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

		return {
			...book.toObject(),
			ratings: parseFloat(averageRating.toFixed(2)),
		};
	}
}
