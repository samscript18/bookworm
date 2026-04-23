import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";
import { updateFcmToken } from "@/lib/services/user.service";
import { syncFcmToken } from "@/lib/utils/syncFromToken";
import { useAuthStore } from "@/store/useAuthStore";

const NotificationInitializer = () => {
	const { isAuthenticated } = useAuthStore();

	const { mutate: updateToken } = useMutation({
		mutationKey: ["user", "update-fcm-token"],
		mutationFn: updateFcmToken,
	});

	useEffect(() => {
    if (!isAuthenticated) return;

		const initNotifications = async () => {
			try {
				const token = await requestNotificationPermission();

				if (token) {
					syncFcmToken(token, updateToken);
				}
			} catch (error) {
				console.error("Notification init failed:", error);
			}
		};

		initNotifications();

		const cleanup = setupNotificationListeners((newToken: string) => {
			syncFcmToken(newToken, updateToken);
		});

		return cleanup;
	}, [updateToken, isAuthenticated]);

	return null;
};

export default NotificationInitializer;
