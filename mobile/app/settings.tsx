import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Section, SettingRow } from "@/components/ui/settings";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/lib/services/auth.service";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
	const router = useRouter();
	const [pushEnabled, setPushEnabled] = useState<boolean>(true);
	const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
	const { isDark, toggleTheme, theme } = useThemeStore();
	const { logout: storeLogout } = useAuthStore();

	const { mutateAsync: _logout, isPending: isloggingOut } = useMutation({
		mutationKey: ["auth", "logout"],
		mutationFn: logout,
		onSuccess: async () => {
			await storeLogout();
			router.replace("/(auth)/login");
		},
	});

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row items-center px-4 py-3 border-b" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
				<TouchableOpacity onPress={() => router.back()} className="w-10">
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
				<Text className="text-xl font-bold flex-1 text-center pr-10" style={{ color: theme.colors.textPrimary }}>
					Settings
				</Text>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className="px-4">
				<View className="flex-row items-center py-6 border-b mb-4" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
					<Image source={{ uri: "https://i.pravatar.cc/150?img=5" }} className="w-16 h-16 rounded-full mr-4" />
					<View>
						<Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
							Sarah Johnson
						</Text>
						<Text className="mb-1" style={{ color: theme.colors.textSecondary }}>
							sarah.j@email.com
						</Text>
						<TouchableOpacity className="flex-row items-center">
							<Text className="font-semibold mr-1" style={{ color: theme.colors.primary }}>
								Edit profile
							</Text>
							<Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
						</TouchableOpacity>
					</View>
				</View>

				<Section title="Account">
					<SettingRow icon="mail-outline" title="Email Address" rightText="sarah.j@email.com" />
					<SettingRow icon="lock-closed-outline" title="Password" rightText="••••••••" />
					<SettingRow icon="shield-checkmark-outline" title="Privacy & Security" />
				</Section>

				<Section title="Notifications">
					<SettingRow icon="notifications-outline" title="Push Notifications" type="switch" value={pushEnabled} onValueChange={setPushEnabled} />
					<SettingRow icon="mail-unread-outline" title="Email Notifications" type="switch" value={emailEnabled} onValueChange={setEmailEnabled} />
				</Section>

				<Section title="Appearance">
					<SettingRow icon="moon-outline" title="Dark Mode" type="switch" value={isDark} onValueChange={toggleTheme} />
					<SettingRow icon="globe-outline" title="Language" rightText="English" />
				</Section>

				<Section title="Other">
					<SettingRow icon="help-circle-outline" title="Help & Support" />
					<SettingRow icon="information-circle-outline" title="About BookWorm" rightText="v1.0.0" />
				</Section>

				<TouchableOpacity
					className="border-2 py-4 rounded-2xl items-center mb-10 mt-2"
					style={{ borderColor: theme.colors.error }}
					onPress={async () => {
						const token = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
						const platform = Platform.OS === "ios" ? "ios" : "android";
						if (!token || !platform) return;
						await _logout({ token, platform });
					}}
				>
					{isloggingOut ? (
						<ActivityIndicator size="small" color={theme.colors.error} />
					) : (
						<Text className="font-bold text-lg" style={{ color: theme.colors.error }}>
							Log Out
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

export default SettingsScreen;
