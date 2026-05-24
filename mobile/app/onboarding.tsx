import React, { useRef, useState } from "react";
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { OnboardingSlides } from "@/data/data";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";

const { width, height } = Dimensions.get("window");

const Onboarding = () => {
	const router = useRouter();
	const { theme } = useThemeStore();
	const setHasCompletedOnboarding = useAuthStore((state) => state.setHasCompletedOnboarding);
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);

	const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
		if (viewableItems.length > 0) {
			setCurrentIndex(viewableItems[0].index ?? 0);
		}
	}).current;

	const handleNext = () => {
		if (currentIndex < OnboardingSlides.length - 1) {
			flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
		} else {
			setHasCompletedOnboarding(true);
			router.replace("/login");
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
			<View className="mt-6 flex-row justify-center">
				{OnboardingSlides.map((_, i) => (
					<View key={i} className={`mx-1 h-1.5 rounded-full ${currentIndex === i ? "w-16" : "w-7"}`} style={{ backgroundColor: currentIndex === i ? theme.colors.primary : theme.colors.divider }} />
				))}
			</View>

			<FlatList
				ref={flatListRef}
				data={OnboardingSlides}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="items-center px-10 pt-14" style={{ width }}>
						<Image source={{ uri: item.image }} style={{ width: width * 0.8, height: height * 0.4 }} resizeMode="contain" />
						<Text className="font-manrope mt-14 text-center text-3xl font-bold" style={{ color: theme.colors.textPrimary }}>
							{item.title}
						</Text>
						<Text className="font-manrope mt-4 text-center text-base leading-6" style={{ color: theme.colors.textSecondary }}>
							{item.description}
						</Text>
					</View>
				)}
			/>

			<View className="mb-5 p-5">
				<TouchableOpacity className="items-center rounded-2xl p-4" style={{ backgroundColor: theme.colors.primary }} onPress={handleNext}>
					<Text className="font-manrope text-lg font-semibold" style={{ color: theme.colors.onPrimary }}>
						{currentIndex === OnboardingSlides.length - 1 ? "Get Started" : "Next"}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Onboarding;
