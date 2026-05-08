import { AppProvider } from "@/providers/providers";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { useEffect, useRef } from "react";
import { useFonts } from "expo-font";
import NotificationInitializer from "@/components/notification-intializer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	const hasHiddenSplash = useRef(false);

	const [loaded] = useFonts({
		Manrope: require("../assets/fonts/Manrope-VariableFont_wght.ttf"),
		Caveat: require("../assets/fonts/Caveat-VariableFont_wght.ttf"),
	});

	useEffect(() => {
		if (loaded && !hasHiddenSplash.current) {
			hasHiddenSplash.current = true;
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [loaded]);

	if (!loaded) return null;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AppProvider>
				<NotificationInitializer />
				<StatusBar style="auto" />
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="onboarding" />
					<Stack.Screen name="(auth)" options={{ animation: "fade" }} />
					<Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
					<Stack.Screen name="book/[id]" options={{ animation: "fade" }} />
					<Stack.Screen name="book/write-review" options={{ animation: "fade" }} />
					<Stack.Screen name="notifications" options={{ animation: "fade" }} />
					<Stack.Screen name="settings" options={{ animation: "fade" }} />
					<Stack.Screen name="edit-profile" options={{ animation: "fade" }} />
					<Stack.Screen name="change-password" options={{ animation: "fade" }} />
				</Stack>
			</AppProvider>
		</GestureHandlerRootView>
	);
}
