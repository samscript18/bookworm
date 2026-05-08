import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { ChangePasswordDto, EditProfileDto, fcmTokenDto, ReactToUserDto, UpdatePreferencesDto } from "@/types/user/user.dto";
import { User } from "@/types/user/user";

export const updateFcmToken = async (data: fcmTokenDto) => {
	try {
		const response = await authApi.post<ApiResponse<{}>>("/users/me/update-fcm-token", data);

		return response.data;
	} catch (error) {
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

export const getProfile = async (userId?: string) => {
	try {
		const response = await authApi.get<ApiResponse<User>>("/users/me", userId ? { params: { userId } } : {});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const editProfile = async (data: EditProfileDto) => {
	try {
		const response = await authApi.patch<ApiResponse<User>>("/users/me", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const changePassword = async (data: ChangePasswordDto) => {
	try {
		const response = await authApi.patch<ApiResponse<{}>>("/users/me/change-password", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const updatePreferences = async (data: UpdatePreferencesDto) => {
	try {
		const response = await authApi.patch<
			ApiResponse<{
				pushNotifications: boolean;
			}>
		>("/users/me/preferences", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const reactToUser = async (data: ReactToUserDto) => {
	try {
		const response = await authApi.post<
			ApiResponse<{
				isFollowing: boolean;
			}>
		>(`/users/${data.userId}/react`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
