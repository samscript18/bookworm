import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ApiResponse } from "@/types/api";
import { fcmTokenDto } from "@/types/user/user.dto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UseMutateFunction } from "@tanstack/react-query";

type MutateType = UseMutateFunction<ApiResponse<{}, {}>, Error, fcmTokenDto, unknown>;

export const syncFcmToken = async (token: string, platform: "ios" | "android", mutate: MutateType) => {
	if (!token) return;

	try {
		mutate(
			{ fcmToken: token, platform },
			{
				onSuccess: async () => {
					await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
					console.log("FCM token synced successfully");
				},
			},
		);
	} catch (err) {
		console.log("FCM sync error:", err);
	}
};
