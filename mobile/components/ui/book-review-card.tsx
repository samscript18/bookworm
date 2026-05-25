import { useThemeStore } from "@/store/useThemeStore";
import { Review } from "@/types/review/review";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { StarRow } from "./star-row";
import { getRelativeTime } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactToReview } from "@/lib/services/review.service";
import { useAuthStore } from "@/store/useAuthStore";

const BookReviewCard = (review: Review & { bookId?: string }) => {
	const { theme } = useThemeStore();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const isDark = theme.mode === "dark";
	const cacheBookId = review.book?._id ?? review.bookId;

	const { mutate: toggleHelpful, isPending } = useMutation({
		mutationKey: ["react-to-book-review", review._id],
		mutationFn: reactToReview,
		onMutate: async (reviewId) => {
			await queryClient.cancelQueries({ queryKey: ["book-reviews", cacheBookId] });
			const previousData = queryClient.getQueryData(["book-reviews", cacheBookId]);

			queryClient.setQueryData(["book-reviews", cacheBookId], (old: Review[] | undefined) => {
				if (!old || !user?._id) return old;

				return old.map((item) => {
					if (item._id !== reviewId) return item;
					const liked = item.likes.includes(user._id);
					return {
						...item,
						likes: liked ? item.likes.filter((id) => id !== user._id) : [...item.likes, user._id],
						isLiked: !liked,
					};
				});
			});

			return { previousData };
		},
		onError: (_error, _reviewId, context) => {
			if (context?.previousData) queryClient.setQueryData(["book-reviews", cacheBookId], context.previousData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["book-reviews", cacheBookId] });
		},
	});

	const isHelpful = user?._id ? review.likes.includes(user._id) || review.isLiked : review.isLiked;

	return (
		<View className="rounded-2xl px-4 py-3 mb-3" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF", borderWidth: 1, borderColor: isDark ? "#2A2D38" : "#ECECF0" }}>
			<View className="flex-row items-start justify-between">
				<View className="flex-row items-center flex-1 pr-3">
					<Pressable onPress={() => router.push({ pathname: "/(tabs)/profile", params: { userId: review.user._id } })}>
						<Image source={{ uri: review.user.profileImage }} className="w-10 h-10 rounded-full mr-3 bg-gray-200" />
					</Pressable>
					<View className="flex-1 gap-y-2.5">
						<Text
							className="font-manrope text-sm font-semibold"
							style={{ color: isDark ? "#F4F5F7" : "#161719" }}
							onPress={() => router.push({ pathname: "/(tabs)/profile", params: { userId: review.user._id } })}
						>
							{review.user.userName}
						</Text>
						<StarRow rating={review.rating} size={14} />
					</View>
				</View>
				<Text className="font-manrope text-xs" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
					{getRelativeTime(review.createdAt)}
				</Text>
			</View>

			<Text className="font-manrope text-sm leading-6 tracking-wide mt-4" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
				{review.content}
			</Text>

			<TouchableOpacity className="flex-row items-center mt-4" onPress={() => toggleHelpful(review._id)} disabled={isPending}>
				<Ionicons name={isHelpful ? "thumbs-up" : "thumbs-up-outline"} size={13} color={theme.colors.primary} style={{ opacity: isPending ? 0.5 : 1 }} />
				<Text className="font-manrope text-[13px] ml-1.5" style={{ color: theme.colors.primary }}>
					Helpful ({review.likes.length})
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default BookReviewCard;
