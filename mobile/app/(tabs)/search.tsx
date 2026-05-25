import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { getAllBooks, getAllGenres } from "@/lib/services/book.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import BookCard from "@/components/ui/book-card";
import { useDebounce } from "@/hooks/useDebounce";
import { BookGridSkeleton, BookSkeleton, GenreSkeleton } from "@/components/ui/skeleton";
import { ErrorBanner, ErrorMessage } from "@/components/ui/error-message";
import { ListHeaderProps } from "@/interfaces";

const ListHeader = ({ theme, isDark, searchInput, setSearchInput, activeGenre, setActiveGenre, setParams, isFetchingGenres, genres, genresError, refetchGenres, viewMode, setViewMode }: ListHeaderProps) => {
	return (
		<View>
			<View className="px-4 pt-6 pb-8 rounded-b-[30px]" style={{ backgroundColor: theme.colors.primary }}>
				<Text className="font-caveat text-4xl font-bold text-white mb-4">Explore</Text>
				<View className="flex-row items-center p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#141821" : "#FFFFFF" }}>
					<Ionicons name="search" size={20} color={theme.colors.textSecondary} className="mr-2" />
					<TextInput
						placeholder="Search books, authors..."
						placeholderTextColor={theme.colors.textSecondary}
						className="flex-1"
						style={{ color: theme.colors.textPrimary }}
						value={searchInput}
						onChangeText={setSearchInput}
					/>
				</View>
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mt-6 mb-6">
				{isFetchingGenres ? (
					<>
						{[1, 2, 3, 4].map((i) => (
							<GenreSkeleton key={i} />
						))}
					</>
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
							<Text className="font-manrope font-semibold capitalize" style={{ color: activeGenre === genre.name ? "#FFFFFF" : theme.colors.textSecondary }}>
								{genre.name}
							</Text>
						</TouchableOpacity>
					))
				)}
			</ScrollView>

			{genresError && <ErrorBanner message="Failed to load genres" onDismiss={() => refetchGenres()} />}

			<View className="flex-row justify-between items-center mb-4 px-4">
				<Text className="font-manrope text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
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

const Search = () => {
	const { theme, isDark } = useThemeStore();
	const [searchInput, setSearchInput] = useState<string>("");
	const debouncedSearch = useDebounce(searchInput);
	const [activeGenre, setActiveGenre] = useState<string>("all");
	const [params, setParams] = useState<{ genre?: string; search?: string }>({ genre: "all", search: "" });
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const {
		isFetching: isFetchingGenres,
		data: genres,
		error: genresError,
		refetch: refetchGenres,
		isRefetching: isRefetchingGenres,
	} = useQuery({
		queryKey: ["all-genres"],
		queryFn: () => getAllGenres(),
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingBooks,
		error: booksError,
		refetch: refetchBooks,
		isRefetching,
	} = useInfiniteQuery({
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
	const showInitialBookSkeleton = isLoadingBooks && books.length === 0;

	useEffect(() => {
		setParams((prev) => ({ ...prev, search: debouncedSearch }));
	}, [debouncedSearch]);

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			{booksError && books.length > 0 && <ErrorBanner message="We could not refresh the book list. Tap to try again." onDismiss={() => refetchBooks()} />}
			<View className="flex-row justify-between">
				<FlatList
					key={viewMode}
					data={showInitialBookSkeleton ? Array.from({ length: viewMode === "grid" ? 6 : 4 }, (_, index) => ({ _id: `skeleton-${index}` } as any)) : books}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) =>
						showInitialBookSkeleton ? (
							viewMode === "grid" ? (
								<BookGridSkeleton />
							) : (
								<View className="px-4">
									<BookSkeleton />
								</View>
							)
						) : (
							<View className={viewMode === "grid" ? `w-[48%]` : `w-full`}>
								<BookCard book={item} viewMode={viewMode} />
							</View>
						)
					}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching || isRefetchingGenres}
							onRefresh={async () => {
								await refetchGenres();
								await refetchBooks();
							}}
							colors={[theme.colors.primary]}
							tintColor={theme.colors.primary}
						/>
					}
					onEndReached={() => {
						if (hasNextPage) fetchNextPage();
					}}
					onEndReachedThreshold={0.5}
					ListHeaderComponent={
						<ListHeader
							theme={theme}
							isDark={isDark}
							searchInput={searchInput}
							setSearchInput={setSearchInput}
							debouncedSearch={debouncedSearch}
							activeGenre={activeGenre}
							setActiveGenre={setActiveGenre}
							setParams={setParams}
							isFetchingGenres={isFetchingGenres}
							genres={genres}
							genresError={genresError}
							refetchGenres={refetchGenres}
							viewMode={viewMode}
							setViewMode={setViewMode}
						/>
					}
					ListEmptyComponent={
						booksError ? (
							<ErrorMessage message="Books are not loading right now. Check your connection and try again." onRetry={() => refetchBooks()} />
						) : (
							<View className="items-center px-8 pt-20">
								<Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
								<Text className="font-manrope text-base font-bold mt-4 text-center" style={{ color: theme.colors.textPrimary }}>
									No books found
								</Text>
								<Text className="font-manrope text-sm mt-2 text-center" style={{ color: theme.colors.textSecondary }}>
									Try a different title, author, or genre.
								</Text>
							</View>
						)
					}
					ListFooterComponent={isFetchingNextPage ? <View className="px-4">{viewMode === "grid" ? <BookGridSkeleton /> : <BookSkeleton />}</View> : <View className="h-4" />}
					numColumns={viewMode === "grid" ? 2 : 1}
					columnWrapperStyle={viewMode === "grid" ? { paddingHorizontal: 16, justifyContent: "space-between" } : undefined}
				/>
			</View>
		</SafeAreaView>
	);
};

export default Search;
