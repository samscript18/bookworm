import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function AuthLayout() {
	return (
		<>
			<StatusBar style="auto" />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="signup-option" />
				<Stack.Screen name="signup" />
				<Stack.Screen name="login" />
				<Stack.Screen name="forgot-password" />
				<Stack.Screen name="otp-verify" />
			</Stack>
		</>
	);
}
