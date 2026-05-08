import z from "zod";
import { passwordValidation } from "./auth.schema";

export const editProfileSchema = z.object({
	firstName: z.string().min(3, "First Name must be at least 3 characters"),
	lastName: z.string().min(3, "Last Name must be at least 3 characters"),
	userName: z.string().min(4, "Last Name must be at least 4 characters"),
	email: z.email("Invalid email address").trim().toLowerCase(),
	profileImage: z.any(),
	bio: z.string().max(300, "Bio must be at most 300 characters"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: passwordValidation,
		newPassword: z.string("Enter a valid new password").min(8, "New Password must be at least 8 characters").max(20, "New Password must be at most 20 characters"),
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: "Passwords should not match",
		path: ["newPassword"],
	});