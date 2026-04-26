import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";
import { updateFcmToken } from "@/lib/services/user.service";
import { syncFcmToken } from "@/lib/utils/syncFromToken";
import { useAuthStore } from "@/store/useAuthStore";
import { Platform } from "react-native";

const NotificationInitializer = () => {
	const { isAuthenticated } = useAuthStore();

	const { mutate: updateToken } = useMutation({
		mutationKey: ["user", "update-fcm-token"],
		mutationFn: updateFcmToken,
	});

	useEffect(() => {
		if (!isAuthenticated) return;

		const platform = Platform.OS === "ios" ? "ios" : "android";
		if (!platform) return;

		const initNotifications = async () => {
			try {
				const token = await requestNotificationPermission();

				if (token) {
					await syncFcmToken(token, platform, updateToken);
				}
			} catch (error) {
				console.error("Notification init failed:", error);
			}
		};

		initNotifications();

		const cleanup = setupNotificationListeners((newToken: string) => {
			syncFcmToken(newToken, platform, updateToken);
		});

		return cleanup;
	}, [updateToken, isAuthenticated]);

	return null;
};

export default NotificationInitializer;
