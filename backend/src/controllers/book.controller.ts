import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { BookService } from "../services/book.service";
import { createBookSchema, getBooksSchema, rateBookSchema } from "../schemas/book.schema";
import { UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const createBook = asyncHandler(async (req: Request, res: Response) => {
	const parsed = createBookSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid book data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const book = await BookService.createBook(parsed.data);
	res.status(201).json({ success: true, message: "Book created successfully", data: book });
});

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
	const parsed = getBooksSchema.safeParse(req.query);
	if (!parsed.success) throw new UnprocessableEntity("Invalid query parameters", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const query = { page: parsed.data.page ?? 1, limit: parsed.data.limit ?? 20, search: parsed.data.search ?? "" };

	const result = await BookService.getAllBooks(query);
	res.json({ success: true, message: "All books fetched successfully", data: result });
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	if (!bookId || typeof bookId !== "string") throw new UnprocessableEntity("Invalid book ID", ErrorCode.UNPROCESSABLE_ENTITY, {});
	const book = await BookService.getBookById(bookId);
	res.json({ success: true, message: "Book fetched successfully", data: book });
});

export const rateBook = asyncHandler(async (req: Request, res: Response) => {
	const parsed = rateBookSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid rating", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const bookId = req.params.bookId;
	if (!bookId || typeof bookId !== "string") throw new UnprocessableEntity("Invalid book ID", ErrorCode.UNPROCESSABLE_ENTITY, {});
	if (!req.user) throw new UnprocessableEntity("User not authenticated", ErrorCode.AUTH_REQUIRED, {});
	const userId = req.user._id.toString();
	const book = await BookService.rateBook(bookId, userId, parsed.data.rating);

	res.json({ success: true, message: "Book rated successfully", data: book });
});
