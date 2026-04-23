import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { fcmTokenDto } from "@/types/user/user.dto";

export const updateFcmToken = async (data: fcmTokenDto) => {
	try {
		const response = await authApi.post<ApiResponse<{}>>("/users/me/update-fcm-token", data);

		return response.data;
	} catch (error) {
		console.log(error);
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const removeFcmToken = async (data: fcmTokenDto) => {
	try {
		const response = await authApi.delete<ApiResponse<{}>>("/users/me/remove-fcm-token", { data });

		return response.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
