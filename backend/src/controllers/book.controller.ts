import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { BookService } from "../services/book.service";
import { createBookSchema, getBooksSchema } from "../schemas/book.schema";
import { UnAuthorizedException, UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const createBook = asyncHandler(async (req: Request, res: Response) => {
	const parsed = createBookSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid book data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	let data: {
		title: string;
		author: string;
		description: string;
		coverImage: string;
		pages?: number;
		publisher?: string;
		publishYear?: number;
		isbn?: string;
		genres?: string[];
		tags?: string[];
	} = {
		title: parsed.data.title,
		author: parsed.data.author,
		description: parsed.data.description,
		coverImage: parsed.data.coverImage,
	};

	if (parsed.data.pages) data.pages = parsed.data.pages;
	if (parsed.data.publisher) data.publisher = parsed.data.publisher;
	if (parsed.data.publishYear) data.publishYear = parsed.data.publishYear;
	if (parsed.data.isbn) data.isbn = parsed.data.isbn;
	if (parsed.data.genres) data.genres = parsed.data.genres;
	if (parsed.data.tags) data.tags = parsed.data.tags;

	const book = await BookService.createBook(data);
	res.status(201).json({ success: true, message: "Book created successfully", data: book });
});

export const getTrendingBooks = asyncHandler(async (req: Request, res: Response) => {
	const trendingBooks = await BookService.getTrendingBooks();
	res.json({ success: true, message: "Trending books fetched successfully", data: trendingBooks });
});

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
	const parsed = getBooksSchema.safeParse(req.query);
	if (!parsed.success) throw new UnprocessableEntity("Invalid query parameters", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const query = { page: parsed.data.page ?? 1, limit: parsed.data.limit ?? 30, search: parsed.data.search ?? "" };

	const result = await BookService.getAllBooks(query);
	res.json({ success: true, message: "All books fetched successfully", data: result });
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
	const bookId = req.params.bookId;

	if (!bookId || typeof bookId !== "string") throw new UnprocessableEntity("Invalid book ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const book = await BookService.getBookById(bookId);
	res.json({ success: true, message: "Book fetched successfully", data: book });
});

export const reactToBook = asyncHandler(async (req: Request, res: Response) => {
	const bookId = req.params.bookId;

	if (!bookId || typeof bookId !== "string") throw new UnprocessableEntity("Invalid book ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	const result = await BookService.reactToBook(bookId, userId);
	res.json({ success: true, message: "Book saved successfully", data: result });
});

export const getSavedBooks = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	const savedBooks = await BookService.getSavedBooks(userId);
	res.json({ success: true, message: "Saved books fetched successfully", data: savedBooks });
});
