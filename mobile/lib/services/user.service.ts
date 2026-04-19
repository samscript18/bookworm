import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { UpdateFcmTokenDto } from "@/types/user/user.dto";

export const updateFcmToken = async (data: UpdateFcmTokenDto) => {
	try {
		const response = await authApi.post<ApiResponse<{}>>("/users/me/update-fcm-token", data);

		return response.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
