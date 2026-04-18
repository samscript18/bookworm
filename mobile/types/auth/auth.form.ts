import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "@/schemas/auth.schema";
import z from "zod";

export type LoginType = z.infer<typeof loginSchema>;

export type SignUpType = z.infer<typeof signupSchema>;

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export type PersistedAuthStore = {
	state?: {
		accessToken?: string;
	};
};
