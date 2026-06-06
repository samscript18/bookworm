import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, View, Text, ScrollView, Image, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedBooks, saveBook } from "@/lib/services/book.service";
import { ErrorMessage } from "@/components/ui/error-message";
import { LibraryBookSkeleton } from "@/components/ui/skeleton";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getSecureItem, setSecureItem } from "@/lib/config/secure-storage";
import { Book } from "@/types/book/book";

type LibraryTab = "Reading" | "To Read" | "Completed";
type LibraryStatus = "reading" | "to-read" | "completed";
type LibraryStatusMap = Record<string, LibraryStatus>;
type ProgressMap = Record<string, number>;

const tabToStatus: Record<LibraryTab, LibraryStatus> = {
	Reading: "reading",
	"To Read": "to-read",
	Completed: "completed",
};

const readJsonMap = async <T extends Record<string, unknown>>(key: string): Promise<T> => {
	const raw = await getSecureItem(key);
	if (!raw) return {} as T;

	try {
		return JSON.parse(raw) as T;
	} catch {
		return {} as T;
	}
};

export default function Library() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { theme, isDark } = useThemeStore();
	const [activeTab, setActiveTab] = useState<LibraryTab>("Reading");
	const [libraryStatus, setLibraryStatus] = useState<LibraryStatusMap>({});
	const [readingProgress, setReadingProgress] = useState<ProgressMap>({});

	const {
		isFetching: isFetchingSavedBooks,
		data: savedBooks,
		error: savedBooksError,
		refetch: refetchSavedBooks,
		isRefetching,
	} = useQuery({
		queryKey: ["saved-books"],
		queryFn: () => getSavedBooks(),
	});

	const { mutate: removeSavedBook } = useMutation({
		mutationFn: saveBook,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["saved-books"] });
		},
	});

	const loadLibraryState = useCallback(async () => {
		const [statusMap, progressMap] = await Promise.all([readJsonMap<LibraryStatusMap>(STORAGE_KEYS.LIBRARY_STATUS), readJsonMap<ProgressMap>(STORAGE_KEYS.READING_PROGRESS)]);
		setLibraryStatus(statusMap);
		setReadingProgress(progressMap);
	}, []);

	useEffect(() => {
		loadLibraryState();
	}, [loadLibraryState]);

	const setBookStatus = async (bookId: string, status: LibraryStatus) => {
		const nextStatus = { ...libraryStatus, [bookId]: status };
		const nextProgress = { ...readingProgress };

		if (status === "to-read") nextProgress[bookId] = 0;
		if (status === "completed") nextProgress[bookId] = 100;

		setLibraryStatus(nextStatus);
		setReadingProgress(nextProgress);

		await Promise.all([setSecureItem(STORAGE_KEYS.LIBRARY_STATUS, JSON.stringify(nextStatus)), setSecureItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(nextProgress))]);
	};

	const booksByStatus = useMemo(() => {
		const books = savedBooks ?? [];
		return books.filter((book) => (libraryStatus[book._id] ?? "to-read") === tabToStatus[activeTab]);
	}, [activeTab, libraryStatus, savedBooks]);

	const displayedBooks = booksByStatus;

	const openReader = async (book: Book) => {
		await setBookStatus(book._id, "reading");
		router.push({
			pathname: "/book/read",
			params: {
				bookId: book._id,
				bookTitle: book.title,
			},
		});
	};

	const openBookActions = (book: Book) => {
		Alert.alert(book.title, "Update this book in your library.", [
			{ text: "Start reading", onPress: () => openReader(book) },
			{ text: "Move to To Read", onPress: () => setBookStatus(book._id, "to-read") },
			{ text: "Mark completed", onPress: () => setBookStatus(book._id, "completed") },
			{ text: "Remove from library", style: "destructive", onPress: () => removeSavedBook(book._id) },
			{ text: "Cancel", style: "cancel" },
		]);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="flex-row justify-between items-center px-4 pt-4 mb-4">
				<Text className="font-caveat text-4xl font-bold" style={{ color: theme.colors.textPrimary }}>
					My Library
				</Text>
				<TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/(tabs)/search")}>
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

			<ScrollView
				showsVerticalScrollIndicator={false}
				className="px-4 mt-1"
				refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchSavedBooks} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
			>
				{savedBooksError ? (
					<ErrorMessage message="Your library could not be loaded. Pull down or tap below to try again." onRetry={refetchSavedBooks} />
				) : isFetchingSavedBooks ? (
					<>
						{[1, 2, 3, 4].map((item) => (
							<LibraryBookSkeleton key={item} />
						))}
					</>
				) : displayedBooks.length > 0 ? (
					displayedBooks.map((book) => (
						<TouchableOpacity
							key={book._id}
							activeOpacity={0.85}
							className="flex-row mb-5 rounded-2xl p-3"
							onPress={() => router.push(`/book/${book._id}`)}
							style={{
								backgroundColor: theme.colors.surface,
								borderColor: theme.colors.border,
								borderWidth: 1,
							}}
						>
							<Image source={{ uri: book.coverImage }} className="w-20 h-28 rounded-xl mr-4 bg-gray-200" />

							<View className="flex-1 justify-between">
								<View>
									<Text className="font-manrope font-bold text-base" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
										{book.title}
									</Text>

									<Text className="font-manrope text-sm mt-1" style={{ color: theme.colors.textSecondary }} numberOfLines={1}>
										{book.author}
									</Text>
								</View>

								<View className="flex-row items-center mt-2">
									{/* <View
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
									</View> */}

									<TouchableOpacity className="px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.primary }} onPress={() => openReader(book)}>
										<Text className="font-manrope text-xs font-bold text-white">{activeTab === "Reading" ? "Continue" : "Read"}</Text>
									</TouchableOpacity>
								</View>

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
													width: `${Math.min(100, Math.max(0, readingProgress[book._id] ?? 0))}%`,
													backgroundColor: theme.colors.primary,
												}}
											/>
										</View>
										<Text className="font-manrope text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
											{Math.round(readingProgress[book._id] ?? 0)}% complete
										</Text>
									</View>
								)}
							</View>

							<View className="justify-center pl-2">
								<TouchableOpacity onPress={() => openBookActions(book)} className="w-9 h-9 items-center justify-center">
									<Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textSecondary} />
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					))
				) : (
					<View className="items-center justify-center pt-[50%] px-10">
						<Ionicons name="book-outline" size={70} color={isDark ? "#2A2D38" : "#E9E9EA"} />

						<Text className="font-manrope mt-4 text-center text-base font-medium" style={{ color: theme.colors.textSecondary }}>
							{`No books in "${activeTab}" yet`}
						</Text>
						<TouchableOpacity className="mt-5 px-5 py-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} onPress={() => router.push("/(tabs)/search")}>
							<Text className="font-manrope text-white font-bold">Find books</Text>
						</TouchableOpacity>
					</View>
				)}

				<View className="h-20" />
			</ScrollView>
		</SafeAreaView>
	);
}
