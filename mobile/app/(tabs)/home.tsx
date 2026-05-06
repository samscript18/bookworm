import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { getTrendingBooks } from "@/lib/services/book.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getHomeFeed } from "@/lib/services/review.service";
import ReviewCard from "@/components/ui/review-card";

const HomeFeed = () => {
	const { theme } = useThemeStore();
	const { user } = useAuthStore();
	const router = useRouter();

	const { isFetching: isFetchingTrendingBooks, data: trendingBooks } = useQuery({
		queryKey: ["trending-books"],
		queryFn: () => getTrendingBooks(),
	});

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
		queryKey: ["home-feed"],
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			getHomeFeed({
				cursor: pageParam,
				limit: 20,
			}),

		getNextPageParam: (lastPage) => {
			const lp = lastPage as { nextCursor?: string } | undefined;
			return lp?.nextCursor ?? undefined;
		},
	});

	const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

	const ListHeader = () => {
		return (
			<View className="mb-6">
				<View className="flex-row justify-between items-center px-4 pt-2 mb-4">
					<Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
						BookWorm
					</Text>
					<View className="flex-row justify-center items-center gap-x-8">
						<TouchableOpacity onPress={() => router.push("/notifications")}>
							<Ionicons name="notifications-outline" size={28} color={theme.colors.textSecondary} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
							<Image source={{ uri: user?.profileImage }} className="w-12 h-12 rounded-full" />
						</TouchableOpacity>
					</View>
				</View>

				<View className="px-4 mb-6">
					<View className="rounded-2xl">
						<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
							Welcome back{user?.firstName ? `, ${user.firstName}` : user?.userName}
						</Text>
						<Text className="text-sm my-4" style={{ color: theme.colors.textSecondary }}>
							Discover what the community is reading today.
						</Text>
					</View>
				</View>

				<View className="mb-6">
					<Text className="text-lg font-semibold px-4 mb-4" style={{ color: theme.colors.textPrimary }}>
						Trending Now
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-4 gap-3">
						{isFetchingTrendingBooks ? (
							<View className="min-w-full h-40 justify-center items-center">
								<ActivityIndicator className="justify-center items-center" />
							</View>
						) : (
							trendingBooks?.map((book) => (
								<Link href={`/book/${book._id}`} key={book._id} asChild>
									<TouchableOpacity className="w-[118px]">
										<Image source={{ uri: book.coverImage }} className="w-[118px] h-[180px] rounded-lg mb-2" style={{ backgroundColor: theme.colors.surfaceMuted }} />
										<Text className="text-[13px]" style={{ color: theme.colors.textPrimary }} numberOfLines={2}>
											{book.title}
										</Text>
									</TouchableOpacity>
								</Link>
							))
						)}
						<View className="w-4" />
					</ScrollView>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<FlatList
				data={reviews}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View className="px-4">
						<ReviewCard {...item} />
					</View>
				)}
				onEndReached={() => {
					if (hasNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
				ListHeaderComponent={<ListHeader />}
				ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : <View className="h-4" />}
			/>
		</SafeAreaView>
	);
};

export default HomeFeed;
