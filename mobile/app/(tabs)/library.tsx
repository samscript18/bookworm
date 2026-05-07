import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { useQuery } from "@tanstack/react-query";
import { getSavedBooks } from "@/lib/services/book.service";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";

export default function Library() {
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<"Reading" | "To Read" | "Completed">("To Read");

	const {
		isFetching: isFetchingSavedBooks,
		data: savedBooks,
		error: savedBooksError,
		refetch: refetchSavedBooks,
	} = useQuery({
		queryKey: ["saved-books"],
		queryFn: getSavedBooks,
	});

	const displayedBooks = savedBooks ?? [];

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between items-center px-4 pt-4 mb-4">
				<Text className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
					My Library
				</Text>

				<TouchableOpacity activeOpacity={0.8}>
					<Ionicons name="add-circle" size={30} color={theme.colors.primary} />
				</TouchableOpacity>
			</View>

			<View className="flex-row px-4 mb-8 gap-x-3">
				{["Reading", "To Read", "Completed"].map((tab) => {
					const isActive = activeTab === tab;

					return (
						<TouchableOpacity
							key={tab}
							onPress={() => setActiveTab(tab as any)}
							activeOpacity={0.85}
							className="px-5 py-2 rounded-full"
							style={{
								backgroundColor: isActive ? theme.colors.primary : "transparent",
								borderWidth: 1,
								borderColor: isActive ? theme.colors.primary : theme.colors.border,
								transform: [{ scale: isActive ? 1.05 : 1 }],
							}}
						>
							<Text
								className="font-semibold"
								style={{
									color: isActive ? "#fff" : theme.colors.textPrimary,
								}}
							>
								{tab}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			<ScrollView showsVerticalScrollIndicator={false} className="px-4 mt-1">
				{savedBooksError ? (
					<ErrorMessage message="Failed to load saved books" onRetry={refetchSavedBooks} />
				) : isFetchingSavedBooks ? (
					<Skeleton />
				) : displayedBooks.length > 0 ? (
					displayedBooks.map((book) => (
						<TouchableOpacity
							key={book._id}
							activeOpacity={0.85}
							className="flex-row mb-5 rounded-2xl p-3"
							style={{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
								borderWidth: 1,
							}}
						>
							<Image source={{ uri: book.coverImage }} className="w-20 h-28 rounded-xl mr-4 bg-gray-200" />

							<View className="flex-1 justify-between">
								<View>
									<Text className="font-bold text-base" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
										{book.title}
									</Text>

									<Text className="text-sm mt-1" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
										{book.author}
									</Text>
								</View>

								<View className="flex-row items-center mt-2">
									<View
										style={{
											paddingHorizontal: 10,
											paddingVertical: 4,
											borderRadius: 999,
											backgroundColor: activeTab === "Completed" ? "#DCFCE7" : activeTab === "Reading" ? "#DBEAFE" : isDark ? "#2A2D38" : "#F3F4F6",
										}}
									>
										<Text
											className="text-xs font-semibold"
											style={{
												color: activeTab === "Completed" ? "#16A34A" : activeTab === "Reading" ? "#2563EB" : theme.colors.textSecondary,
											}}
										>
											{activeTab}
										</Text>
									</View>
								</View>

								{/* Progress */}
								{activeTab === "Reading" && (
									<View className="mt-3">
										<View
											className="h-2 rounded-full overflow-hidden"
											style={{
												backgroundColor: isDark ? "#2B2140" : "#F2E8FF",
											}}
										>
											<View
												className="h-full rounded-full"
												style={{
													width: `${0}%`,
													backgroundColor: theme.colors.primary,
												}}
											/>
										</View>
									</View>
								)}
							</View>

							<View className="justify-center pl-2">
								<Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
							</View>
						</TouchableOpacity>
					))
				) : (
					<View className="items-center justify-center pt-[50%] px-10">
						<Ionicons name="book-outline" size={70} color={isDark ? "#2A2D38" : "#E9E9EA"} />

						<Text className="mt-4 text-center text-base font-medium" style={{ color: theme.colors.textSecondary }}>
							No books in "{activeTab}" yet
						</Text>
					</View>
				)}

				<View className="h-20" />
			</ScrollView>
		</SafeAreaView>
	);
}
