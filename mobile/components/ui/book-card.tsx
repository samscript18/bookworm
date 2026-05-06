import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Book } from "@/types/book/book";
import { useThemeStore } from "@/store/useThemeStore";

const BookCard = ({ book, viewMode }: { book: Book; viewMode: "grid" | "list" }) => {
	const { theme } = useThemeStore();

	return (
		<Link href={`/book/${book._id}`} key={book._id} asChild>
			{viewMode === "grid" ? (
				<TouchableOpacity className="w-full mb-4">
					<View className="relative w-full">
						<Image source={{ uri: book.coverImage }} className="w-full h-52 bg-gray-200 rounded-t-xl" />
						<View className="absolute top-2 right-2 px-2 py-1 rounded-md" style={{ backgroundColor: theme.colors.primary }}>
							<Text className="text-white text-xs font-bold capitalize">{book.tags[0]}</Text>
						</View>
					</View>
					<View className="w-full p-3 rounded-b-xl gap-y-2 shadow-sm" style={{ backgroundColor: theme.mode === "dark" ? "#141821" : "#FFFFFF" }}>
						<Text className="font-semibold mt-2" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
							{book.title}
						</Text>
						<View className="flex-row items-center mt-1">
							<Ionicons name="star" size={14} color={theme.colors.primary} />
							<Text className="text-xs ml-1" style={{ color: theme.colors.textPrimary }}>
								{book.averageRating.toFixed(1)}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			) : (
				<TouchableOpacity className="w-full mb-4 px-4">
					<View className="flex-row rounded-xl overflow-hidden" style={{ backgroundColor: theme.mode === "dark" ? "#141821" : "#FFFFFF" }}>
						<Image source={{ uri: book.coverImage }} className="w-24 h-32 bg-gray-200" />
						<View className="flex-1 px-3 py-2 justify-between">
							<View>
								<Text className="font-semibold" style={{ color: theme.colors.textPrimary }} numberOfLines={2}>
									{book.title}
								</Text>
								<Text className="text-xs mt-1 capitalize" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
									{book.tags?.[0]}
								</Text>
							</View>
							<View className="flex-row items-center mt-2">
								<Ionicons name="star" size={14} color={theme.colors.primary} />
								<Text className="text-xs ml-1" style={{ color: theme.colors.textPrimary }}>
									{book.averageRating.toFixed(1)}
								</Text>
							</View>
						</View>
					</View>
				</TouchableOpacity>
			)}
		</Link>
	);
};

export default BookCard;
