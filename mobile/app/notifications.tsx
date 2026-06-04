import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/services/notification.service";
import { reactToUser } from "@/lib/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";

const Notifications = () => {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const userId = user?._id;

	const {
		mutateAsync: _reactToUser,
		isPending: isReacting,
		data: userReaction,
	} = useMutation({
		mutationKey: ["react-to-user", userId],
		mutationFn: reactToUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
		},
	});

	const { mutateAsync: _markAllAsRead, isPending: isMarkingAllAsRead } = useMutation({
		mutationKey: ["mark-all-as-read"],
		mutationFn: markAllAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
		},
	});

	const { mutateAsync: _markAsRead } = useMutation({
		mutationKey: ["mark-as-read"],
		mutationFn: markAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
			queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
		},
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		error: notificationsError,
		refetch: refetchNotifications,
	} = useInfiniteQuery({
		queryKey: ["all-notifications"],
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			getNotifications({
				cursor: pageParam,
			}),

		getNextPageParam: (lastPage) => {
			const lp = lastPage as { nextCursor?: string } | undefined;
			return lp?.nextCursor ?? undefined;
		},
	});

	const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

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
			<View className="flex-row justify-between items-center px-4 pt-3 py-4 border-b" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : theme.colors.inputBorder }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
				<Text className="flex-1 font-manrope text-xl font-bold justify-center items-center text-center" style={{ color: theme.colors.textPrimary }}>
					Notifications
				</Text>
				<TouchableOpacity onPress={async () => await _markAllAsRead()} disabled={isMarkingAllAsRead} style={{ opacity: isMarkingAllAsRead ? 0.5 : 1 }}>
					<Ionicons name="checkmark-done" size={24} color={theme.colors.primary} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{notifications.map((notification) => (
					<Pressable
						key={notification.notificationId}
						onPress={async () => {
							const [entityId, type, _] = notification.id.split("-");
							if (notification.type === "follow") {
								router.push({ pathname: "/(tabs)/profile", params: { userId: notification.userId } });
							} else if (type === "comment.like" || type === "comment.reply") {
								router.push({
									pathname: "/(tabs)/home",
									params: {
										reviewId: notification.reviewId,
										commentId: notification.commentId ?? entityId,
									},
								});
							} else if (type === "review.like" || type === "review.reply") {
								router.push({
									pathname: "/(tabs)/home",
									params: {
										reviewId: notification.reviewId ?? entityId,
										commentId: notification.commentId,
									},
								});
							}
							if (!notification.isRead) {
								await _markAsRead(notification.notificationId);
							}
						}}
					>
						<View
							className="flex-row items-center px-4 py-6 border-b"
							style={{
								borderBottomColor: isDark ? (notification.isRead ? theme.colors.accentSurface : theme.colors.inputBorder) : theme.colors.inputBorder,
								backgroundColor: notification.isRead ? "transparent" : theme.colors.accentSurface,
							}}
						>
							<View className="relative mr-4">
								{notification.type === "like_multi" ? (
									<View className="flex-row w-12 h-12 relative">
										{notification.avatars?.map((avatar, i) => (
											<Pressable onPress={() => router.push({ pathname: "/(tabs)/profile", params: { userId: notification.userId } })} key={i}>
												<Image
													source={{ uri: avatar }}
													className={`w-8 h-8 rounded-full border-2 absolute ${i === 0 ? "left-0 z-30" : i === 1 ? "left-3 z-20" : "left-6 z-10"}`}
													style={{ borderColor: theme.colors.background }}
												/>
											</Pressable>
										))}
									</View>
								) : (
									<Pressable onPress={() => router.push({ pathname: "/(tabs)/profile", params: { userId: notification.userId } })}>
										<Image source={{ uri: notification.avatar }} className="w-12 h-12 rounded-full" />
									</Pressable>
								)}
								{renderBadge(notification.type)}
							</View>

							<View className="flex-1 mr-2">
								<Text className="font-manrope text-[15px] leading-5" style={{ color: theme.colors.textPrimary }}>
									<Text className="font-manrope font-bold">{notification.user} </Text>
									{notification.text}
									{notification.target && (
										<Text className="font-manrope font-bold" style={{ color: theme.colors.primary }} onPress={() => router.push(`/book/${notification.bookId}`)}>
											{" "}
											{notification.target}
										</Text>
									)}
								</Text>
								{notification.quote && (
									<Text className="font-manrope italic mt-1" style={{ color: theme.colors.textSecondary }} numberOfLines={2}>
										"{notification.quote}"
									</Text>
								)}
								<Text className="font-manrope text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
									{notification.time}
								</Text>
							</View>

							{notification.type === "follow" && !notification.isFollowing ? (
								<TouchableOpacity
									onPress={async () => await _reactToUser({ userId: notification.userId })}
									className="px-4 py-2 rounded-full"
									style={{ backgroundColor: theme.colors.primary }}
									disabled={isReacting}
								>
									{isReacting ? (
										<ActivityIndicator size={20} color={theme.colors.onPrimary} />
									) : (
										<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.onPrimary }}>
											{userReaction?.isFollowing || notification.isFollowing ? "Unfollow" : "Follow"}
										</Text>
									)}
								</TouchableOpacity>
							) : notification.image ? (
								<Pressable onPress={() => router.push(`/book/${notification.bookId}`)}>
									<Image source={{ uri: notification.image }} className="w-12 h-16" style={{ backgroundColor: isDark ? "#2A2D38" : "#E9E9EA" }} />
								</Pressable>
							) : null}
						</View>
					</Pressable>
				))}
				{notifications.length === 0 && (
					<View className="flex-1 justify-center items-center mt-[70%]">
						<Text className="font-manrope text-lg mt-4" style={{ color: theme.colors.textSecondary }}>
							No notifications yet
						</Text>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

export default Notifications;
