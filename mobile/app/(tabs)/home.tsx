import React from "react";
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { StarRow } from "@/components/ui/star-row";
import { FEED_POSTS, TRENDING_BOOKS } from "@/data/data";
import { useThemeStore } from "@/store/useThemeStore";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { getHomeFeed } from "@/lib/services/review.service";

const HomeFeed = () => {
	const { theme } = useThemeStore();
	const router = useRouter();

	// const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
	// 		queryKey: ["home-feed"],
	// 		queryFn: ({ pageParam }) =>
	// 			getHomeFeed({
	// 				cursor: pageParam,
	// 				limit: 20,
	// 			}),

	// 		getNextPageParam: (lastPage) => {
	// 			return lastPage.nextCursor ?? undefined;
	// 		},
	// 	});

	// const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				<View className="flex-row justify-between items-center px-4 pt-2 mb-4">
					<Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
						BookWorm
					</Text>
					<View className="flex-row justify-center items-center gap-x-8">
						<TouchableOpacity onPress={() => router.push("/notifications")}>
							<Ionicons name="notifications-outline" size={28} color={theme.colors.textSecondary} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
							<Image source={{ uri: "https://res.cloudinary.com/dynopc0cn/image/upload/v1775118766/default-image_cucpzx.avif" }} className="w-12 h-12 rounded-full" />
						</TouchableOpacity>
					</View>
				</View>

				<View className="px-4 mb-6">
					<View className="flex-row items-center p-3 rounded-2xl" style={{ backgroundColor: theme.colors.surfaceMuted }}>
						<Ionicons name="search" size={20} color={theme.colors.textSecondary} className="mr-2" />
						<TextInput
							placeholder="Search books, authors, reviews..."
							placeholderTextColor={theme.colors.textSecondary}
							className="flex-1"
							style={{
								color: theme.colors.textPrimary,
							}}
						/>
					</View>
				</View>

				<View className="mb-6">
					<Text className="text-lg font-semibold px-4 mb-4" style={{ color: theme.colors.textPrimary }}>
						Trending Now
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-4 gap-3">
						{TRENDING_BOOKS.map((book) => (
							<Link href={`/book/${book.id}`} key={book.id} asChild>
								<TouchableOpacity className="w-[118px]">
									<Image source={{ uri: book.image }} className="w-[118px] h-[180px] rounded-lg mb-2" style={{ backgroundColor: theme.colors.surfaceMuted }} />
									<Text className="text-[13px]" style={{ color: theme.colors.textPrimary }} numberOfLines={2}>
										{book.title}
									</Text>
								</TouchableOpacity>
							</Link>
						))}
						<View className="w-4" />
					</ScrollView>
				</View>

				<View className="px-4 mt-4">
					{/* <FlatList
						data={reviews}
						keyExtractor={(item) => item._id}
						renderItem={({ item }) => <ReviewCard review={item} />}
						onEndReached={() => {
							if (hasNextPage) fetchNextPage();
						}}
						onEndReachedThreshold={0.5}
						ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
					/> */}
					{FEED_POSTS.map((post) => (
						<View key={post.id} className="mb-8 pb-6" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceMuted }}>
							<View className="flex-row items-center justify-between mb-3">
								<View className="flex-row items-center">
									<Image source={{ uri: post.avatar }} className="w-12 h-12 rounded-full mr-3" />
									<View className="gap-y-1.5">
										<Text className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
											{post.user}
										</Text>
										<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
											{post.time}
										</Text>
									</View>
								</View>
								<Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
							</View>

							<Link href={`/book/${post.id}`} asChild>
								<TouchableOpacity className="flex-row my-4">
									<Image source={{ uri: post.cover }} className="w-[90px] h-[120px] rounded-md mr-3" style={{ backgroundColor: theme.colors.surfaceMuted }} />
									<View className="flex-1 justify-start gap-y-2">
										<Text className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
											{post.bookTitle}
										</Text>
										<Text className="text-base mb-1" style={{ color: theme.colors.textSecondary }}>
											{post.author}
										</Text>
										<View className="flex-row items-center gap-1.5">
											<StarRow rating={post.rating} size={20} />
											<Text className="text-sm ml-2" style={{ color: theme.colors.textSecondary }}>
												{post.rating}/5
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							</Link>

							<Text className="leading-6 mb-4" style={{ color: theme.colors.textPrimary }}>
								{post.text}
							</Text>

							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center space-x-6">
									<TouchableOpacity className="flex-row items-center">
										<Ionicons name="heart-outline" size={20} color={theme.colors.textSecondary} />
										<Text className="ml-1" style={{ color: theme.colors.textSecondary }}>
											{post.likes}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity className="flex-row items-center ml-4">
										<Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
										<Text className="ml-1" style={{ color: theme.colors.textSecondary }}>
											{post.comments}
										</Text>
									</TouchableOpacity>
									<TouchableOpacity className="ml-4">
										<Ionicons name="share-social-outline" size={20} color={theme.colors.textSecondary} />
									</TouchableOpacity>
								</View>
								<TouchableOpacity>
									<Ionicons name="bookmark-outline" size={20} color={theme.colors.textSecondary} />
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default HomeFeed;
