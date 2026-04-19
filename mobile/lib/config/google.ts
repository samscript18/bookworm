import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/constants/env";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
	webClientId: GOOGLE_WEB_CLIENT_ID,
	iosClientId: GOOGLE_IOS_CLIENT_ID,
});

export const signInWithGoogle = async () => {
	await GoogleSignin.hasPlayServices();

	const userInfo = await GoogleSignin.signIn();

	const tokens = await GoogleSignin.getTokens();

	return {
		user: userInfo.data?.user,
		idToken: tokens.idToken,
	};
};
