import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, Share, Text, TouchableOpacity, View } from "react-native";
import { StarRow } from "./star-row";
import { useThemeStore } from "@/store/useThemeStore";
import { Review } from "@/types/review/review";
import { Link, useRouter } from "expo-router";
import { getRelativeTime } from "@/lib/utils";
import { deleteReview, reactToReview } from "@/lib/services/review.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBook } from "@/lib/services/book.service";
import { useAuthStore } from "@/store/useAuthStore";
import { reactToUser } from "@/lib/services/user.service";
import { toast } from "@/lib/utils/toast";

const ReviewCard = ({ review, isRefetching, onPressComment, highlight }: { review: Review; isRefetching: boolean; onPressComment?: (reviewId: string) => void; highlight?: boolean }) => {
	const { theme } = useThemeStore();
	const router = useRouter();
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [expanded, setExpanded] = useState<boolean>(false);
	const shouldTruncate = review.content.length > 200;
	const isLiked = review.isLiked;
	const isSaved = review.isSaved;

	const { mutateAsync: _reactToReview, isPending: isReacting } = useMutation({
		mutationKey: ["react-to-review", review._id],
		mutationFn: reactToReview,

		onMutate: async (reviewId) => {
			await queryClient.cancelQueries({
				queryKey: ["home-feed"],
			});

			const previousData = queryClient.getQueryData(["home-feed"]);

			queryClient.setQueryData(["home-feed"], (old: any) => {
				if (!old) return old;

				return {
					...old,
					pages: old.pages.map((page: any) => ({
						...page,
						reviews: page.reviews.map((r: any) =>
							r._id === reviewId
								? {
										...r,
										isLiked: !r.isLiked,
										likes: r.isLiked ? r.likes.filter((id: string) => id !== user?._id) : [...r.likes, user?._id],
									}
								: r,
						),
					})),
				};
			});

			return { previousData };
		},

		onError: (_err, _reviewId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(["home-feed"], context.previousData);
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["home-feed"],
			});
		},
	});

	const { mutateAsync: _saveBook, isPending: isSavingBook } = useMutation({
		mutationKey: ["save-book", review.book._id],
		mutationFn: saveBook,

		onMutate: async (bookId: string) => {
			await queryClient.cancelQueries({
				queryKey: ["home-feed"],
			});

			const previousData = queryClient.getQueryData(["home-feed"]);

			queryClient.setQueryData(["home-feed"], (old: any) => {
				if (!old) return old;

				return {
					...old,
					pages: old.pages.map((page: any) => ({
						...page,
						reviews: page.reviews.map((r: any) =>
							r.book._id === bookId
								? {
										...r,
										book: {
											...r.book,
										},
										isSaved: !r.isSaved,
									}
								: r,
						),
					})),
				};
			});

			return { previousData };
		},

		onError: (_err, _bookId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(["home-feed"], context.previousData);
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["home-feed"],
			});
			queryClient.invalidateQueries({
				queryKey: ["saved-books"],
			});
		},
	});

	const { mutate: _followUser } = useMutation({
		mutationKey: ["follow-review-user", review.user._id],
		mutationFn: reactToUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["home-feed"] });
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
		onError: () => toast.error("Failed to update follow"),
	});

	const { mutate: _deleteReview, isPending: isDeletingReview } = useMutation({
		mutationKey: ["delete-review", review._id],
		mutationFn: deleteReview,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["home-feed"] });
			queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
			toast.success("Review deleted");
		},
		onError: () => toast.error("Failed to delete review"),
	});

	const handleShare = async (title: string, content: string) => {
		try {
			await Share.share(
				{
					title: `${review.user.userName}'s review of ${title}`,
					message: `${title}\n\n${content}\n\nRead more:`,
					url: `https://bookworm.onrender.com/review/${review._id}`,
				},
				{ subject: `${review.user.userName}'s review of ${title}` },
			);
		} catch {
			toast.error("Unable to open share sheet");
		}
	};

	const openReviewActions = () => {
		const isOwnReview = review.user._id === user?._id;

		Alert.alert(review.user.userName, "Choose an action", [
			{ text: isSaved ? "Remove book from library" : "Save book to library", onPress: () => _saveBook(review.book._id) },
			{ text: "Share review", onPress: () => handleShare(review.book.title, review.content) },
			...(isOwnReview
				? [
						{
							text: "Delete review",
							style: "destructive" as const,
							onPress: () =>
								Alert.alert("Delete review?", "This cannot be undone.", [
									{ text: "Cancel", style: "cancel" },
									{ text: "Delete", style: "destructive", onPress: () => _deleteReview(review._id) },
								]),
						},
					]
				: [{ text: "Follow user", onPress: () => _followUser({ userId: review.user._id }) }]),
			{ text: "Cancel", style: "cancel" },
		]);
	};

	return (
		<View
			key={review._id}
			className="mb-8 pb-6"
			style={{
				borderBottomWidth: 1,
				borderBottomColor: theme.colors.surfaceMuted,
				backgroundColor: highlight ? `${theme.colors.primary}14` : "transparent",
				borderRadius: highlight ? 16 : 0,
				paddingHorizontal: highlight ? 12 : 0,
				paddingTop: highlight ? 12 : 0,
			}}
		>
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center">
					<Pressable
						onPress={() =>
							router.push({
								pathname: "/(tabs)/profile",
								params: { userId: review.user._id },
							})
						}
					>
						<Image
							source={{
								uri: review.user.profileImage,
							}}
							className="w-12 h-12 rounded-full mr-3"
						/>
					</Pressable>

					<View className="gap-y-1.5">
						<Text
							className="font-manrope font-semibold text-base"
							style={{ color: theme.colors.textPrimary }}
							onPress={() =>
								router.push({
									pathname: "/(tabs)/profile",
									params: { userId: review.user._id },
								})
							}
						>
							{review.user.userName}
						</Text>

						<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
							{getRelativeTime(review.createdAt)}
						</Text>
					</View>
				</View>

				<TouchableOpacity onPress={openReviewActions} disabled={isDeletingReview} className="w-10 h-10 items-center justify-center rounded-full">
					<Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
				</TouchableOpacity>
			</View>

			<Link href={`/book/${review.book._id}`} asChild>
				<TouchableOpacity className="flex-row my-4">
					<Image
						source={{ uri: review.book.coverImage }}
						className="w-[90px] h-[120px] rounded-md mr-3"
						style={{
							backgroundColor: theme.colors.surfaceMuted,
						}}
					/>

					<View className="flex-1 gap-y-2">
						<Text className="font-manrope font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
							{review.book.title}
						</Text>

						<Text className="font-manrope text-base" style={{ color: theme.colors.textSecondary }}>
							{review.book.author}
						</Text>

						<View className="flex-row items-center gap-1.5">
							<StarRow rating={review.rating} size={20} />
							<Text
								className="font-manrope text-sm ml-2"
								style={{
									color: theme.colors.textSecondary,
								}}
							>
								{review.rating}/5
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			</Link>

			<Text className="font-manrope leading-6 mb-4" style={{ color: theme.colors.textPrimary }}>
				{shouldTruncate && !expanded ? `${review.content.slice(0, 200)}...` : review.content}

				{shouldTruncate && (
					<Text
						onPress={() => setExpanded((prev) => !prev)}
						style={{
							color: theme.colors.primary,
							fontWeight: "600",
						}}
					>
						{expanded ? "Show Less" : "Read More"}
					</Text>
				)}
			</Text>

			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center space-x-6">
					<TouchableOpacity className="flex-row items-center" onPress={() => _reactToReview(review._id)} disabled={isReacting}>
						<Ionicons
							name={isLiked ? "heart" : "heart-outline"}
							size={20}
							color={isLiked ? theme.colors.primary : theme.colors.textSecondary}
							style={{
								opacity: isReacting ? 0.5 : 1,
							}}
						/>

						<Text
							className="font-manrope ml-1"
							style={{
								color: theme.colors.textSecondary,
							}}
						>
							{review.likes.length}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity className="flex-row items-center ml-4" onPress={() => onPressComment?.(review._id)}>
						<Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
						<Text
							className="font-manrope ml-1"
							style={{
								color: theme.colors.textSecondary,
							}}
						>
							{review.commentsCount}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity className="ml-4" onPress={() => handleShare(review.book.title, review.content)}>
						<Ionicons name="share-social-outline" size={20} color={theme.colors.textSecondary} />
					</TouchableOpacity>
				</View>

				<TouchableOpacity onPress={() => _saveBook(review.book._id)} disabled={isSavingBook || isRefetching}>
					<Ionicons
						name={isSaved ? "bookmark" : "bookmark-outline"}
						size={20}
						color={isSaved ? theme.colors.primary : theme.colors.textSecondary}
						style={{
							opacity: isSavingBook ? 0.5 : 1,
						}}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};

ReviewCard.displayName = "ReviewCard";

export default React.memo(ReviewCard);
