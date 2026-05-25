import React, { useMemo, useState } from "react";
import { FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorMessage } from "@/components/ui/error-message";
import { UserListSkeleton } from "@/components/ui/skeleton";
import { getUserConnections, reactToUser } from "@/lib/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { UserConnection } from "@/types/user/user";

type ConnectionTab = "followers" | "following";

export default function ConnectionsScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { theme, isDark } = useThemeStore();
	const { user } = useAuthStore();
	const params = useLocalSearchParams<{ userId?: string; initialTab?: ConnectionTab; userName?: string }>();
	const profileId = params.userId ?? user?._id ?? "";
	const [activeTab, setActiveTab] = useState<ConnectionTab>(params.initialTab === "following" ? "following" : "followers");
	const [search, setSearch] = useState<string>("");

	const queryParams = useMemo(() => ({ type: activeTab, search: search.trim() || undefined }), [activeTab, search]);

	const {
		data,
		isLoading,
		isRefetching,
		error,
		refetch,
	} = useQuery({
		queryKey: ["user-connections", profileId, queryParams],
		queryFn: () => getUserConnections(profileId, queryParams),
		enabled: Boolean(profileId),
	});

	const { mutate: followUser, isPending: isFollowing } = useMutation({
		mutationFn: reactToUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-connections"] });
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
	});

	const renderUser = ({ item }: { item: UserConnection }) => {
		const isSelf = item._id === user?._id;

		return (
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={() => router.push({ pathname: "/(tabs)/profile", params: { userId: item._id } })}
				className="flex-row items-center px-4 py-4 mb-3 rounded-2xl"
				style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}
			>
				<Image source={{ uri: item.profileImage }} className="w-12 h-12 rounded-full mr-3" />
				<View className="flex-1">
					<Text className="font-manrope text-base font-bold" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
						{item.firstName} {item.lastName}
					</Text>
					<Text className="font-manrope text-sm mt-0.5" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
						@{item.userName}
					</Text>
				</View>

				{!isSelf && (
					<TouchableOpacity
						disabled={isFollowing}
						onPress={() => followUser({ userId: item._id })}
						className="px-4 py-2 rounded-full"
						style={{ backgroundColor: item.isFollowing ? "transparent" : theme.colors.primary, borderWidth: 1, borderColor: theme.colors.primary }}
					>
						<Text className="font-manrope text-xs font-bold" style={{ color: item.isFollowing ? theme.colors.primary : theme.colors.onPrimary }}>
							{item.isFollowing ? "Following" : "Follow"}
						</Text>
					</TouchableOpacity>
				)}
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="px-4 pt-2 pb-4">
				<View className="flex-row items-center justify-between mb-4">
					<TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
						<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
					</TouchableOpacity>
					<Text className="font-manrope text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
						{params.userName ? `@${params.userName}` : "Connections"}
					</Text>
					<View className="w-10" />
				</View>

				<View className="flex-row p-1 rounded-2xl mb-4" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF", borderWidth: 1, borderColor: theme.colors.border }}>
					{(["followers", "following"] as ConnectionTab[]).map((tab) => (
						<TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="flex-1 py-3 rounded-xl" style={{ backgroundColor: activeTab === tab ? theme.colors.primary : "transparent" }}>
							<Text className="font-manrope text-center font-bold capitalize" style={{ color: activeTab === tab ? theme.colors.onPrimary : theme.colors.textSecondary }}>
								{tab}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<View className="flex-row items-center px-4 py-3 rounded-2xl" style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
					<Ionicons name="search" size={18} color={theme.colors.textSecondary} />
					<TextInput
						className="flex-1 ml-3 font-manrope"
						style={{ color: theme.colors.textPrimary }}
						placeholder="Search names or usernames"
						placeholderTextColor={theme.colors.textSecondary}
						value={search}
						onChangeText={setSearch}
						autoCapitalize="none"
					/>
				</View>
			</View>

			{error ? (
				<ErrorMessage message="We could not load this list. Please check your connection and try again." onRetry={() => refetch()} />
			) : isLoading ? (
				<UserListSkeleton />
			) : (
				<FlatList
					data={data ?? []}
					keyExtractor={(item) => item._id}
					renderItem={renderUser}
					contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
					refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
					ListEmptyComponent={
						<View className="items-center pt-24 px-8">
							<Ionicons name="people-outline" size={64} color={theme.colors.textMuted} />
							<Text className="font-manrope text-base font-semibold mt-4 text-center" style={{ color: theme.colors.textPrimary }}>
								No {activeTab} found
							</Text>
							<Text className="font-manrope text-sm mt-2 text-center" style={{ color: theme.colors.textSecondary }}>
								Try another search term.
							</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}
