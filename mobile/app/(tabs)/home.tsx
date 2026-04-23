import React from "react";
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { StarRow } from "@/components/ui/star-row";
import { FEED_POSTS, TRENDING_BOOKS } from "@/data/data";
import { useAppTheme } from "@/providers/theme";

const HomeFeed = () => {
	const theme = useAppTheme();
	const isDark = theme.mode === "dark";

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#0E0F13" : "#FFFFFF" }} edges={["top"]}>
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				<View className="flex-row justify-between items-center px-4 pt-2 mb-4">
					<Text className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
						BookWorm
					</Text>
					<Image source={{ uri: "https://res.cloudinary.com/dynopc0cn/image/upload/v1775118766/default-image_cucpzx.avif" }} className="w-12 h-12 rounded-full" />
				</View>

				<View className="px-4 mb-6">
					<View className="flex-row items-center p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#141821" : "#F6F6F6" }}>
						<Ionicons name="search" size={20} color={theme.colors.textSecondary} className="mr-2" />
						<TextInput placeholder="Search books, authors, reviews..." placeholderTextColor={theme.colors.textSecondary} className="flex-1" style={{ color: theme.colors.textPrimary }} />
					</View>
				</View>

				<View className="mb-6">
					<Text className="text-lg font-semibold px-4 mb-4" style={{ color: theme.colors.textPrimary }}>
						Trending Now
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-4 gap-2">
						{TRENDING_BOOKS.map((book) => (
							<Link href={`/book/${book.id}`} key={book.id} asChild>
								<TouchableOpacity className="w-[118px]">
									<Image source={{ uri: book.image }} className="w-[118px] h-[180px] rounded-lg mb-2 bg-gray-200" />
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
					{FEED_POSTS.map((post) => (
						<View key={post.id} className="mb-8 pb-6" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? "#242937" : "#E5E7EB" }}>
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
									<Image source={{ uri: post.cover }} className="w-[90px] h-[120px] rounded-md mr-3 bg-gray-200" />
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
