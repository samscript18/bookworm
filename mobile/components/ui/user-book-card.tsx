import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { use } from "react";
import { StarRow } from "./star-row";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/useThemeStore";
import { Book } from "@/types/book/book";

const UserBookCard = (book: Book) => {
	const { theme } = useThemeStore();
	return (
		<TouchableOpacity
			key={book._id}
			activeOpacity={0.85}
			className="flex-row mb-5 rounded-2xl p-3"
			style={{
				backgroundColor: theme.colors.surface,
				borderColor: theme.colors.border,
				borderWidth: 1,
			}}
		>
			<Image source={{ uri: book.coverImage }} className="w-20 h-28 rounded-xl mr-4 bg-gray-200" />

			<View className="flex-1 justify-between">
				<View>
					<Text className="font-bold text-base" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
						{book.title}
					</Text>

					<Text className="text-sm mt-1 mb-6" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
						{book.author}
					</Text>

					<StarRow rating={book.averageRating} size={14} />
				</View>
			</View>

			<View className="justify-center pl-2">
				<Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
			</View>
		</TouchableOpacity>
	);
};

export default UserBookCard;
