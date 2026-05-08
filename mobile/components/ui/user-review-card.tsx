import { Image, Text, TouchableOpacity, View } from "react-native";
import { StarRow } from "./star-row";
import { useThemeStore } from "@/store/useThemeStore";
import { Review } from "@/types/review/review";
import { Link } from "expo-router";

const UserReviewCard = (review: Review) => {
	const { theme } = useThemeStore();
	const isDark = theme.mode === "dark";

	return (
		<View key={review._id} className="rounded-2xl px-4 py-3 mb-3" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF", borderWidth: 1, borderColor: isDark ? "#2A2D38" : "#ECECF0" }}>
			<Link href={`/book/${review.book._id}`} asChild>
				<TouchableOpacity className="flex-row my-4">
					<Image source={{ uri: review.book.coverImage }} className="w-[90px] h-[120px] rounded-md mr-3" style={{ backgroundColor: theme.colors.surfaceMuted }} />
					<View className="flex-1 justify-start gap-y-2">
						<Text className="font-manrope font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
							{review.book.title}
						</Text>
						<Text className="font-manrope text-base mb-1" style={{ color: theme.colors.textSecondary }}>
							{review.book.author}
						</Text>
						<View className="flex-row items-center gap-1.5">
							<StarRow rating={review.rating} size={20} />
							<Text className="font-manrope text-sm ml-2" style={{ color: theme.colors.textSecondary }}>
								{review.rating}/5
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			</Link>

			<Text className="font-manrope leading-6 mb-4" style={{ color: theme.colors.textPrimary }}>
				{review.content}
			</Text>
		</View>
	);
};
export default UserReviewCard;
