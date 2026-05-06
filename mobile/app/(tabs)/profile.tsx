import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { REVIEWS_DATA } from "@/data/data";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/services/user.service";

const Profile = () => {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<string>("Reviews");
	const { isFetching: isFetchingProfile, data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: () => getProfile(),
	});

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
				<Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
					Profile
				</Text>
				<TouchableOpacity onPress={() => router.push("/settings")}>
					<Ionicons name="settings-outline" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="items-center pt-4 px-4">
					<Image source={{ uri: profile?.profileImage }} className="w-24 h-24 rounded-full mb-4" />
					<Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
						{profile?.firstName} {profile?.lastName}
					</Text>
					<Text className="text-center mt-1 mb-6 leading-6" style={{ color: theme.colors.textSecondary }}>
						{profile?.bio}
					</Text>
				</View>

				<View className="flex-row justify-around items-center w-full h-24 pt-6 pb-6 px-4 mb-4" style={{ borderTopWidth: 1, borderTopColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
					<View className="items-center pr-8" style={{ borderRightWidth: 1, borderRightColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
						<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
							{profile?.reviewsCount}
						</Text>
						<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
							Reviews
						</Text>
					</View>
					<View className="items-center pr-8" style={{ borderRightWidth: 1, borderRightColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
						<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
							{profile?.followersCount}
						</Text>
						<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
							Followers
						</Text>
					</View>
					<View className="items-center">
						<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
							{profile?.followingCount}
						</Text>
						<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
							Following
						</Text>
					</View>
				</View>

				<View className="flex-row justify-around w-full" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? theme.colors.accentSurface : "#F3F4F6" }}>
					{["Reviews", "Favorites", "Activity"].map((tab) => (
						<TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="pb-3 px-4">
							<Text className="font-semibold text-base" style={{ color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary }}>
								{tab}
							</Text>
							{activeTab === tab && <View className="h-[3px] rounded-t-full absolute bottom-0 left-0 right-0" style={{ backgroundColor: theme.colors.primary }} />}
						</TouchableOpacity>
					))}
				</View>

				<View className="flex-row flex-wrap justify-between px-4 pt-6 pb-10">
					{REVIEWS_DATA.map((item) => (
						<View key={item.id} className="w-[48%] mb-6">
							<Image source={{ uri: item.image }} className="w-full h-48 rounded-t-xl" />
							<View className="w-full px-3 py-4 rounded-b-xl gap-y-2 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
								<Text className="font-semibold mt-2" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
									{item.title}
								</Text>
								<View className="flex-row items-center my-2">
									{[1, 2, 3, 4, 5].map((star) => (
										<Ionicons key={star} name={star <= item.rating ? "star" : "star-outline"} size={14} color={theme.colors.primary} />
									))}
								</View>
								<Text className="text-xs" style={{ color: theme.colors.textSecondary }} numberOfLines={2}>
									{item.text}
								</Text>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Profile;
