import { CheckEmailDto, CheckUsernameDto, ForgotPasswordDto, GoogleAuthDto, LoginDto, LogoutDto, ResetPasswordDto, SignUpDto } from "@/types/auth/auth.dto";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user/user";
import { signInWithGoogle, signOutFromGoogle } from "../config/google";
import { removeFcmToken } from "./user.service";

export const checkEmail = async (data: CheckEmailDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ exists: boolean }>>("/auth/check-email", data);
		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
export const checkUsername = async (data: CheckUsernameDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ exists: boolean }>>("/auth/check-username", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
export const login = async (data: LoginDto) => {
	try {
		const response = await publicApi.post<ApiResponse<{ user: User; token: string }>>("/auth/login", data);

		return response.data.data;
	} catch (error) {
		console.log("Login error:", error);
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
		const response = await publicApi.post<ApiResponse<{ user: User; token: string }>>("/auth/google", { idToken } as GoogleAuthDto);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const logout = async (data: LogoutDto) => {
	try {
		// await removeFcmToken({ fcmToken: data.token, platform: data.platform });
		await signOutFromGoogle();
		return true;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
