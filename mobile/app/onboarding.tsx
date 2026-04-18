import React, { useRef, useState } from "react";
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, ViewToken } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { OnboardingSlides } from "@/data/data";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const Onboarding = () => {
	const router = useRouter();
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
			router.replace("/(auth)/login");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
			<View className="mt-6 flex-row justify-center">
				{OnboardingSlides.map((_, i) => (
					<View key={i} className={`mx-1 h-1.5 rounded-full ${currentIndex === i ? "w-16 bg-violet-600 dark:bg-violet-400" : "w-7 bg-zinc-200 dark:bg-zinc-700"}`} />
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
						<Text className="mt-14 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">{item.title}</Text>
						<Text className="mt-4 text-center text-base leading-6 text-zinc-500 dark:text-zinc-400">{item.description}</Text>
					</View>
				)}
			/>

			<View className="mb-5 p-5">
				<TouchableOpacity className="items-center rounded-2xl bg-violet-600 p-4 dark:bg-violet-500" onPress={handleNext}>
					<Text className="text-lg font-semibold text-white">{currentIndex === OnboardingSlides.length - 1 ? "Get Started" : "Next"}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Onboarding;
