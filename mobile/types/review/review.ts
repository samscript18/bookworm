import { addReviewSchema, editReviewSchema } from "@/schemas/review.schema";
import z from "zod";
import { BaseModelType } from "..";

export type AddReviewType = z.infer<typeof addReviewSchema>;
export type EditReviewType = z.infer<typeof editReviewSchema>;

export type Review = {
	user: string;
	book: string;
	rating: number;
	content: string;
	tags: string[];
	likes: string[];
	commentsCount: number;
} & BaseModelType;
