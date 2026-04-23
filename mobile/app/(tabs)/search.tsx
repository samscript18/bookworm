import React from "react";
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { CATEGORIES, GENRES, TRENDING_BOOKS } from "@/data/data";
import { useAppTheme } from "@/providers/theme";

const Search = () => {
	const theme = useAppTheme();
	const isDark = theme.mode === "dark";
	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#0E0F13" : "#F7F7FA" }} edges={["top"]}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="px-4 pt-6 pb-8 rounded-b-[30px]" style={{ backgroundColor: theme.colors.primary }}>
					<Text className="text-3xl font-bold text-white mb-4">Explore</Text>
					<View className="flex-row items-center p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF" }}>
						<Ionicons name="search" size={20} color={theme.colors.textSecondary} className="mr-2" />
						<TextInput placeholder="Search books, authors..." placeholderTextColor={theme.colors.textSecondary} className="flex-1" style={{ color: theme.colors.textPrimary }} />
						<Ionicons name="options-outline" size={20} color={theme.colors.primary} />
					</View>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mt-6 mb-6">
					{GENRES.map((genre, index) => (
						<TouchableOpacity
							key={index}
							className="px-5 py-3 rounded-full mr-3 border"
							style={{
								backgroundColor: index === 0 ? theme.colors.primary : isDark ? "#141821" : "#FFFFFF",
								borderColor: index === 0 ? theme.colors.primary : isDark ? "#2A2D38" : "#E5E7EB",
							}}
						>
							<Text className="font-semibold" style={{ color: index === 0 ? "#FFFFFF" : theme.colors.textSecondary }}>
								{genre}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				<View className="px-4 mb-8">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
							Trending Now
						</Text>
						<View className="flex-row gap-x-4">
							<Ionicons name="grid-outline" size={20} color={theme.colors.primary} />
							<Ionicons name="list-outline" size={20} color={theme.colors.textSecondary} />
						</View>
					</View>

					<View className="flex-row flex-wrap justify-between">
						{TRENDING_BOOKS.map((book) => (
							<Link href={`/book/${book.id}`} key={book.id} asChild>
								<TouchableOpacity className="w-[48%] mb-4">
									<View className="relative w-full">
										<Image source={{ uri: book.image }} className="w-full h-52 bg-gray-200 rounded-t-xl" />
										<View className="absolute top-2 right-2 px-2 py-1 rounded-md" style={{ backgroundColor: theme.colors.primary }}>
											<Text className="text-white text-xs font-bold">{book.tag}</Text>
										</View>
									</View>
									<View className="w-full p-3 rounded-b-xl gap-y-2 shadow-sm" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF" }}>
										<Text className="font-semibold mt-2" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
											{book.title}
										</Text>
										<View className="flex-row items-center mt-1">
											<Ionicons name="star" size={14} color={theme.colors.primary} />
											<Text className="text-xs ml-1" style={{ color: theme.colors.textPrimary }}>
												{book.rating}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							</Link>
						))}
					</View>
				</View>

				<View className="px-4 mb-8">
					<Text className="text-lg font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
						Browse by Category
					</Text>
					<View className="flex-row flex-wrap justify-between">
						{CATEGORIES.map((category) => {
							return (
								<Link href={`/category/${category.id}`} key={category.id} asChild>
									<TouchableOpacity className="w-[48%] p-4 rounded-2xl mb-4 items-center" style={{ backgroundColor: category.color }}>
										<Ionicons name={category.icon as any} size={32} color="#FFF" className="mb-2" />
										<Text className="text-white font-bold text-lg">{category.title}</Text>
										<Text className="text-white/80 text-xs">({category.count})</Text>
									</TouchableOpacity>
								</Link>
							);
						})}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Search;
