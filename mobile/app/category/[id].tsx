import React from "react";
import { View, Text, ScrollView, TextInput, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { CATEGORIES, CATEGORY_BOOKS } from "@/data/data";

const CategoryDetail = () => {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const isDark = useThemeStore((state) => state.isDark);

	const category = CATEGORIES.filter((category) => category.id === id)[0];

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-[#161719]" edges={["top"]}>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
				<TouchableOpacity onPress={() => router.back()} className="w-10">
					<Ionicons name="arrow-back" size={24} color={isDark ? "#FFF" : "#161719"} />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-[#161719] dark:text-white capitalize">{category.title}</Text>
				<TouchableOpacity className="w-10 items-end">
					<Ionicons name="options-outline" size={24} color={isDark ? "#FFF" : "#161719"} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className="px-4">
				<View className="mt-6 mb-6">
					<View className="flex-row items-center bg-[#F6F6F6] dark:bg-[#2A2A2A] p-3 rounded-2xl mb-4">
						<Ionicons name="search" size={20} color="#91919F" className="mr-2" />
						<TextInput placeholder={`Search in ${category.title}...`} placeholderTextColor="#91919F" className="flex-1 text-[#161719] dark:text-white" />
					</View>

					<View className="flex-row justify-between items-center">
						<Text className="text-[#91919F] font-medium">Found 124 books</Text>
						<TouchableOpacity className="flex-row items-center bg-[#F2E8FF] dark:bg-[#3D1A78] px-3 py-1.5 rounded-lg">
							<Text className="text-[#7F3DFF] dark:text-[#B692FF] font-semibold text-xs mr-1">Sort by: Popular</Text>
							<Ionicons name="chevron-down" size={14} color={isDark ? "#B692FF" : "#7F3DFF"} />
						</TouchableOpacity>
					</View>
				</View>

				<View className="flex-row flex-wrap justify-between pb-10">
					{CATEGORY_BOOKS.map((book) => (
						<TouchableOpacity key={book.id} className="w-[48%] mb-6" onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}>
							<View className="relative">
								<Image source={{ uri: book.image }} className="w-full h-56 rounded-2xl bg-gray-200 dark:bg-gray-800" resizeMode="cover" />
								<View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-lg flex-row items-center">
									<Ionicons name="star" size={12} color="#FFD700" />
									<Text className="text-white text-[10px] font-bold ml-1">{book.rating}</Text>
								</View>
							</View>

							<View className="mt-2">
								<Text className="font-bold text-[#161719] dark:text-white text-base" numberOfLines={1}>
									{book.title}
								</Text>
								<Text className="text-[#91919F] text-sm mt-0.5">{book.author}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>

			<TouchableOpacity className="absolute bottom-8 right-6 bg-[#7F3DFF] w-14 h-14 rounded-full items-center justify-center shadow-lg" activeOpacity={0.8}>
				<Ionicons name="filter" size={24} color="white" />
			</TouchableOpacity>
		</SafeAreaView>
	);
};

export default CategoryDetail;
