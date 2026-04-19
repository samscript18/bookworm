import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { requestNotificationPermission, setupNotificationListeners } from "@/lib/config/notification";
import { useMutation } from "@tanstack/react-query";
import { updateFcmToken } from "@/lib/services/user.service";
import { syncFcmToken } from "@/lib/utils/syncFromToken";

const Index = () => {
	const { hasCompletedOnboarding, isAuthenticated } = useAuthStore();

	const { mutate: _updateFcmToken } = useMutation({
		mutationKey: ["user", "update-fcm-token"],
		mutationFn: updateFcmToken,
	});

	useEffect(() => {
		const init = async () => {
			try {
				const token = await requestNotificationPermission();
				if (token) {
					syncFcmToken(token, _updateFcmToken);
				}
				console.log("FCM Token:", token);
			} catch (error) {
				console.error("Failed to initialize notifications", error);
			}
		};

		init();
		const cleanup = setupNotificationListeners((token: string) => {
			syncFcmToken(token, _updateFcmToken);
		});

		return cleanup;
	}, [_updateFcmToken]);

	if (!hasCompletedOnboarding) {
		return <Redirect href="/onboarding" />;
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return <Redirect href="/home" />;
};

export default Index;
