import React, { useState, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/services/user.service";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { getSavedBooks } from "@/lib/services/book.service";
import { getUserReviews } from "@/lib/services/review.service";
import UserBookCard from "@/components/ui/user-book-card";
import UserReviewCard from "@/components/ui/user-review-card";
import { ProfileItem } from "@/types/user/user";
import { Review } from "@/types/review/review";
import { Book } from "@/types/book/book";

export default function Profile() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<"Reviews" | "Favorites">("Reviews");

	const {
		data: profile,
		isLoading: isProfileLoading,
		error: profileError,
		refetch: refetchProfile,
	} = useQuery({
		queryKey: ["profile"],
		queryFn: getProfile,
	});

	const {
		data: userReviews,
		isLoading: isReviewsLoading,
		error: reviewsError,
		refetch: refetchReviews,
	} = useQuery({
		queryKey: ["user-reviews", profile?._id],
		queryFn: () => getUserReviews(profile!._id),
		enabled: !!profile?._id,
	});

	const {
		data: savedBooks,
		isLoading: isSavedLoading,
		error: savedError,
		refetch: refetchSaved,
	} = useQuery({
		queryKey: ["saved-books"],
		queryFn: getSavedBooks,
	});

	const isLoading = activeTab === "Reviews" ? isReviewsLoading : isSavedLoading;

	const error = activeTab === "Reviews" ? reviewsError : savedError;

	const data = useMemo(() => {
		return activeTab === "Reviews" ? (userReviews ?? []) : (savedBooks ?? []);
	}, [activeTab, userReviews, savedBooks]);

	const renderItem = ({ item }: { item: ProfileItem }) => {
		if (activeTab === "Favorites") {
			return <UserBookCard {...(item as Book)} />;
		}

		return <UserReviewCard {...(item as Review)} />;
	};

	const ListHeader = () => (
		<>
			<View className="flex-row justify-between items-center px-4 py-3">
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>

				<Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
					Profile
				</Text>

				<TouchableOpacity onPress={() => router.push("/settings")}>
					<Ionicons name="settings-outline" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
			</View>

			{profileError ? (
				<ErrorMessage message="Failed to load profile" onRetry={refetchProfile} />
			) : isProfileLoading ? (
				<ProfileSkeleton />
			) : (
				<View className="items-center pt-4 px-4">
					<Image source={{ uri: profile?.profileImage }} className="w-24 h-24 rounded-full mb-4" />

					<Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
						{profile?.firstName} {profile?.lastName}
					</Text>

					<Text className="text-center mt-1 mb-3" style={{ color: theme.colors.textSecondary }}>
						{profile?.bio}
					</Text>
				</View>
			)}

			<View className="flex-row justify-around py-2">
				{[
					{ label: "Reviews", value: profile?.reviewsCount },
					{ label: "Followers", value: profile?.followersCount },
					{ label: "Following", value: profile?.followingCount },
				].map((item) => (
					<View key={item.label} className="items-center">
						<Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
							{item.value ?? 0}
						</Text>
						<Text style={{ color: theme.colors.textSecondary }}>{item.label}</Text>
					</View>
				))}
			</View>

			<View className="flex-row justify-around w-full mt-6 py-2">
				{["Reviews", "Favorites"].map((tab) => (
					<TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)} className="pb-3 px-4">
						<Text className="font-semibold text-base" style={{ color: activeTab === tab ? theme.colors.primary : theme.colors.textSecondary }}>
							{tab}
						</Text>
						{activeTab === tab && <View className="h-[3px] rounded-t-full mt-1" style={{ backgroundColor: theme.colors.primary }} />}
					</TouchableOpacity>
				))}
			</View>
		</>
	);

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
				<ProfileSkeleton />
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
				<ErrorMessage
					message={`Failed to load ${activeTab.toLowerCase()}`}
					onRetry={() => {
						activeTab === "Reviews" ? refetchReviews() : refetchSaved();
					}}
				/>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<FlatList
				data={data}
				keyExtractor={(item: ProfileItem) => item._id}
				renderItem={renderItem}
				ListHeaderComponent={ListHeader}
				ListEmptyComponent={
					<View className="items-center justify-center pt-20">
						<Ionicons name="book-outline" size={70} color={isDark ? "#2A2D38" : "#E9E9EA"} />
						<Text style={{ color: theme.colors.textSecondary }}>No {activeTab.toLowerCase()} yet</Text>
					</View>
				}
				contentContainerStyle={{ paddingBottom: 10, paddingInline: 12 }}
			/>
		</SafeAreaView>
	);
}
