import React, { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBook } from "@/lib/services/book.service";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { addReview } from "@/lib/services/review.service";
import { AddReviewType } from "@/types/review/review.dto";

export default function WriteReview() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const [rating, setRating] = useState<number>(4);
	const [reviewText, setReviewText] = useState<string>("");
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState<string>("");
	const queryClient = useQueryClient();

	const params = useLocalSearchParams<{
		bookId?: string;
		bookTitle?: string;
		author?: string;
		cover?: string;
	}>();

	const { data: book } = useQuery({
		queryKey: ["book", params.bookId],
		queryFn: () => getBook(params.bookId!),
	});

	const { mutateAsync: _addReview, isPending: isAddingReview } = useMutation({
		mutationKey: ["add-review"],
		mutationFn: ({ bookId, data }: AddReviewType) => addReview(bookId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["home-feed"] });
			router.replace("/(tabs)/home");
		},
	});

	const bottomSheetRef = useRef<ActionSheetRef>(null);

	const openBottomSheet = () => {
		bottomSheetRef.current?.show();
	};

	const closeBottomSheet = () => {
		bottomSheetRef.current?.hide();
	};

	const handleAddTag = () => {
		const trimmed = newTag.trim();

		if (!trimmed) return;

		if (!tags.includes(trimmed)) {
			setTags((prev) => [...prev, trimmed]);
		}

		setNewTag("");
		closeBottomSheet();
	};

	const bookTitle = typeof params.bookTitle === "string" ? params.bookTitle : book?.title;

	const author = typeof params.author === "string" ? params.author : book?.author;

	const cover = typeof params.cover === "string" ? params.cover : book?.coverImage;

	return (
		<SafeAreaView
			className="flex-1"
			style={{
				backgroundColor: isDark ? "#0E0F13" : "#FFFFFF",
			}}
			edges={["top"]}
		>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
				<View
					className="flex-row items-center justify-between px-4 py-4"
					style={{
						borderBottomWidth: 1,
						borderBottomColor: isDark ? "#20232D" : "#F3F4F6",
						backgroundColor: isDark ? "#0E0F13" : "#FFFFFF",
					}}
				>
					<TouchableOpacity onPress={() => router.back()} className="w-10">
						<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
					</TouchableOpacity>

					<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
						Write Review
					</Text>

					<View className="w-10" />
				</View>

				<ScrollView keyboardShouldPersistTaps="handled" className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
					<View className="flex-row items-center mb-8">
						<Image source={{ uri: cover }} className="w-12 h-16 rounded-md mr-3 bg-gray-200" />

						<View className="flex-1 gap-y-2">
							<Text className="font-bold text-lg" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
								{bookTitle}
							</Text>

							<Text
								style={{
									color: theme.colors.textSecondary,
								}}
							>
								by {author}
							</Text>
						</View>
					</View>

					<View className="items-center mb-8">
						<Text className="text-base font-semibold mb-3 self-start" style={{ color: theme.colors.textPrimary }}>
							Your Rating
						</Text>

						<View className="flex-row">
							{[1, 2, 3, 4, 5].map((star) => (
								<TouchableOpacity key={star} onPress={() => setRating(star)} className="px-1">
									<Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color={star <= rating ? theme.colors.primary : isDark ? "#4B5060" : "#D3D3D3"} />
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View className="mb-8">
						<Text className="text-base font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
							Your Thoughts
						</Text>

						<View
							className="rounded-2xl p-4 h-96"
							style={{
								borderWidth: 1,
								borderColor: theme.colors.primary,
								backgroundColor: isDark ? "#141821" : "#FFFFFF",
							}}
						>
							<TextInput
								className="flex-1 text-base leading-6"
								style={{
									color: theme.colors.textPrimary,
								}}
								placeholder="What did you think of the book?"
								placeholderTextColor={isDark ? "#8C93A4" : "#91919F"}
								multiline
								textAlignVertical="top"
								value={reviewText}
								onChangeText={setReviewText}
								maxLength={2000}
							/>
						</View>
					</View>

					<View className="mb-10">
						<Text className="text-base font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
							Add Tags (Optional)
						</Text>

						<View className="flex-row flex-wrap mb-4">
							{tags.map((tag) => (
								<View
									key={tag}
									className="flex-row items-center px-4 py-2 rounded-full mr-2 mb-2"
									style={{
										backgroundColor: isDark ? "#221A30" : "#F2E8FF",
										borderWidth: 1,
										borderColor: isDark ? "#4A3A68" : "#E9D7FF",
									}}
								>
									<Text
										className="font-medium mr-1"
										style={{
											color: theme.colors.primary,
										}}
									>
										{tag}
									</Text>

									<TouchableOpacity onPress={() => setTags((prev) => prev.filter((t) => t !== tag))}>
										<Ionicons name="close" size={16} color={theme.colors.primary} />
									</TouchableOpacity>
								</View>
							))}

							<TouchableOpacity
								onPress={openBottomSheet}
								className="flex-row items-center px-4 py-2 rounded-full mb-2"
								style={{
									borderWidth: 1,
									borderStyle: "dashed",
									borderColor: theme.colors.textSecondary,
								}}
							>
								<Ionicons name="add" size={16} color={theme.colors.textSecondary} />

								<Text
									className="ml-1"
									style={{
										color: theme.colors.textSecondary,
									}}
								>
									Add Tag
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>

				<View
					className="px-5 py-8"
					style={{
						borderTopWidth: 1,
						borderTopColor: isDark ? "#20232D" : "#F3F4F6",
						backgroundColor: isDark ? "#0E0F13" : "#FFFFFF",
					}}
				>
					<TouchableOpacity
						className="py-4 rounded-2xl items-center"
						style={{ backgroundColor: theme.colors.primary }}
						onPress={() => _addReview({ bookId: params.bookId!, data: { rating, content: reviewText, tags } })}
					>
						{isAddingReview ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-lg font-bold">Submit Review</Text>}
					</TouchableOpacity>
				</View>

				<ActionSheet
					ref={bottomSheetRef}
					gestureEnabled
					containerStyle={{
						backgroundColor: isDark ? "#141821" : "#FFFFFF",
						borderTopLeftRadius: 24,
						borderTopRightRadius: 24,
						paddingBottom: 10,
					}}
					indicatorStyle={{
						backgroundColor: isDark ? "#666" : "#CCC",
						width: 40,
					}}
				>
					<View className="px-5 pt-3 pb-6">
						<View className="mb-5">
							<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
								Create New Tag
							</Text>

							<Text
								className="text-sm mt-1"
								style={{
									color: isDark ? "#8C93A4" : "#6B7280",
								}}
							>
								Add a label to organize your items better
							</Text>
						</View>

						<View
							style={{
								borderRadius: 18,
								borderWidth: 1,
								borderColor: theme.colors.primary,
								backgroundColor: isDark ? "#141821" : "#FFFFFF",
								paddingHorizontal: 14,
								paddingVertical: 4,
								marginBottom: 18,
							}}
						>
							<TextInput
								value={newTag}
								onChangeText={setNewTag}
								placeholder="e.g. Work, Personal, Finance"
								placeholderTextColor={isDark ? "#8C93A4" : "#9CA3AF"}
								style={{
									color: theme.colors.textPrimary,
									fontSize: 16,
									paddingVertical: 12,
								}}
							/>
						</View>

						<TouchableOpacity
							onPress={handleAddTag}
							activeOpacity={0.85}
							style={{
								backgroundColor: theme.colors.primary,
								paddingVertical: 14,
								borderRadius: 16,
								alignItems: "center",
								shadowColor: "#000",
								shadowOpacity: 0.15,
								shadowRadius: 10,
								shadowOffset: { width: 0, height: 6 },
								elevation: 4,
							}}
						>
							<Text className="text-white font-semibold text-base">Add Tag</Text>
						</TouchableOpacity>
					</View>
				</ActionSheet>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
