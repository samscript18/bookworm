import Constants, { ExecutionEnvironment } from "expo-constants";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let messagingModule: any = null;

const getMessagingModule = () => {
	if (isExpoGo) return null;

	if (!messagingModule) {
		try {
			messagingModule = require("@react-native-firebase/messaging");
		} catch (error) {
			console.warn("Firebase messaging not available", error);
			return null;
		}
	}

	return messagingModule;
};

const getMessagingInstance = () => {
	const module = getMessagingModule();
	if (!module) return null;

	try {
		return module.getMessaging();
	} catch (error) {
		console.warn("Failed to initialize Firebase messaging", error);
		return null;
	}
};

export const requestNotificationPermission = async () => {
	const module = getMessagingModule();
	const messaging = getMessagingInstance();
	if (!module || !messaging) return null;

	try {
		const authStatus = await module.requestPermission(messaging);

		const enabled = authStatus === module.AuthorizationStatus.AUTHORIZED || authStatus === module.AuthorizationStatus.PROVISIONAL;

		if (!enabled) return null;

		await module.registerDeviceForRemoteMessages(messaging);

		const token = await module.getToken(messaging);
		return token;
	} catch (error) {
		console.warn("Notification permission failed", error);
		return null;
	}
};

export const setupNotificationListeners = (onTokenRefreshSync: (token: string) => void) => {
	const module = getMessagingModule();
	const messaging = getMessagingInstance();
	if (!module || !messaging) return () => {};

	let unsubscribeOnMessage = () => {};
	let unsubscribeOnTokenRefresh = () => {};

	try {
		unsubscribeOnMessage = module.onMessage(messaging, async (remoteMessage: any) => {
			console.log("📩 Foreground notification:", remoteMessage);
		});

		unsubscribeOnTokenRefresh = module.onTokenRefresh(messaging, (token: string) => {
			console.log("🔄 FCM token refreshed:", token);
			onTokenRefreshSync(token);
		});

		module.setBackgroundMessageHandler(messaging, async (remoteMessage: any) => {
			console.log("🌙 Background notification:", remoteMessage);
		});
	} catch (error) {
		console.warn("Failed to setup notification listeners", error);
	}

	return () => {
		unsubscribeOnMessage?.();
		unsubscribeOnTokenRefresh?.();
	};
};
