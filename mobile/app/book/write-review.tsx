import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/providers/theme";

type ReviewTag = "Emotional" | "Inspiring" | "Thriller" | "Page-turner" | "Thought-provoking";

export default function WriteReview() {
	const router = useRouter();
	const theme = useAppTheme();
	const isDark = theme.mode === "dark";
	const params = useLocalSearchParams<{
		bookId?: string;
		bookTitle?: string;
		author?: string;
		cover?: string;
	}>();

	const [rating, setRating] = useState(4);
	const [reviewText, setReviewText] = useState("");
	const [tags, setTags] = useState<ReviewTag[]>(["Emotional", "Inspiring"]);

	const suggestions: ReviewTag[] = ["Thriller", "Page-turner", "Thought-provoking"];

	const selectedTagSet = useMemo(() => new Set(tags), [tags]);

	const bookTitle = typeof params.bookTitle === "string" ? params.bookTitle : "The Midnight Library";
	const author = typeof params.author === "string" ? params.author : "Matt Haig";
	const cover = typeof params.cover === "string" ? params.cover : "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png";

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#0E0F13" : "#FFFFFF" }} edges={["top"]}>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
				<View className="flex-row items-center justify-between px-4 py-4" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? "#20232D" : "#F3F4F6", backgroundColor: isDark ? "#0E0F13" : "#FFFFFF" }}>
					<TouchableOpacity onPress={() => router.back()} className="w-10">
						<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
					</TouchableOpacity>
					<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
						Write Review
					</Text>
					<View className="w-10" />
				</View>

				<ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
					<View className="flex-row items-center mb-8">
						<Image source={{ uri: cover }} className="w-12 h-16 rounded-md mr-3 bg-gray-200" />
						<View className="flex-1">
							<Text className="font-bold text-lg" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
								{bookTitle}
							</Text>
							<Text style={{ color: theme.colors.textSecondary }}>by {author}</Text>
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
						<Text className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
							Tap to rate
						</Text>
					</View>

					<View className="mb-8">
						<Text className="text-base font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
							Your Thoughts
						</Text>
						<View className="rounded-2xl p-4 h-48" style={{ borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: isDark ? "#141821" : "#FFFFFF" }}>
							<TextInput
								className="flex-1 text-base leading-6"
								style={{ color: theme.colors.textPrimary }}
								placeholder="What did you think of the book?"
								placeholderTextColor={isDark ? "#8C93A4" : "#91919F"}
								multiline
								textAlignVertical="top"
								value={reviewText}
								onChangeText={setReviewText}
								maxLength={2000}
							/>
							<Text className="text-right text-xs mt-2" style={{ color: theme.colors.textSecondary }}>
								{reviewText.length}/2000
							</Text>
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
									style={{ backgroundColor: isDark ? "#221A30" : "#F2E8FF", borderWidth: 1, borderColor: isDark ? "#4A3A68" : "#E9D7FF" }}
								>
									<Text className="font-medium mr-1" style={{ color: theme.colors.primary }}>
										{tag}
									</Text>
									<TouchableOpacity onPress={() => setTags((prev) => prev.filter((t) => t !== tag))}>
										<Ionicons name="close" size={16} color={theme.colors.primary} />
									</TouchableOpacity>
								</View>
							))}
							<TouchableOpacity className="flex-row items-center px-4 py-2 rounded-full mb-2" style={{ borderWidth: 1, borderStyle: "dashed", borderColor: theme.colors.textSecondary }}>
								<Ionicons name="add" size={16} color={theme.colors.textSecondary} />
								<Text className="ml-1" style={{ color: theme.colors.textSecondary }}>
									Add Tag
								</Text>
							</TouchableOpacity>
						</View>

						<Text className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
							Suggestions:
						</Text>
						<View className="flex-row flex-wrap">
							{suggestions.map((sug) => (
								<TouchableOpacity
									key={sug}
									className="px-3 py-1 rounded-full mr-2 mb-2"
									style={{ borderWidth: 1, borderColor: isDark ? "#2A2D38" : "#E5E7EB", backgroundColor: isDark ? "#141821" : "#FFFFFF" }}
									onPress={() => {
										if (!selectedTagSet.has(sug)) {
											setTags((prev) => [...prev, sug]);
										}
									}}
								>
									<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
										{sug}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</ScrollView>

				<View className="p-5" style={{ borderTopWidth: 1, borderTopColor: isDark ? "#20232D" : "#F3F4F6", backgroundColor: isDark ? "#0E0F13" : "#FFFFFF" }}>
					<TouchableOpacity className="py-4 rounded-2xl items-center" style={{ backgroundColor: theme.colors.primary }}>
						<Text className="text-white text-lg font-bold">Submit Review</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
