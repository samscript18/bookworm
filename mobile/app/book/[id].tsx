import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookTabType } from "@/types/book/book";
import { bookDescription, reviews } from "@/data/data";
import ReviewCard from "@/components/ui/review-card";
import { StarRow } from "@/components/ui/star-row";
import { useThemeStore } from "@/store/useThemeStore";

const BookDetails = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<BookTabType>("Details");

	const renderDetails = () => (
		<>
			<View className="px-5 mt-3">
				<Text className="text-[18px] font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
					About this book
				</Text>
				{bookDescription.map((paragraph) => (
					<Text key={paragraph} className="text-sm leading-7 mb-3" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
						{paragraph}
					</Text>
				))}

				<TouchableOpacity className="self-start mt-1 mb-5">
					<Text className="text-[15px] font-semibold" style={{ color: theme.colors.primary }}>
						Read more
					</Text>
				</TouchableOpacity>

				<View className="flex-row justify-between mb-7">
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Pages:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							384
						</Text>
					</View>
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Publisher:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							Penguin
						</Text>
					</View>
				</View>

				<View className="flex-row justify-between mb-7">
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Published:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							2023
						</Text>
					</View>
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Language:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							English
						</Text>
					</View>
				</View>

				<View className="flex-row justify-between mb-7">
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							ISBN:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							978-1234567890
						</Text>
					</View>
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Genre:
						</Text>
						<Text className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							Fiction
						</Text>
					</View>
				</View>

				<Text className="text-[18px] font-semibold mt-4 mb-8" style={{ color: theme.colors.textPrimary }}>
					Reader Reviews
				</Text>
			</View>

			<View className="px-4 pb-10">
				{reviews.map((review) => (
					<ReviewCard key={review.id} review={review} isDark={isDark} />
				))}
			</View>
		</>
	);

	const renderReviews = () => (
		<View className="px-4 pt-4 pb-10">
			{reviews.map((review) => (
				<ReviewCard key={review.id} review={review} isDark={isDark} />
			))}
		</View>
	);

	const renderDiscussions = () => (
		<View className="px-5 pt-6 pb-12">
			<Text className="text-sm leading-7" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
				No discussions yet. Start the first conversation about this book.
			</Text>
		</View>
	);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="pt-2 pb-4">
					<View className="absolute top-0 left-2 z-10">
						<TouchableOpacity
							onPress={() => router.back()}
							className="w-10 h-10 rounded-full items-center justify-center"
							style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)" }}
						>
							<Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#111827"} />
						</TouchableOpacity>
					</View>
				</View>

				<View className="items-center px-4 pt-2">
					<Image source={{ uri: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png" }} className="w-[240px] h-[320px] rounded-[14px] bg-gray-200" />
					<Text className="text-xl font-bold mt-6 text-center" style={{ color: theme.colors.textPrimary }}>
						The Midnight Library
					</Text>
					<Text className="text-base mt-2 mb-4" style={{ color: theme.colors.textSecondary }}>
						by Matt Haig
					</Text>

					<View className="items-center">
						<StarRow rating={5} size={26} />
						<View className="flex-row center mt-4">
							<Text className="text-base font-bold" style={{ color: theme.colors.textPrimary }}>
								4.8
							</Text>
							<Text className="text-base ml-2 mb-1" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
								(2,384 reviews)
							</Text>
						</View>
					</View>

					<View className="flex-row justify-between w-full mt-6 mb-3 gap-x-4">
						<TouchableOpacity className="flex-1 py-4 rounded-[16px] items-center" style={{ backgroundColor: theme.colors.primary }}>
							<Text className="text-white text-base font-bold">Read Book</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="flex-1 py-4 rounded-[16px] items-center"
							style={{ backgroundColor: isDark ? "#11131A" : "#FFFFFF", borderWidth: 2, borderColor: theme.colors.primary }}
							onPress={() =>
								router.push({
									pathname: "/book/write-review",
									params: {
										bookId: id ?? "1",
										bookTitle: "The Midnight Library",
										author: "Matt Haig",
										cover: "https://res.cloudinary.com/dynopc0cn/image/upload/v1776190236/onboarding-screen-1_cfohlh.png",
									},
								})
							}
						>
							<Text className="text-base font-bold" style={{ color: theme.colors.primary }}>
								Add Review
							</Text>
						</TouchableOpacity>
					</View>

					<View className="flex-row w-full my-4 rounded-2xl" style={{ backgroundColor: isDark ? "#1B1E28" : "transparent" }}>
						{(["Details", "Reviews", "Discussions"] as BookTabType[]).map((tab) => (
							<TouchableOpacity
								key={tab}
								onPress={() => setActiveTab(tab)}
								className="w-1/3 rounded-xl p-4"
								style={{ backgroundColor: activeTab === tab ? (isDark ? "#2B2140" : "#EDE5FF") : "transparent" }}
							>
								<Text className="text-center text-base font-semibold" style={{ color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary }}>
									{tab}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{activeTab === "Details" && renderDetails()}
				{activeTab === "Reviews" && renderReviews()}
				{activeTab === "Discussions" && renderDiscussions()}
			</ScrollView>
		</SafeAreaView>
	);
};
export default BookDetails;
