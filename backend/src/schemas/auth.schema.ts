import { z } from "zod";

export const passwordValidation = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(20, "Password is too long")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (@, $, !, etc.)");

export const registerSchema = z.object({
	firstName: z.string().min(3, "First Name must be at least 3 characters"),
	lastName: z.string().min(3, "Last Name must be at least 3 characters"),
	userName: z.string().min(4, "Last Name must be at least 4 characters"),
	email: z.email("Invalid email address").trim().toLowerCase(),
	password: passwordValidation,
	profileImage: z.url("Profile Image must be a valid URL").optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

export const loginSchema = z.object({
	email: z.email("Invalid credentials").trim().toLowerCase(),
	password: z.string().min(1, "Invalid credentials"),
});

export const googleAuthSchema = z.object({
	idToken: z.string().min(1, "idToken is required"),
});

export const forgotPasswordSchema = z.object({
	email: z.email("Invalid credentials").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
	token: z.string().min(6, "Invalid token").max(6, "Invalid token"),
	password: passwordValidation,
});

