import Toast from "react-native-toast-message";

export const toast = {
	success: (msg: string, sub?: string) =>
		Toast.show({
			type: "success",
			text1: msg,
			text2: sub,
		}),

	error: (msg: string, sub?: string) =>
		Toast.show({
			type: "error",
			text1: msg,
			text2: sub,
		}),
};
