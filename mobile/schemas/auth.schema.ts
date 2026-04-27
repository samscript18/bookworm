import { z } from "zod";

export const passwordValidation = z
	.string("Enter a valid password")
	.min(8, "Password must be at least 8 characters")
	.max(20, "Password is too long")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const signupSchema = z.object({
	firstName: z.string().min(3, "First Name must be at least 3 characters"),
	lastName: z.string().min(3, "Last Name must be at least 3 characters"),
	userName: z.string().min(4, "Username must be at least 4 characters"),
	email: z.email("Invalid email address").trim().toLowerCase(),
	password: passwordValidation,
	profileImage: z.any().optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

export const loginSchema = z.object({
	email: z.email("Enter a valid email address").trim().toLowerCase(),
	password: z.string("Enter a password").min(1, "Enter a password"),
});

export const googleAuthSchema = z.object({
	idToken: z.string().min(1, "idToken is required"),
});

export const forgotPasswordSchema = z.object({
	email: z.email("Enter a valid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z
	.object({
		password: passwordValidation,
		confirmPassword: z.string("Enter a valid confirm password").min(8, "Confirm Password must be the same as new password").max(20, "Confirm Password must be the same as new password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const emailExistenceSchema = z.object({
	email: z.email("Invalid email format").trim().toLowerCase(),
});

export const usernameExistenceSchema = z.object({
	username: z.string().min(4, "Username must be at least 4 characters"),
});
