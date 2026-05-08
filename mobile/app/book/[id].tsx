import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { BookTabType } from "@/types/book/book";
import { StarRow } from "@/components/ui/star-row";
import BookReviewCard from "@/components/ui/book-review-card";
import { BookDetailsSkeleton, ReviewSkeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useThemeStore } from "@/store/useThemeStore";
import { getBook } from "@/lib/services/book.service";
import { getBookReviews } from "@/lib/services/review.service";

const BookDetails = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<BookTabType>("Details");

	const {
		isFetching: isFetchingBook,
		data: book,
		error: bookError,
		refetch: refetchBook,
	} = useQuery({
		queryKey: ["book", id],
		queryFn: () => getBook(id),
	});

	const {
		isFetching: isFetchingReviews,
		data: reviews,
		error: reviewsError,
		refetch: refetchReviews,
	} = useQuery({
		queryKey: ["book-reviews", id],
		queryFn: () => getBookReviews(id),
	});

	const renderDetails = () => (
		<>
			<View className="px-5 mt-3">
				<Text className="font-manrope text-[18px] font-semibold mb-4" style={{ color: theme.colors.textPrimary }}>
					About this book
				</Text>
				<Text className="font-manrope text-sm leading-7 mb-3" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
					{book?.description}
				</Text>

				<TouchableOpacity className="self-start mt-1 mb-5">
					<Text className="font-manrope text-[15px] font-semibold" style={{ color: theme.colors.primary }}>
						Read more
					</Text>
				</TouchableOpacity>

				<View className="flex-row justify-between mb-7">
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Pages:
						</Text>
						<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							{book?.pages}
						</Text>
					</View>
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Publisher:
						</Text>
						<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							{book?.publisher}
						</Text>
					</View>
				</View>

				<View className="flex-row justify-between mb-7">
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Published:
						</Text>
						<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							{book?.publishYear}
						</Text>
					</View>
					<View className="w-[47%] flex-row items-center gap-x-2.5">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Language:
						</Text>
						<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							English
						</Text>
					</View>
				</View>

				<View className="mb-7">
					<View className="w-full flex-row items-center gap-x-2.5 mb-7">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							ISBN:
						</Text>
						<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
							{book?.isbn}
						</Text>
					</View>
					<View className="w-full flex-row items-center gap-x-2.5">
						<Text className="font-manrope text-sm" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
							Genre:
						</Text>
						<Text className="font-manrope text-sm font-semibold capitalize" style={{ color: theme.colors.textPrimary }}>
							{book?.genres?.join(", ")}
						</Text>
					</View>
				</View>

				<Text className="font-manrope text-[18px] font-semibold mt-4 mb-8" style={{ color: theme.colors.textPrimary }}>
					Reader Reviews
				</Text>
			</View>

			<View className="px-4 pb-10">
				{isFetchingReviews ? (
					<>
						{[1, 2].map((i) => (
							<ReviewSkeleton key={i} />
						))}
					</>
				) : reviewsError ? (
					<ErrorMessage message="Failed to load reviews" onRetry={() => refetchReviews()} showRetry={false} />
				) : (
					reviews?.map((review) => <BookReviewCard key={review._id} {...review} />)
				)}
			</View>
		</>
	);

	const renderReviews = () => (
		<View className="px-4 pt-4 pb-10">
			{isFetchingReviews ? (
				<>
					{[1, 2].map((i) => (
						<ReviewSkeleton key={i} />
					))}
				</>
			) : reviewsError ? (
				<ErrorMessage message="Failed to load reviews" onRetry={() => refetchReviews()} showRetry={false} />
			) : (
				reviews?.map((review) => <BookReviewCard key={review._id} {...review} />)
			)}
		</View>
	);

	const renderDiscussions = () => (
		<View className="px-5 pt-6 pb-12">
			<Text className="font-manrope text-sm leading-7" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
				No discussions yet. Start the first conversation about this book.
			</Text>
		</View>
	);

	if (bookError) {
		return <ErrorMessage message="Failed to load book details" onRetry={() => refetchBook()} />;
	}

	if (isFetchingBook || !book) {
		return <BookDetailsSkeleton />;
	}

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
					<Image source={{ uri: book.coverImage }} className="w-[240px] h-[320px] rounded-[14px] bg-gray-200" />
					<Text className="font-manrope text-xl font-bold mt-6 text-center" style={{ color: theme.colors.textPrimary }}>
						{book.title}
					</Text>
					<Text className="font-manrope text-base mt-2 mb-4" style={{ color: theme.colors.textSecondary }}>
						by {book.author}
					</Text>

					<View className="items-center">
						<StarRow rating={book.averageRating ?? 0} size={26} />
						<View className="flex-row center mt-4">
							<Text className="font-manrope text-base font-bold" style={{ color: theme.colors.textPrimary }}>
								{book.averageRating?.toFixed(1)}
							</Text>
							<Text className="font-manrope text-base ml-2 mb-1" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
								({book.totalReviews} reviews)
							</Text>
						</View>
					</View>

					<View className="flex-row justify-between w-full mt-6 mb-3 gap-x-4">
						<TouchableOpacity className="flex-1 py-4 rounded-[16px] items-center" style={{ backgroundColor: theme.colors.primary }}>
							<Text className="font-manrope text-white text-base font-bold">Read Book</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="flex-1 py-4 rounded-[16px] items-center"
							style={{ backgroundColor: isDark ? "#11131A" : "#FFFFFF", borderWidth: 2, borderColor: theme.colors.primary }}
							onPress={() =>
								router.push({
									pathname: "/book/write-review",
									params: {
										bookId: id ?? "1",
										bookTitle: book.title,
										author: book.author,
										cover: book.coverImage,
									},
								})
							}
						>
							<Text className="font-manrope text-base font-bold" style={{ color: theme.colors.primary }}>
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
								<Text className="font-manrope text-center text-base font-semibold" style={{ color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary }}>
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
