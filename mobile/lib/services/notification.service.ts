import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { Notification } from "@/types/notification/notification";
import { getNotificationsParams } from "@/types/notification/notification.dto";

export const getNotifications = async (params: getNotificationsParams) => {
	try {
		const response = await authApi.get<
			ApiResponse<{
				notifications: Notification[];
				nextCursor: string | null;
			}>
		>("notifications/", { params });

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const markAllAsRead = async () => {
	try {
		const response = await authApi.patch<ApiResponse<{}>>("/notifications/mark-all-as-read");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const markAsRead = async (notificationId: string) => {
	try {
		const response = await authApi.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/mark-as-read`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
