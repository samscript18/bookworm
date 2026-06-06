import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";
import { updateFcmToken } from "@/lib/services/user.service";
import { syncFcmToken } from "@/lib/utils/syncFromToken";
import { useAuthStore } from "@/store/useAuthStore";
import { AppState, Platform } from "react-native";

const NotificationInitializer = () => {
	const { isAuthenticated } = useAuthStore();
	const hasInitialized = useRef(false);
	const lastTokenRef = useRef<string | null>(null);

	const { mutate: updateToken } = useMutation({
		mutationKey: ["user", "update-fcm-token"],
		mutationFn: updateFcmToken,
	});

	useEffect(() => {
		if (!isAuthenticated) {
			hasInitialized.current = false;
			return;
		}

		const platform = Platform.OS === "ios" ? "ios" : "android";
		if (!platform) return;

		const initNotifications = async () => {
			if (hasInitialized.current || AppState.currentState !== "active") return;

			hasInitialized.current = true;
			try {
				const token = await requestNotificationPermission();
				console.log("Device push token:", token);

				if (token && token !== lastTokenRef.current) {
					lastTokenRef.current = token;
					await syncFcmToken(token, platform, updateToken);
				}
			} catch (error) {
				console.error("Notification init failed:", error);
			}
		};

		initNotifications();
		const appStateSubscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				initNotifications();
			}
		});

		let isMounted = true;
		let cleanup = () => {};
		setupNotificationListeners((newToken: string) => {
			if (!newToken || newToken === lastTokenRef.current) return;
			lastTokenRef.current = newToken;
			syncFcmToken(newToken, platform, updateToken);
		}).then((removeListeners) => {
			if (isMounted) {
				cleanup = removeListeners;
				return;
			}

			removeListeners();
		});

		return () => {
			isMounted = false;
			cleanup();
			appStateSubscription.remove();
		};
	}, [updateToken, isAuthenticated]);

	return null;
};

export default NotificationInitializer;
