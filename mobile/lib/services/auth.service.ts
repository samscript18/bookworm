import { ForgotPasswordDto, LoginDto, ResetPasswordDto, SignUpDto } from "@/types/auth/auth.dto";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { publicApi } from "../config/axios-instance";
import { ApiResponse } from "@/types/api";
import { User } from "@/types/user/user";

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
