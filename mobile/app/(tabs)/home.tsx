import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, RefreshControl, InteractionManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrendingBooks } from "@/lib/services/book.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useInfiniteQuery } from "@tanstack/react-query";
import { addCommentToReview, getHomeFeed, getReviewComments } from "@/lib/services/review.service";
import ReviewCard from "@/components/ui/review-card";
import { TrendingBookSkeleton, ReviewSkeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/ui/error-message";
import { getNotificationsUnreadCount } from "@/lib/services/notification.service";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { Comment } from "@/types/comment/comment";
import { getRelativeTime } from "@/lib/utils";
import { AddCommentDto } from "@/types/comment/comment.dto";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { reactToComment } from "@/lib/services/comment.service";

const HomeFeed = () => {
	const { theme } = useThemeStore();
	const { user } = useAuthStore();
	const router = useRouter();
	const queryClient = useQueryClient();
	const commentSheetRef = useRef<ActionSheetRef>(null);
	const listRef = useRef<FlatList<(typeof reviews)[number]>>(null);
	const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const scrollRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingScrollIndexRef = useRef<number | null>(null);
	const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
	const [commentText, setCommentText] = useState<string>("");
	const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null);
	const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(null);
	const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
	const params = useLocalSearchParams<{
		commentId?: string;
		reviewId?: string;
	}>();
	const handledNotificationRef = useRef<string | null>(null);
	const normalizedReviewId = Array.isArray(params.reviewId) ? params.reviewId[0] : params.reviewId;
	const normalizedCommentId = Array.isArray(params.commentId) ? params.commentId[0] : params.commentId;

	const {
		isFetching: isFetchingTrendingBooks,
		data: trendingBooks,
		error: trendingBooksError,
		refetch: refetchTrending,
		isRefetching: isRefetchingTrendingBooks,
	} = useQuery({
		queryKey: ["trending-books"],
		queryFn: () => getTrendingBooks(),
	});

	const { data: notificationsUnreadCount } = useQuery({
		queryKey: ["notifications-unread-count"],
		queryFn: () => getNotificationsUnreadCount(),
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
		refetch: refetchHomeFeed,
	} = useInfiniteQuery({
		queryKey: ["home-feed"],
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			getHomeFeed({
				cursor: pageParam,
				limit: 20,
			}),

		getNextPageParam: (lastPage) => {
			const lp = lastPage as { nextCursor?: string } | undefined;
			return lp?.nextCursor ?? undefined;
		},
	});

	const reviews = useMemo(() => data?.pages.flatMap((page) => page.reviews) ?? [], [data]);
	const unreadNotificationsCount = notificationsUnreadCount?.count ?? 0;

	const { data: reviewComments, isLoading: isFetchingComments } = useQuery({
		queryKey: ["review-comments", selectedReviewId],
		queryFn: () => getReviewComments(selectedReviewId!),
		enabled: Boolean(selectedReviewId),
	});

	const { mutateAsync: _addComment, isPending: isAddingComment } = useMutation({
		mutationKey: ["add-comment", selectedReviewId],
		mutationFn: ({ reviewId, data }: { reviewId: string; data: AddCommentDto }) => addCommentToReview(reviewId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["review-comments", selectedReviewId] });
			queryClient.invalidateQueries({ queryKey: ["home-feed"] });
			setCommentText("");
			setReplyTo(null);
		},
		onError: () => {
			toast.error("Failed to add comment");
		},
	});

	const { mutateAsync: _reactToComment } = useMutation({
		mutationKey: ["react-comment", selectedReviewId],
		mutationFn: (commentId: string) => reactToComment(commentId),
		onMutate: async (commentId) => {
			await queryClient.cancelQueries({ queryKey: ["review-comments", selectedReviewId] });

			const previousData = queryClient.getQueryData(["review-comments", selectedReviewId]);

			queryClient.setQueryData(["review-comments", selectedReviewId], (old: Comment[] | undefined) => {
				if (!old || !user?._id) return old;

				return old.map((comment) => {
					if (comment._id !== commentId) return comment;
					const hasLiked = comment.likes.includes(user._id);
					return {
						...comment,
						likes: hasLiked ? comment.likes.filter((id) => id !== user._id) : [...comment.likes, user._id],
					};
				});
			});

			return { previousData };
		},
		onError: (_err, _commentId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(["review-comments", selectedReviewId], context.previousData);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["review-comments", selectedReviewId] });
		},
	});

	const resetCommentState = () => {
		setSelectedReviewId(null);
		setReplyTo(null);
		setCommentText("");
	};

	const openCommentsSheet = useCallback((reviewId: string) => {
		setSelectedReviewId(reviewId);
		setReplyTo(null);
		setCommentText("");
		commentSheetRef.current?.show();
	}, []);

	const closeCommentsSheet = useCallback(() => {
		commentSheetRef.current?.hide();
		resetCommentState();
	}, []);

	const handleSubmitComment = async () => {
		if (!selectedReviewId) return;
		const trimmed = commentText.trim();
		if (!trimmed) return;

		const payload: AddCommentDto = {
			content: trimmed,
			...(replyTo && { parentCommentId: replyTo.id }),
		};

		await _addComment({ reviewId: selectedReviewId, data: payload });
	};

	type CommentWithUser = Comment & { user: string | { _id: string; userName: string; profileImage?: string } };

	const commentItems = (reviewComments ?? []) as CommentWithUser[];
	const parentComments = commentItems.filter((comment) => !comment.parentComment);
	const repliesByParent = commentItems.reduce<Record<string, Comment[]>>((acc, comment) => {
		if (comment.parentComment) {
			const parentId = comment.parentComment;
			acc[parentId] = acc[parentId] ? [...acc[parentId], comment] : [comment];
		}
		return acc;
	}, {});

	const getCommentUser = (comment: CommentWithUser) => {
		if (typeof comment.user === "string") {
			return { _id: comment.user, userName: "User", profileImage: undefined };
		}
		return comment.user as unknown as { _id: string; userName: string; profileImage?: string };
	};

	const hasLikedComment = (comment: Comment) => (user?._id ? comment.likes.includes(user._id) : false);

	const clearHighlight = useCallback(() => {
		if (highlightTimeoutRef.current) {
			clearTimeout(highlightTimeoutRef.current);
			highlightTimeoutRef.current = null;
		}
		setHighlightedReviewId(null);
	}, []);

	const scrollToReview = useCallback(
		(reviewId: string) => {
			if (!reviews.length) return;
			const index = reviews.findIndex((review) => review._id === reviewId);
			if (index < 0) return;
			InteractionManager.runAfterInteractions(() => {
				listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.15 });
			});
			setHighlightedReviewId(reviewId);
			if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
			highlightTimeoutRef.current = setTimeout(() => {
				setHighlightedReviewId(null);
				highlightTimeoutRef.current = null;
			}, 2500);
		},
		[reviews],
	);

	useEffect(() => {
		if (!normalizedReviewId || !normalizedCommentId) return;
		const key = `${normalizedReviewId}:${normalizedCommentId ?? ""}`;
		if (handledNotificationRef.current === key) return;
		handledNotificationRef.current = key;
		openCommentsSheet(normalizedReviewId);
	}, [normalizedReviewId, normalizedCommentId, openCommentsSheet]);

	useEffect(() => {
		if (!normalizedReviewId || normalizedCommentId) return;
		const key = `${normalizedReviewId}:review`;
		if (handledNotificationRef.current === key) return;
		handledNotificationRef.current = key;
		setPendingReviewId(normalizedReviewId);
	}, [normalizedReviewId, normalizedCommentId]);

	useEffect(() => {
		if (!pendingReviewId) return;
		const index = reviews.findIndex((review) => review._id === pendingReviewId);
		if (index >= 0) {
			scrollToReview(pendingReviewId);
			setPendingReviewId(null);
			return;
		}

		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
			return;
		}

		if (!hasNextPage) {
			setPendingReviewId(null);
		}
	}, [pendingReviewId, reviews, hasNextPage, isFetchingNextPage, fetchNextPage, scrollToReview]);

	useEffect(() => () => clearHighlight(), [clearHighlight]);

	useEffect(
		() => () => {
			if (scrollRetryTimeoutRef.current) {
				clearTimeout(scrollRetryTimeoutRef.current);
				scrollRetryTimeoutRef.current = null;
			}
		},
		[],
	);

	useEffect(() => {
		if (!normalizedCommentId) return;
		if (!reviewComments?.length) return;
		if (replyTo?.id === normalizedCommentId) return;

		const target = commentItems.find((comment) => comment._id === normalizedCommentId);
		if (!target) return;

		const targetUser = getCommentUser(target);
		setReplyTo({ id: normalizedCommentId, userName: targetUser.userName });
	}, [normalizedCommentId, reviewComments, commentItems, replyTo?.id]);

	const ListHeader = () => {
		return (
			<View className="mb-6">
				<View className="flex-row justify-between items-center px-4 pt-2 mb-4">
					<Text className="text-4xl font-bold font-caveat" style={{ color: theme.colors.primary }}>
						BookWorm
					</Text>
					<View className="flex-row justify-center items-center gap-x-8">
						<TouchableOpacity onPress={() => router.push("/notifications")}>
							<Ionicons name="notifications-outline" size={28} color={theme.colors.textSecondary} />
							{unreadNotificationsCount > 0 && (
								<View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
									<Text className="text-white text-xs font-bold">{unreadNotificationsCount}</Text>
								</View>
							)}
						</TouchableOpacity>
						<TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
							<Image source={{ uri: user?.profileImage }} className="w-12 h-12 rounded-full" />
						</TouchableOpacity>
					</View>
				</View>

				<View className="px-4 mb-6">
					<View className="rounded-2xl">
						<Text className="text-xl font-bold font-manrope" style={{ color: theme.colors.textPrimary }}>
							Welcome back{user?.firstName ? `, ${user.firstName}` : user?.userName}
						</Text>
						<Text className="font-manrope text-sm my-4" style={{ color: theme.colors.textSecondary }}>
							Discover what the community is reading today.
						</Text>
					</View>
				</View>

				<View className="mb-6">
					<Text className="font-manrope text-lg font-semibold px-4 mb-4" style={{ color: theme.colors.textPrimary }}>
						Trending Now
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-4 gap-3">
						{isFetchingTrendingBooks ? (
							<>
								{[1, 2, 3].map((i) => (
									<TrendingBookSkeleton key={i} />
								))}
							</>
						) : (
							trendingBooks?.map((book) => (
								<Link href={`/book/${book._id}`} key={book._id} asChild>
									<TouchableOpacity className="w-[118px]">
										<Image source={{ uri: book.coverImage }} className="w-[118px] h-[180px] rounded-lg mb-2" style={{ backgroundColor: theme.colors.surfaceMuted }} />
										<Text className="font-manrope text-[13px]" style={{ color: theme.colors.textPrimary }} numberOfLines={2}>
											{book.title}
										</Text>
									</TouchableOpacity>
								</Link>
							))
						)}
						<View className="w-4" />
					</ScrollView>
				</View>
				{trendingBooksError && <ErrorBanner message="Failed to load trending books" onDismiss={() => refetchTrending()} />}
			</View>
		);
	};

	const listHeader = useMemo(
		() => <ListHeader />,
		[
			isFetchingTrendingBooks,
			trendingBooks,
			trendingBooksError,
			unreadNotificationsCount,
			user?.firstName,
			user?.userName,
			user?.profileImage,
			theme.colors.primary,
			theme.colors.textPrimary,
			theme.colors.textSecondary,
			theme.colors.surfaceMuted,
		],
	);

	const renderItem = useCallback(
		({ item }: { item: (typeof reviews)[number] }) =>
			item ? (
				<View className="px-4">
					<ReviewCard review={item} isRefetching={isRefetching} onPressComment={openCommentsSheet} highlight={item._id === highlightedReviewId} />
				</View>
			) : null,
		[highlightedReviewId, isRefetching, openCommentsSheet, queryClient],
	);

	const keyExtractor = useCallback((item: (typeof reviews)[number]) => item._id, []);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<FlatList
				ref={listRef}
				data={reviews}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				// refreshControl={
				// 	<RefreshControl
				// 		refreshing={isRefetching || isRefetchingTrendingBooks}
				// 		onRefresh={async () => {
				// 			await refetchTrending();
				// 			await refetchHomeFeed();
				// 		}}
				// 		colors={[theme.colors.primary]}
				// 		tintColor={theme.colors.primary}
				// 	/>
				// }
				onEndReached={() => {
					if (hasNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
				ListHeaderComponent={listHeader}
				ListFooterComponent={isFetchingNextPage ? <ReviewSkeleton /> : <View className="h-4" />}
				initialNumToRender={6}
				maxToRenderPerBatch={6}
				windowSize={8}
				removeClippedSubviews
				updateCellsBatchingPeriod={50}
				onScrollToIndexFailed={({ index, highestMeasuredFrameIndex, averageItemLength }) => {
					const offset = Math.max(0, (index - highestMeasuredFrameIndex) * averageItemLength);
					listRef.current?.scrollToOffset({ offset, animated: true });
					pendingScrollIndexRef.current = index;
					if (scrollRetryTimeoutRef.current) clearTimeout(scrollRetryTimeoutRef.current);
					scrollRetryTimeoutRef.current = setTimeout(() => {
						if (pendingScrollIndexRef.current === null) return;
						listRef.current?.scrollToIndex({ index: pendingScrollIndexRef.current, animated: true, viewPosition: 0.15 });
						pendingScrollIndexRef.current = null;
						scrollRetryTimeoutRef.current = null;
					}, 350);
				}}
			/>

			<ActionSheet
				ref={commentSheetRef}
				gestureEnabled
				onClose={resetCommentState}
				isModal
				containerStyle={{
					backgroundColor: theme.colors.background,
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
					paddingBottom: Platform.OS === "ios" ? 20 : 10,
					height: "70%",
				}}
				indicatorStyle={{
					backgroundColor: theme.colors.textSecondary,
					width: 40,
					height: 5,
					marginTop: 10,
				}}
			>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1" style={{ flex: 1 }}>
					<View className="flex-1">
						<View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
							<Text className="font-manrope text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
								Comments
							</Text>
							<TouchableOpacity onPress={closeCommentsSheet}>
								<Ionicons name="close" size={22} color={theme.colors.textSecondary} />
							</TouchableOpacity>
						</View>

						<ScrollView className="px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }} style={{ flex: 1 }}>
							{isFetchingComments ? (
								<View className="py-10 items-center">
									<ActivityIndicator size="small" color={theme.colors.primary} />
								</View>
							) : parentComments.length === 0 ? (
								<View className="py-8 items-center">
									<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
										No comments yet. Be the first to share your thoughts.
									</Text>
								</View>
							) : (
								parentComments.map((comment) => {
									const commentUser = getCommentUser(comment);
									const replies = repliesByParent[comment._id] ?? [];

									return (
										<View key={comment._id} className="py-4" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceMuted }}>
											<View className="flex-row items-start">
												<Image source={{ uri: commentUser.profileImage }} className="w-10 h-10 rounded-full mr-3" />
												<View className="flex-1">
													<View className="flex-row items-center justify-between">
														<Text className="font-manrope text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
															{commentUser.userName}
														</Text>
														<Text className="font-manrope text-xs" style={{ color: theme.colors.textSecondary }}>
															{getRelativeTime(comment.createdAt)}
														</Text>
													</View>
													<Text className="font-manrope text-sm mt-1" style={{ color: theme.colors.textPrimary }}>
														{comment.content}
													</Text>
													<View className="flex-row items-center mt-2">
														<TouchableOpacity className="flex-row items-center" onPress={() => _reactToComment(comment._id)}>
															<Ionicons
																name={hasLikedComment(comment) ? "heart" : "heart-outline"}
																size={14}
																color={hasLikedComment(comment) ? theme.colors.primary : theme.colors.textSecondary}
															/>
															<Text className="font-manrope text-xs ml-1" style={{ color: theme.colors.textSecondary }}>
																{comment.likes.length}
															</Text>
														</TouchableOpacity>
														<TouchableOpacity
															className="ml-4"
															onPress={() => setReplyTo({ id: comment._id, userName: commentUser.userName })}
														>
															<Text className="font-manrope text-xs" style={{ color: theme.colors.primary }}>
																Reply
															</Text>
														</TouchableOpacity>
													</View>
												</View>
											</View>

											{replies.length > 0 && (
												<View className="mt-3 pl-12">
													{replies.map((reply) => {
														const replyUser = getCommentUser(reply);
														const deepReplies = repliesByParent[reply._id] ?? [];
														return (
															<View key={reply._id} className="mb-3">
																<View className="flex-row items-start">
																	<Image
																		source={{ uri: replyUser.profileImage }}
																		className="w-8 h-8 rounded-full mr-3"
																	/>
																	<View className="flex-1">
																		<View className="flex-row items-center justify-between">
																			<Text
																				className="font-manrope text-xs font-semibold"
																				style={{ color: theme.colors.textPrimary }}
																			>
																				{replyUser.userName}
																			</Text>
																			<Text
																				className="font-manrope text-[10px]"
																				style={{ color: theme.colors.textSecondary }}
																			>
																				{getRelativeTime(reply.createdAt)}
																			</Text>
																		</View>
																		<Text
																			className="font-manrope text-xs mt-1"
																			style={{ color: theme.colors.textPrimary }}
																		>
																			{reply.content}
																		</Text>
																		<View className="flex-row items-center mt-2">
																			<TouchableOpacity
																				className="flex-row items-center"
																				onPress={() => _reactToComment(reply._id)}
																			>
																				<Ionicons
																					name={
																						hasLikedComment(reply)
																							? "heart"
																							: "heart-outline"
																					}
																					size={12}
																					color={
																						hasLikedComment(reply)
																							? theme.colors
																									.primary
																							: theme.colors
																									.textSecondary
																					}
																				/>
																				<Text
																					className="font-manrope text-[10px] ml-1"
																					style={{
																						color: theme.colors
																							.textSecondary,
																					}}
																				>
																					{reply.likes.length}
																				</Text>
																			</TouchableOpacity>
																			<TouchableOpacity
																				className="ml-3"
																				onPress={() =>
																					setReplyTo({
																						id: reply._id,
																						userName: replyUser.userName,
																					})
																				}
																			>
																				<Text
																					className="font-manrope text-[10px]"
																					style={{ color: theme.colors.primary }}
																				>
																					Reply
																				</Text>
																			</TouchableOpacity>
																		</View>
																	</View>
																</View>

																{deepReplies.length > 0 && (
																	<View className="mt-3 pl-12">
																		{deepReplies.map((reply) => {
																			const replyUser = getCommentUser(reply);
																			return (
																				<View key={reply._id} className="mb-3">
																					<View className="flex-row items-start">
																						<Image
																							source={{
																								uri: replyUser.profileImage,
																							}}
																							className="w-8 h-8 rounded-full mr-3"
																						/>
																						<View className="flex-1">
																							<View className="flex-row items-center justify-between">
																								<Text
																									className="font-manrope text-xs font-semibold"
																									style={{
																										color: theme
																											.colors
																											.textPrimary,
																									}}
																								>
																									{
																										replyUser.userName
																									}
																								</Text>
																								<Text
																									className="font-manrope text-[10px]"
																									style={{
																										color: theme
																											.colors
																											.textSecondary,
																									}}
																								>
																									{getRelativeTime(
																										reply.createdAt,
																									)}
																								</Text>
																							</View>
																							<Text
																								className="font-manrope text-xs mt-1"
																								style={{
																									color: theme
																										.colors
																										.textPrimary,
																								}}
																							>
																								{
																									reply.content
																								}
																							</Text>
																							<View className="flex-row items-center mt-2">
																								<TouchableOpacity
																									className="flex-row items-center"
																									onPress={() =>
																										_reactToComment(
																											reply._id,
																										)
																									}
																								>
																									<Ionicons
																										name={
																											hasLikedComment(
																												reply,
																											)
																												? "heart"
																												: "heart-outline"
																										}
																										size={
																											12
																										}
																										color={
																											hasLikedComment(
																												reply,
																											)
																												? theme
																														.colors
																														.primary
																												: theme
																														.colors
																														.textSecondary
																										}
																									/>
																									<Text
																										className="font-manrope text-[10px] ml-1"
																										style={{
																											color: theme
																												.colors
																												.textSecondary,
																										}}
																									>
																										{
																											reply
																												.likes
																												.length
																										}
																									</Text>
																								</TouchableOpacity>
																							</View>
																						</View>
																					</View>
																				</View>
																			);
																		})}
																	</View>
																)}
															</View>
														);
													})}
												</View>
											)}
										</View>
									);
								})
							)}
						</ScrollView>

						<View className="px-5 pt-3 pb-5" style={{ borderTopWidth: 1, borderTopColor: theme.colors.surfaceMuted }}>
							{replyTo && (
								<View className="flex-row items-center justify-between mb-2">
									<Text className="font-manrope text-xs" style={{ color: theme.colors.textSecondary }}>
										Replying to {replyTo.userName}
									</Text>
									<TouchableOpacity onPress={() => setReplyTo(null)}>
										<Ionicons name="close" size={14} color={theme.colors.textSecondary} />
									</TouchableOpacity>
								</View>
							)}

							<View
								className="flex-row items-end"
								style={{
									backgroundColor: theme.colors.surfaceMuted,
									borderRadius: 18,
									paddingHorizontal: 12,
									paddingTop: 8,
									paddingBottom: 12,
									borderColor: commentText.trim() ? theme.colors.primary : theme.colors.textSecondary,
									borderWidth: 1,
								}}
							>
								<TextInput
									className="flex-1 font-manrope text-sm"
									style={{ color: theme.colors.textPrimary }}
									placeholder={replyTo ? `Reply to ${replyTo.userName}` : "Add a comment"}
									placeholderTextColor={theme.colors.textSecondary}
									multiline
									value={commentText}
									onChangeText={setCommentText}
									maxLength={1000}
								/>

								<TouchableOpacity onPress={handleSubmitComment} disabled={isAddingComment || !commentText.trim()} className="ml-3">
									{isAddingComment ? (
										<ActivityIndicator size="small" color={theme.colors.primary} />
									) : (
										<Ionicons name="send" size={18} color={commentText.trim() ? theme.colors.primary : theme.colors.textSecondary} />
									)}
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</KeyboardAvoidingView>
			</ActionSheet>
		</SafeAreaView>
	);
};

export default HomeFeed;
