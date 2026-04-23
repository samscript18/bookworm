import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export const STAR_COLOR = "#7F3DFF";

export const StarRow = ({ rating, size = 18 }: { rating: number; size?: number }) => (
	<View className="flex-row">
		{[1, 2, 3, 4, 5].map((star) => (
			<Ionicons key={star} name={star <= rating ? "star" : "star-outline"} size={size} color={STAR_COLOR} style={{ marginRight: 2 }} />
		))}
	</View>
);
