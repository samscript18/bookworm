import { ApiResponse } from "@/types/api";
import { publicApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";

export const uploadSingleImage = async (data: FormData) => {
	try {
		const response = await publicApi.post<ApiResponse<{ url: string }>>("/upload/single", data, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const uploadMultipleImages = async (data: FormData) => {
	try {
		const response = await publicApi.post<ApiResponse<{ urls: string[] }>>("/upload/bulk", data, {
			headers: { "Content-Type": "multipart/form-data" },
		});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
