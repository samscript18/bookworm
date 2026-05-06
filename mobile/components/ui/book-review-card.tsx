import { useThemeStore } from "@/store/useThemeStore";
import { Review } from "@/types/review/review";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { STAR_COLOR, StarRow } from "./star-row";
import { getRelativeTime } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";

const BookReviewCard = (review: Review) => {
	const { theme } = useThemeStore();
	const isDark = theme.mode === "dark";

	return (
		<View className="rounded-2xl px-4 py-3 mb-3" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF", borderWidth: 1, borderColor: isDark ? "#2A2D38" : "#ECECF0" }}>
			<View className="flex-row items-start justify-between">
				<View className="flex-row items-center flex-1 pr-3">
					<Image source={{ uri: review.user.profileImage }} className="w-10 h-10 rounded-full mr-3 bg-gray-200" />
					<View className="flex-1 gap-y-2.5">
						<Text className="text-sm font-semibold" style={{ color: isDark ? "#F4F5F7" : "#161719" }}>
							{review.user.userName}
						</Text>
						<StarRow rating={review.rating} size={14} />
					</View>
				</View>
				<Text className="text-xs" style={{ color: isDark ? "#8C93A4" : "#9CA3AF" }}>
					{getRelativeTime(review.createdAt)}
				</Text>
			</View>

			<Text className="text-sm leading-6 tracking-wide mt-4" style={{ color: isDark ? "#C8CCD6" : "#4B5563" }}>
				{review.content}
			</Text>

			<TouchableOpacity className="flex-row items-center mt-4">
				<Ionicons name="thumbs-up-outline" size={13} color={STAR_COLOR} />
				<Text className="text-[#7F3DFF] text-[13px] ml-1.5">Helpful ({review.likes.length})</Text>
			</TouchableOpacity>
		</View>
	);
};

export default BookReviewCard;
