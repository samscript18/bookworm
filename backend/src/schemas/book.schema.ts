import { z } from "zod";

export const createBookSchema = z.object({
	title: z.string().min(1, "Title is required"),
	author: z.string().min(1, "Author is required"),
	description: z.string().min(1, "Description is required"),
	coverImage: z.string().url("Cover image must be a valid URL"),
	pages: z.number().int().positive().optional(),
	publisher: z.string().optional(),
	publishYear: z.number().int().optional(),
	isbn: z.string().optional(),
	genres: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
});

export const getBooksSchema = z.object({
	cursor: z.string().min(1).optional(),
	limit: z.string().min(1).optional(),
	search: z.string().optional(),
	genre: z.string().optional(),
});

export const rateBookSchema = z.object({
	rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});

export const getSavedBooksSchema = z.object({
	userId: z.string().optional(),
});
