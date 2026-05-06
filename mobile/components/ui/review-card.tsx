import { Ionicons } from "@expo/vector-icons";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";
import { StarRow } from "./star-row";
import { useThemeStore } from "@/store/useThemeStore";
import { Review } from "@/types/review/review";
import { Link } from "expo-router";
import { getRelativeTime } from "@/lib/utils";

const ReviewCard = (review: Review) => {
	const { theme } = useThemeStore();

	const handleShare = async (title: string, content: string) => {
		await Share.share({
			title: "Share Review",
			message: `${title}\n\n${content}\n\nRead more: https://bookworm.onrender.com/review/${review._id}`,
		});
	};

	return (
		<View key={review._id} className="mb-8 pb-6" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceMuted }}>
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center">
					<Image source={{ uri: review.user.profileImage }} className="w-12 h-12 rounded-full mr-3" />
					<View className="gap-y-1.5">
						<Text className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
							{review.user.userName}
						</Text>
						<Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
							{getRelativeTime(review.createdAt)}
						</Text>
					</View>
				</View>
				<Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
			</View>

			<Link href={`/book/${review.book._id}`} asChild>
				<TouchableOpacity className="flex-row my-4">
					<Image source={{ uri: review.book.coverImage }} className="w-[90px] h-[120px] rounded-md mr-3" style={{ backgroundColor: theme.colors.surfaceMuted }} />
					<View className="flex-1 justify-start gap-y-2">
						<Text className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
							{review.book.title}
						</Text>
						<Text className="text-base mb-1" style={{ color: theme.colors.textSecondary }}>
							{review.book.author}
						</Text>
						<View className="flex-row items-center gap-1.5">
							<StarRow rating={review.rating} size={20} />
							<Text className="text-sm ml-2" style={{ color: theme.colors.textSecondary }}>
								{review.rating}/5
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			</Link>

			<Text className="leading-6 mb-4" style={{ color: theme.colors.textPrimary }}>
				{review.content}
			</Text>

			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center space-x-6">
					<TouchableOpacity className="flex-row items-center">
						<Ionicons name="heart-outline" size={20} color={theme.colors.textSecondary} />
						<Text className="ml-1" style={{ color: theme.colors.textSecondary }}>
							{review.likes.length}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity className="flex-row items-center ml-4">
						<Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
						<Text className="ml-1" style={{ color: theme.colors.textSecondary }}>
							{review.commentsCount}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity className="ml-4" onPress={() => handleShare(review.book.title, review.content)}>
						<Ionicons name="share-social-outline" size={20} color={theme.colors.textSecondary} />
					</TouchableOpacity>
				</View>
				<TouchableOpacity>
					<Ionicons name="bookmark-outline" size={20} color={theme.colors.textSecondary} />
				</TouchableOpacity>
			</View>
		</View>
	);
};
export default ReviewCard;
