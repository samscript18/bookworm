import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { getAllBooks, getAllGenres } from "@/lib/services/book.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import BookCard from "@/components/ui/book-card";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "expo-router";

const Search = () => {
	const { theme, isDark } = useThemeStore();
	const [searchInput, setSearchInput] = useState<string>("");
	const debouncedSearch = useDebounce(searchInput);
	const [activeGenre, setActiveGenre] = useState<string>("all");
	const [params, setParams] = useState<{ genre?: string; search?: string }>({ genre: "all", search: "" });
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { isFetching: isFetchingGenres, data: genres } = useQuery({
		queryKey: ["all-genres"],
		queryFn: () => getAllGenres(),
	});

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
		queryKey: ["all-books", params],
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			getAllBooks({
				cursor: pageParam,
				genre: params.genre,
				search: params.search,
			}),

		getNextPageParam: (lastPage) => {
			const lp = lastPage as { nextCursor?: string } | undefined;
			return lp?.nextCursor ?? undefined;
		},
	});

	const books = data?.pages.flatMap((page) => page.books) ?? [];

	useEffect(() => {
		setParams((prev) => ({ ...prev, search: debouncedSearch }));
	}, [debouncedSearch]);

	const ListHeader = () => {
		return (
			<View>
				<View className="px-4 pt-6 pb-8 rounded-b-[30px]" style={{ backgroundColor: theme.colors.primary }}>
					<Text className="text-3xl font-bold text-white mb-4">Explore</Text>
					<View className="flex-row items-center p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF" }}>
						<Ionicons name="search" size={20} color={theme.colors.textSecondary} className="mr-2" />
						<TextInput
							placeholder="Search books, authors..."
							placeholderTextColor={theme.colors.textSecondary}
							className="flex-1"
							style={{ color: theme.colors.textPrimary }}
							value={searchInput}
							onChangeText={(val) => {
								setSearchInput(val);
							}}
						/>
					</View>
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mt-6 mb-6">
					{isFetchingGenres ? (
						<View className="w-full h-12 justify-center items-center">
							<ActivityIndicator />
						</View>
					) : (
						genres?.map((genre, index) => (
							<TouchableOpacity
								key={index}
								className="w-fit px-5 py-3 rounded-full mr-3 border"
								style={{
									backgroundColor: activeGenre === genre.name ? theme.colors.primary : isDark ? "#141821" : "#FFFFFF",
									borderColor: activeGenre === genre.name ? theme.colors.primary : isDark ? "#2A2D38" : "#E5E7EB",
								}}
								onPress={() => {
									setParams((prev) => ({ ...prev, genre: genre.name.toLowerCase() }));
									setActiveGenre(genre.name);
								}}
							>
								<Text className="font-semibold capitalize" style={{ color: activeGenre === genre.name ? "#FFFFFF" : theme.colors.textSecondary }}>
									{genre.name}
								</Text>
							</TouchableOpacity>
						))
					)}
				</ScrollView>

				<View className="flex-row justify-between items-center mb-4 px-4">
					<Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
						Available Books
					</Text>
					<View className="flex-row gap-x-4">
						<TouchableOpacity onPress={() => setViewMode("grid")}>
							<Ionicons name="grid-outline" size={20} color={viewMode === "grid" ? theme.colors.primary : theme.colors.textSecondary} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setViewMode("list")}>
							<Ionicons name="list-outline" size={20} color={viewMode === "list" ? theme.colors.primary : theme.colors.textSecondary} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between">
				<FlatList
					key={viewMode}
					data={books}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => (
						<View className="w-[48%]">
							<BookCard book={item} viewMode={viewMode} />
						</View>
					)}
					onEndReached={() => {
						if (hasNextPage) fetchNextPage();
					}}
					onEndReachedThreshold={0.5}
					ListHeaderComponent={ListHeader}
					ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : <View className="h-4" />}
					numColumns={viewMode === "grid" ? 2 : 1}
					columnWrapperStyle={viewMode === "grid" ? { paddingHorizontal: 16, justifyContent: "space-between" } : undefined}
				/>
			</View>
		</SafeAreaView>
	);
};

export default Search;
