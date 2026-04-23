import { useAppTheme } from "@/providers/theme";
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
	const theme = useAppTheme();
	const isDark = theme.mode === "dark";

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#0E0F13" : "#F7F7FA" }} edges={["top"]}>
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
					Profile page
				</Text>
				<Text className="mt-2 text-center" style={{ color: theme.colors.textSecondary }}>
					Your profile area will follow the app theme automatically.
				</Text>
			</View>
		</SafeAreaView>
	);
};

export default Profile;
