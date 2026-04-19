import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/store/useAuthStore";
import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";

import { updateFcmToken } from "@/lib/services/user.service";
import { syncFcmToken } from "@/lib/utils/syncFromToken";

const Index = () => {
	const { hasCompletedOnboarding, isAuthenticated } = useAuthStore();

	const { mutate: updateToken } = useMutation({
		mutationKey: ["user", "update-fcm-token"],
		mutationFn: updateFcmToken,
	});

	useEffect(() => {
		let isMounted = true;

		const initNotifications = async () => {
			try {
				const token = await requestNotificationPermission();

				if (token && isMounted) {
					syncFcmToken(token, updateToken);
					console.log("🔥 FCM Token:", token);
				}
			} catch (error) {
				console.error("Notification init failed:", error);
			}
		};

		initNotifications();

		const cleanup = setupNotificationListeners((newToken: string) => {
			syncFcmToken(newToken, updateToken);
		});

		return () => {
			isMounted = false;
			cleanup?.();
		};
	}, [updateToken]);

	if (!hasCompletedOnboarding) {
		return <Redirect href="/onboarding" />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return <Redirect href="/home" />;
};

export default Index;
