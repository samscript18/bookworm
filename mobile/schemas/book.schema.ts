import { z } from "zod";

export const uploadBookSchema = z.object({
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
