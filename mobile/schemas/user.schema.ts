import z from "zod";

export const editProfileSchema = z.object({
	firstName: z.string().min(3, "First Name must be at least 3 characters").optional(),
	lastName: z.string().min(3, "Last Name must be at least 3 characters").optional(),
	userName: z.string().min(4, "Last Name must be at least 4 characters").optional(),
	email: z.email("Invalid email address").trim().toLowerCase().optional(),
	profileImage: z.url("Profile Image must be a valid URL").optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});


