import { ForgotPasswordDto, GoogleAuthDto, LoginDto, ResetPasswordDto, SignUpDto } from "@/types/auth/auth.dto";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user/user";
import { signInWithGoogle } from "../config/google";

export const login = async (data: LoginDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ user: User; token: string }>>("/auth/login", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const signup = async (data: SignUpDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ user: User; token: string }>>("/auth/signup", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const requestForgotPasswordToken = async (data: ForgotPasswordDto) => {
	try {
		await publicApi.post("/auth/forgot-password", data);
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const resetPassword = async (data: ResetPasswordDto) => {
	try {
		await publicApi.post("/auth/reset-password", data);
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const googleAuth = async () => {
	const { idToken } = await signInWithGoogle();

	try {
		await publicApi.post<ApiResponse<{ user: User; token: string }>>("/auth/google", { idToken } as GoogleAuthDto);
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

//logout function is handled in the auth store, but if you want to do additional cleanup related to Google Sign-In, you can add it here. For example, you might want to sign out from Google when the user logs out of your app.
// await GoogleSignin.signOut();
// await removeFcmToken(token);
