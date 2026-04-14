import { AppProvider } from "@/providers/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<AppProvider>
			<StatusBar style="auto" />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="onboarding" />
			</Stack>
		</AppProvider>
	);
}
