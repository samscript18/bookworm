import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { useThemeStore } from "@/store/useThemeStore";

interface SkeletonProps {
	width?: number | string;
	height?: number | string;
	borderRadius?: number;
	style?: any;
}

export const Skeleton = ({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) => {
	const { isDark } = useThemeStore();
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 1500,
					useNativeDriver: false,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 1500,
					useNativeDriver: false,
				}),
			])
		);

		animation.start();
		return () => animation.stop();
	}, [shimmerAnim]);

	const opacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.6, 1],
	});

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: isDark ? "#1B1E28" : "#E9E9EA",
					opacity,
				},
				style,
			]}
		/>
	);
};

export const BookSkeleton = () => {
	const { theme, isDark } = useThemeStore();
	return (
		<View className="rounded-2xl shadow-sm border p-3 mb-6" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
			<View className="flex-row">
				<Skeleton width={80} height={112} borderRadius={8} />
				<View className="flex-1 justify-center ml-4">
					<Skeleton width="80%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
					<Skeleton width="60%" height={14} borderRadius={8} style={{ marginBottom: 12 }} />
					<Skeleton width="100%" height={8} borderRadius={8} />
				</View>
				<View className="justify-center">
					<Skeleton width={20} height={20} borderRadius={10} />
				</View>
			</View>
		</View>
	);
};

export const ReviewSkeleton = () => {
	const { theme, isDark } = useThemeStore();
	return (
		<View className="px-4 mb-4 rounded-2xl p-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }}>
			<View className="flex-row items-center mb-3">
				<Skeleton width={40} height={40} borderRadius={20} />
				<View className="flex-1 ml-3">
					<Skeleton width="50%" height={14} borderRadius={8} style={{ marginBottom: 4 }} />
					<Skeleton width="30%" height={12} borderRadius={8} />
				</View>
			</View>
			<Skeleton width="100%" height={60} borderRadius={8} style={{ marginBottom: 8 }} />
			<Skeleton width="40%" height={12} borderRadius={8} />
		</View>
	);
};

export const ProfileSkeleton = () => {
	const { theme } = useThemeStore();
	return (
		<View className="items-center pt-4 px-4">
			<Skeleton width={96} height={96} borderRadius={48} style={{ marginBottom: 16 }} />
			<Skeleton width="50%" height={24} borderRadius={8} style={{ marginBottom: 8 }} />
			<Skeleton width="80%" height={14} borderRadius={8} style={{ marginBottom: 24 }} />

			<View className="flex-row justify-around items-center w-full h-24 pt-6 pb-6 px-4 mb-4" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}>
				<View className="items-center pr-8" style={{ borderRightWidth: 1, borderRightColor: theme.colors.border }}>
					<Skeleton width={40} height={20} borderRadius={4} style={{ marginBottom: 4 }} />
					<Skeleton width={50} height={12} borderRadius={4} />
				</View>
				<View className="items-center pr-8" style={{ borderRightWidth: 1, borderRightColor: theme.colors.border }}>
					<Skeleton width={40} height={20} borderRadius={4} style={{ marginBottom: 4 }} />
					<Skeleton width={50} height={12} borderRadius={4} />
				</View>
				<View className="items-center">
					<Skeleton width={40} height={20} borderRadius={4} style={{ marginBottom: 4 }} />
					<Skeleton width={50} height={12} borderRadius={4} />
				</View>
			</View>
		</View>
	);
};

export const GenreSkeleton = () => {
	return (
		<View className="mr-3">
			<Skeleton width={100} height={40} borderRadius={20} />
		</View>
	);
};

export const TrendingBookSkeleton = () => {
	return (
		<View className="mr-2">
			<Skeleton width={118} height={180} borderRadius={8} style={{ marginBottom: 8 }} />
			<Skeleton width={100} height={12} borderRadius={4} />
		</View>
	);
};

export const BookDetailsSkeleton = () => {
	const { theme } = useThemeStore();
	return (
		<View className="items-center px-4 pt-2">
			<Skeleton width={240} height={320} borderRadius={14} style={{ marginBottom: 24 }} />
			<Skeleton width="60%" height={20} borderRadius={8} style={{ marginBottom: 8 }} />
			<Skeleton width="50%" height={16} borderRadius={8} style={{ marginBottom: 16 }} />
			<Skeleton width={120} height={24} borderRadius={8} style={{ marginBottom: 24 }} />

			<View className="flex-row justify-between w-full gap-x-4 mb-6">
				<Skeleton width="48%" height={44} borderRadius={16} />
				<Skeleton width="48%" height={44} borderRadius={16} />
			</View>

			<View className="flex-row w-full my-4 gap-x-2">
				<Skeleton width="30%" height={44} borderRadius={12} />
				<Skeleton width="30%" height={44} borderRadius={12} />
				<Skeleton width="30%" height={44} borderRadius={12} />
			</View>

			<View className="w-full px-5">
				<Skeleton width="40%" height={18} borderRadius={8} style={{ marginTop: 24, marginBottom: 12 }} />
				<Skeleton width="100%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
				<Skeleton width="100%" height={14} borderRadius={8} style={{ marginBottom: 8 }} />
				<Skeleton width="80%" height={14} borderRadius={8} />
			</View>
		</View>
	);
};
