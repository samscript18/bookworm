import z from "zod";
import { passwordValidation } from "./auth.schema";

export const changePasswordSchema = z.object({
	currentPassword: passwordValidation,
	newPassword: passwordValidation,
});

export const editProfileSchema = z.object({
	firstName: z.string().min(3, "First Name must be at least 3 characters").optional(),
	lastName: z.string().min(3, "Last Name must be at least 3 characters").optional(),
	userName: z.string().min(4, "Last Name must be at least 4 characters").optional(),
	email: z.email("Invalid email address").trim().toLowerCase().optional(),
	profileImage: z.url("Profile Image must be a valid URL").optional(),
	bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
});

export const updatePreferencesSchema = z.object({
	pushNotifications: z.boolean().optional(),
	darkMode: z.boolean().optional(),
});

export const fcmTokenSchema = z.object({
	fcmToken: z.string().min(10, "Invalid FCM Token"),
	platform: z.enum(["ios", "android"], "Platform must be either 'ios' or 'android'"),
});
