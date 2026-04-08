import { z } from "zod";

export const addCommentSchema = z.object({
	content: z.string().min(1, "Content is required"),
	parentCommentId: z.string().optional(),
});

export const editCommentSchema = z.object({
	content: z.string().min(1, "Content is required"),
});
