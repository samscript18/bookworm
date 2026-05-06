import { uploadBookSchema } from "@/schemas/book.schema";
import z from "zod";
import { BaseModelType } from "..";

export type BookTabType = "Details" | "Reviews" | "Discussions";

export type uploadBookType = z.infer<typeof uploadBookSchema>;

export type Book = {
	title: string;
	author: string;
	description: string;
	coverImage: string;
	pages: number;
	publisher: string;
	publishYear: number;
	isbn: string;
	genres: string[];
	tags: string[];
	averageRating: number;
	totalReviews: number;
} & BaseModelType;

export type BookGenre = {
	name: string;
	count: number;
};
