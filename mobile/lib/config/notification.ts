type MessagingModule = typeof import("@react-native-firebase/messaging");

const getMessaging = (): MessagingModule["default"] | null => {
	try {
		const module = require("@react-native-firebase/messaging") as MessagingModule;
		return module.default;
	} catch (error) {
		console.warn("Firebase messaging native module is not available.", error);
		return null;
	}
};

const getMessagingInstance = () => {
	const messaging = getMessaging();
	if (!messaging) return null;

	try {
		return messaging();
	} catch (error) {
		console.warn("Firebase messaging is installed but native module failed to initialize.", error);
		return null;
	}
};

export const requestNotificationPermission = async () => {
	const messaging = getMessaging();
	const messagingInstance = getMessagingInstance();
	if (!messaging || !messagingInstance) return null;

	const authStatus = await messagingInstance.requestPermission();

	const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

	if (!enabled) return null;

	const token = await messagingInstance.getToken();
	return token;
};

export const setupNotificationListeners = (syncFcmTokenFn: (token: string) => void) => {
	const messaging = getMessaging();
	const messagingInstance = getMessagingInstance();
	if (!messaging || !messagingInstance) return () => {};

	let unsubscribeOnMessage = () => {};
	let unsubscribeOnTokenRefresh = () => {};

	try {
		unsubscribeOnMessage = messagingInstance.onMessage(async (remoteMessage) => {
			console.log("Foreground:", remoteMessage);
		});

		messaging().setBackgroundMessageHandler(async (remoteMessage) => {
			console.log("Background:", remoteMessage);
		});

		unsubscribeOnTokenRefresh = messagingInstance.onTokenRefresh(async (newToken) => {
			console.log("FCM token refreshed:", newToken);
			syncFcmTokenFn(newToken);
		});
	} catch (error) {
		console.warn("Failed to set up Firebase messaging listeners.", error);
	}

	return () => {
		unsubscribeOnMessage();
		unsubscribeOnTokenRefresh();
	};
};
