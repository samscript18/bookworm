import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LIBRARY_BOOKS } from "@/data/data";
import { useThemeStore } from "@/store/useThemeStore";

export default function Library() {
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<string>("Reading");
	const displayedBooks = LIBRARY_BOOKS.filter((book) => book.status === activeTab);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between items-center px-4 pt-4 mb-4">
				<Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
					My Library
				</Text>
				<TouchableOpacity>
					<Ionicons name="add-circle" size={28} color={theme.colors.primary} />
				</TouchableOpacity>
			</View>

			<View className="flex-row px-4 my-6 gap-x-4">
				{["Reading", "To Read", "Completed"].map((tab) => (
					<TouchableOpacity
						key={tab}
						onPress={() => setActiveTab(tab)}
						className="px-5 py-2 rounded-full border"
						style={{
							backgroundColor: activeTab === tab ? theme.colors.primary : "transparent",
							borderColor: activeTab === tab ? theme.colors.primary : theme.colors.border,
						}}
					>
						<Text className="font-semibold" style={{ color: activeTab === tab ? theme.colors.onPrimary : theme.colors.textSecondary }}>
							{tab}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className="px-4">
				{displayedBooks.length > 0 ? (
					displayedBooks.map((book) => (
						<TouchableOpacity key={book.id} className="flex-row mb-6 rounded-2xl shadow-sm border p-3" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
							<Image source={{ uri: book.image }} className="w-20 h-28 rounded-lg bg-gray-200 mr-4" />
							<View className="flex-1 justify-center">
								<Text className="font-bold text-lg mb-1" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
									{book.title}
								</Text>
								<Text style={{ color: theme.colors.textSecondary }} className="mb-3">
									{book.author}
								</Text>

								{book.status === "Reading" && (
									<View>
										<View className="flex-row justify-between mb-1">
											<Text className="font-medium text-xs" style={{ color: theme.colors.textPrimary }}>
												{book.progress}%
											</Text>
											<Text className="text-xs" style={{ color: theme.colors.textSecondary }}>
												{((book.progress! / 100) * book.totalPages!).toFixed(0)} / {book.totalPages} pages
											</Text>
										</View>
										<View className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#2B2140" : "#F2E8FF" }}>
											<View className="h-full rounded-full" style={{ width: `${book.progress!}%`, backgroundColor: theme.colors.primary }} />
										</View>
									</View>
								)}

								{book.status !== "Reading" && (
									<View className="flex-row items-center">
										<Ionicons name="checkmark-circle" size={16} color={book.status === "Completed" ? "#00A86B" : theme.colors.textSecondary} />
										<Text className="ml-1 text-sm" style={{ color: book.status === "Completed" ? "#00A86B" : theme.colors.textSecondary }}>
											{book.status}
										</Text>
									</View>
								)}
							</View>
							<TouchableOpacity className="justify-center pl-2">
								<Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
							</TouchableOpacity>
						</TouchableOpacity>
					))
				) : (
					<View className="items-center justify-center pt-20">
						<Ionicons name="book-outline" size={60} color={isDark ? "#2A2D38" : "#E9E9EA"} />
						<Text className="mt-4 text-base" style={{ color: theme.colors.textSecondary }}>
							No books in this list yet.
						</Text>
					</View>
				)}
				<View className="h-20" />
			</ScrollView>
		</SafeAreaView>
	);
}
