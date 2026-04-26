import { useThemeStore } from "@/store/useThemeStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function AuthLayout() {
	const { theme } = useThemeStore();
	return (
		<>
			<StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="signup-option" options={{ animation: "fade" }} />
				<Stack.Screen name="signup" options={{ animation: "fade" }} />
				<Stack.Screen name="login" options={{ animation: "fade" }} />
				<Stack.Screen name="forgot-password" options={{ animation: "fade" }} />
				<Stack.Screen name="otp-verify" options={{ animation: "fade" }} />
			</Stack>
		</>
	);
}
