import { addCommentSchema, editCommentSchema } from "@/schemas/comment.schema";
import z from "zod";
import { BaseModelType } from "..";

export type AddCommentType = z.infer<typeof addCommentSchema>;
export type EditCommentType = z.infer<typeof editCommentSchema>;

export type Comment = {
	review: string;
	user: string;
	content: string;
	likes: string[];
	parentComment?: string | null;
	repliesCount: number;
} & BaseModelType;
