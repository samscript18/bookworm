import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/providers/theme";

const TabsLayout = () => {
	const insets = useSafeAreaInsets();
	const theme = useAppTheme();
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.colors.primary,
				tabBarInactiveTintColor: theme.colors.textSecondary,
				headerTitleStyle: {
					color: theme.colors.primary,
					fontWeight: "800",
				},
				headerShadowVisible: false,
				tabBarStyle: {
					backgroundColor: theme.colors.background,
					borderTopWidth: 1,
					borderTopColor: theme.colors.dot,
					paddingTop: 5,
					paddingBottom: insets.bottom,
					height: 60 + insets.bottom,
				},
			}}
		>
			<Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
			<Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }} />
			<Tabs.Screen name="library" options={{ title: "Library", tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} /> }} />
			<Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
		</Tabs>
	);
};

export default TabsLayout;
