import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ApiResponse } from "@/types/api";
import { fcmTokenDto } from "@/types/user/user.dto";
import { getSecureItem, setSecureItem } from "@/lib/config/secure-storage";
import { UseMutateFunction } from "@tanstack/react-query";

type MutateType = UseMutateFunction<ApiResponse<{}, {}>, Error, fcmTokenDto, unknown>;

let isSyncing = false;
let lastSyncedToken: string | null = null;

export const syncFcmToken = async (token: string, platform: "ios" | "android", mutate: MutateType) => {
	if (!token) return;
	if (token === lastSyncedToken) return;
	if (isSyncing) return;

	const storedToken = await getSecureItem(STORAGE_KEYS.FCM_TOKEN);
	if (storedToken === token) {
		lastSyncedToken = token;
		return;
	}

	try {
		isSyncing = true;
		mutate(
			{ fcmToken: token, platform },
			{
				onSuccess: async () => {
					await setSecureItem(STORAGE_KEYS.FCM_TOKEN, token);
					lastSyncedToken = token;
					console.log("Push token synced successfully");
				},
				onSettled: () => {
					isSyncing = false;
				},
			},
		);
	} catch (err) {
		isSyncing = false;
		console.log("Push token sync error:", err);
	}
};
