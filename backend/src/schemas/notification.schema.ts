import z from "zod";

export const getNotificationsSchema = z.object({
	category: z.enum(["all", "mentions"]).default("all"),
	cursor: z.string().min(1).optional(),
	limit: z.string().min(1).max(100).default("20"),
});
