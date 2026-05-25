import { Alert, View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { StarRow } from "./star-row";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/useThemeStore";
import { Book } from "@/types/book/book";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBook } from "@/lib/services/book.service";
import { toast } from "@/lib/utils/toast";

const UserBookCard = (book: Book) => {
	const { theme } = useThemeStore();
	const router = useRouter();
	const queryClient = useQueryClient();

	const { mutate: removeFavorite, isPending } = useMutation({
		mutationKey: ["remove-favorite-book", book._id],
		mutationFn: saveBook,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["saved-books"] });
			toast.success("Book removed from favorites");
		},
		onError: () => toast.error("Failed to remove book"),
	});

	const confirmRemove = () => {
		Alert.alert(book.title, "Remove this book from your favorites?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Remove", style: "destructive", onPress: () => removeFavorite(book._id) },
		]);
	};

	return (
		<TouchableOpacity
			key={book._id}
			activeOpacity={0.85}
			className="flex-row mb-5 rounded-2xl p-3"
			onPress={() => router.push(`/book/${book._id}`)}
			style={{
				backgroundColor: theme.colors.surface,
				borderColor: theme.colors.border,
				borderWidth: 1,
			}}
		>
			<Image source={{ uri: book.coverImage }} className="w-20 h-28 rounded-xl mr-4 bg-gray-200" />

			<View className="flex-1 justify-between">
				<View>
					<Text className="font-manrope font-bold text-base" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
						{book.title}
					</Text>

					<Text className="font-manrope text-sm mt-1 mb-6" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
						{book.author}
					</Text>

					<StarRow rating={book.averageRating} size={14} />
				</View>
			</View>

			<View className="justify-center pl-2">
				<TouchableOpacity disabled={isPending} onPress={confirmRemove} className="w-9 h-9 items-center justify-center">
					<Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};

export default UserBookCard;
