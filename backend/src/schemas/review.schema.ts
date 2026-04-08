import z from "zod";

export const postReviewSchema = z.object({
	rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
	content: z.string().min(1, "Content is required").max(3000, "Content cannot exceed 3000 characters"),
	tags: z.array(z.string()).optional(),
});

export const editReviewSchema = z.object({
	rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
	content: z.string().min(1, "Content is required").max(3000, "Content cannot exceed 3000 characters").optional(),
	tags: z.array(z.string()).optional(),
});
