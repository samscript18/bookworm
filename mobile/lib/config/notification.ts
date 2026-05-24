import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

export const requestNotificationPermission = async () => {
	try {
		if (!Device.isDevice) {
			console.warn("Push notifications require a physical device.");
			return null;
		}

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C",
			});
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") return null;

		const projectId = getProjectId();
		if (!projectId) {
			console.warn("Expo push token requires an EAS project ID.");
			return null;
		}

		const token = await Notifications.getExpoPushTokenAsync({ projectId });
		return token.data;
	} catch (error) {
		console.warn("Notification permission failed", error);
		return null;
	}
};

export const setupNotificationListeners = (onTokenRefreshSync: (token: string) => void) => {
	try {
		const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
			console.log("Foreground notification:", notification);
		});

		const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
			console.log("Notification response:", response);
		});

		const tokenSubscription = Notifications.addPushTokenListener(async () => {
			const token = await requestNotificationPermission();
			if (token) onTokenRefreshSync(token);
		});

		return () => {
			notificationSubscription.remove();
			responseSubscription.remove();
			tokenSubscription.remove();
		};
	} catch (error) {
		console.warn("Failed to setup notification listeners", error);
		return () => {};
	}
};
