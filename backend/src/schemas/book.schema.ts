import { z } from "zod";

export const createBookSchema = z.object({
	title: z.string().min(1, "Title is required"),
	author: z.string().min(1, "Author is required"),
	image: z.url("Image must be a valid URL"),
});

export const getBooksSchema = z.object({
	page: z.number().min(1).optional(),
	limit: z.number().min(1).optional(),
	search: z.string().optional(),
});

export const rateBookSchema = z.object({
	rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
});
