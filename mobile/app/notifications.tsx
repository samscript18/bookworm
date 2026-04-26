import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { NOTIFICATIONS } from "@/data/data";
import { useThemeStore } from "@/store/useThemeStore";

const Notifications = () => {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();

	const renderBadge = (type: string) => {
		let icon = "person";
		if (type.includes("like")) icon = "heart";
		if (type === "comment") icon = "chatbubble";

		return (
			<View className="absolute -bottom-1 -right-1 rounded-full p-1 border-2" style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.background }}>
				<Ionicons name={icon as any} size={10} color={theme.colors.onPrimary} />
			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between items-center px-4 pt-3 py-4 border-b" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
				<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
					Notifications
				</Text>
				<TouchableOpacity>
					<Ionicons name="options-outline" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{NOTIFICATIONS.map((notif) => (
					<View key={notif.id} className="flex-row items-center px-4 py-6 border-b" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
						<View className="relative mr-4">
							{notif.type === "like_multi" ? (
								<View className="flex-row w-12 h-12 relative">
									{notif.avatars?.map((av, i) => (
										<Image
											key={i}
											source={{ uri: av }}
											className={`w-8 h-8 rounded-full border-2 absolute ${i === 0 ? "left-0 z-30" : i === 1 ? "left-3 z-20" : "left-6 z-10"}`}
											style={{ borderColor: theme.colors.background }}
										/>
									))}
								</View>
							) : (
								<Image source={{ uri: notif.avatar }} className="w-12 h-12 rounded-full" />
							)}
							{renderBadge(notif.type)}
						</View>

						<View className="flex-1 mr-2">
							<Text className="text-[15px] leading-5" style={{ color: theme.colors.textPrimary }}>
								<Text className="font-bold">{notif.user} </Text>
								{notif.text}
								{notif.target && (
									<Text className="font-bold" style={{ color: theme.colors.primary }}>
										{" "}
										{notif.target}
									</Text>
								)}
							</Text>
							{notif.quote && (
								<Text className="italic mt-1" style={{ color: theme.colors.textSecondary }} numberOfLines={2}>
									"{notif.quote}"
								</Text>
							)}
							<Text className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
								{notif.time}
							</Text>
						</View>

						{notif.type === "follow" ? (
							<TouchableOpacity className="px-4 py-2 rounded-full" style={{ backgroundColor: theme.colors.primary }}>
								<Text className="font-semibold text-sm" style={{ color: theme.colors.onPrimary }}>
									Follow
								</Text>
							</TouchableOpacity>
						) : notif.image ? (
							<Image source={{ uri: notif.image }} className="w-12 h-16" style={{ backgroundColor: isDark ? "#2A2D38" : "#E9E9EA" }} />
						) : null}
					</View>
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

export default Notifications;
