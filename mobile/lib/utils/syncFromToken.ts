import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ApiResponse } from "@/types/api";
import { fcmTokenDto } from "@/types/user/user.dto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UseMutateFunction } from "@tanstack/react-query";

type MutateType = UseMutateFunction<ApiResponse<{}, {}>, Error, fcmTokenDto, unknown>;

export const syncFcmToken = async (token: string, mutate: MutateType) => {
	if (!token) return;

	try {
		const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);

		if (storedToken !== token) {
			mutate(
				{ fcmToken: token },
				{
					onSuccess: async () => {
						await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
						console.log("FCM token synced successfully");
					},
				},
			);
		} else {
			console.log("FCM token already up to date");
		}
	} catch (err) {
		console.log("FCM sync error:", err);
	}
};
