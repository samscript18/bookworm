import { addReviewSchema, editReviewSchema } from "@/schemas/review.schema";
import z from "zod";
import { BaseModelType } from "..";
import { User } from "../user/user";
import { Book } from "../book/book";

export type AddReviewType = z.infer<typeof addReviewSchema>;
export type EditReviewType = z.infer<typeof editReviewSchema>;

export type Review = {
	user: User;
	book: Book;
	rating: number;
	content: string;
	tags: string[];
	likes: string[];
	commentsCount: number;
} & BaseModelType;
