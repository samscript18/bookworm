import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Linking, NativeScrollEvent, NativeSyntheticEvent, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { ErrorMessage } from "@/components/ui/error-message";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getSecureItem, setSecureItem } from "@/lib/config/secure-storage";
import { addBookToLibrary, getBook } from "@/lib/services/book.service";
import { useThemeStore } from "@/store/useThemeStore";

type ProgressMap = Record<string, number>;
type OffsetMap = Record<string, number>;
type LibraryStatusMap = Record<string, "reading" | "to-read" | "completed">;
type ReadingParagraphProps = {
	section: ReadingSection;
	color: string;
	headingColor: string;
};
type ReadingSection = {
	id: string;
	text: string;
	type: "title" | "chapter" | "paragraph";
};

const ReadingParagraph = memo(({ section, color, headingColor }: ReadingParagraphProps) => (
	<Text
		selectable
		className={section.type === "paragraph" ? "font-manrope text-[17px] leading-8 mb-5" : "font-manrope font-bold mb-4 mt-3"}
		style={{
			color: section.type === "paragraph" ? color : headingColor,
			fontSize: section.type === "title" ? 22 : section.type === "chapter" ? 19 : 17,
			lineHeight: section.type === "paragraph" ? 32 : 28,
			textAlign: section.type === "paragraph" ? "left" : "center",
		}}
	>
		{section.text}
	</Text>
));

ReadingParagraph.displayName = "ReadingParagraph";

const stripGutenbergBoilerplate = (content: string): string => {
	const startMatch = content.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i);
	const endMatch = content.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
	const startIndex = startMatch?.index === undefined ? 0 : startMatch.index + startMatch[0].length;
	const endIndex = endMatch?.index === undefined ? content.length : endMatch.index;

	const stripped = content
		.slice(startIndex, endIndex)
		.replace(/\r/g, "")
		.replace(/\n{4,}/g, "\n\n\n")
		.trim();

	return stripped.length > 200
		? stripped
		: content
				.replace(/\r/g, "")
				.replace(/\n{4,}/g, "\n\n\n")
				.trim();
};

const normalizeTxtContent = (content: string): string => {
	return content
		.replace(/^\uFEFF/, "")
		.replace(/\uFFFD/g, "'")
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{4,}/g, "\n\n\n")
		.trim();
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

const getSectionType = (text: string, index: number): ReadingSection["type"] => {
	const normalized = text.trim();
	if (index === 0 && normalized.length <= 140) return "title";
	if (/^(chapter|book|part|section)\s+([ivxlcdm]+|\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(normalized)) return "chapter";
	if (/^[A-Z0-9 .,'":;!?-]{4,90}$/.test(normalized) && normalized.length <= 90) return "chapter";
	return "paragraph";
};

const createReadingSections = (text: string): ReadingSection[] => {
	const paragraphs = text
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.replace(/\n/g, " ").replace(/[ \t]+/g, " ").trim())
		.filter(Boolean);

	return paragraphs.flatMap((paragraph, paragraphIndex) => {
		const type = getSectionType(paragraph, paragraphIndex);
		if (paragraph.length <= 2200) return [{ id: `section-${paragraphIndex}`, text: paragraph, type }];

		const chunks: ReadingSection[] = [];
		for (let index = 0; index < paragraph.length; index += 2200) {
			chunks.push({
				id: `section-${paragraphIndex}-${index}`,
				text: paragraph.slice(index, index + 2200).trim(),
				type: "paragraph",
			});
		}
		return chunks;
	});
};

export default function BookReader() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const listRef = useRef<FlatList<ReadingSection>>(null);
	const offsetRef = useRef<number>(0);
	const progressRef = useRef<number>(0);
	const hasRestoredOffsetRef = useRef<boolean>(false);
	const { bookId, bookTitle } = useLocalSearchParams<{ bookId: string; bookTitle?: string }>();
	const { theme, isDark } = useThemeStore();
	const [content, setContent] = useState<string>("");
	const [contentError, setContentError] = useState<boolean>(false);
	const [isFetchingContent, setIsFetchingContent] = useState<boolean>(false);
	const [contentLoadAttempt, setContentLoadAttempt] = useState<number>(0);
	const [progress, setProgress] = useState<number>(0);

	const {
		data: book,
		error: bookError,
		isFetching: isFetchingBook,
		refetch,
	} = useQuery({
		queryKey: ["book", bookId],
		queryFn: () => getBook(bookId),
		enabled: Boolean(bookId),
	});

	const title = book?.title ?? bookTitle ?? "Reader";
	const readingUrl = book?.readingUrl;
	const readingSections = useMemo<ReadingSection[]>(() => createReadingSections(content), [content]);
	const paragraphColor = isDark ? "#E5E7EB" : "#2B2A27";
	const headingColor = isDark ? "#FFFFFF" : "#171412";
	const readerBackground = isDark ? "#0B0C10" : "#FBF7EF";
	const paperColor = isDark ? "#11131A" : "#FFFDF8";

	const { mutate: saveOpenedBook } = useMutation({
		mutationKey: ["add-book-to-library", bookId],
		mutationFn: addBookToLibrary,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["saved-books"] });
		},
	});

	const persistReadingPosition = useCallback(
		async (nextProgress: number, nextOffset: number) => {
			if (!bookId) return;

			const [progressMap, offsetMap, statusMap] = await Promise.all([
				readJsonMap<ProgressMap>(STORAGE_KEYS.READING_PROGRESS),
				readJsonMap<OffsetMap>(STORAGE_KEYS.READING_OFFSET),
				readJsonMap<LibraryStatusMap>(STORAGE_KEYS.LIBRARY_STATUS),
			]);
			progressMap[bookId] = nextProgress;
			offsetMap[bookId] = nextOffset;
			statusMap[bookId] = nextProgress >= 100 ? "completed" : "reading";

			await Promise.all([
				setSecureItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progressMap)),
				setSecureItem(STORAGE_KEYS.READING_OFFSET, JSON.stringify(offsetMap)),
				setSecureItem(STORAGE_KEYS.LIBRARY_STATUS, JSON.stringify(statusMap)),
			]);
		},
		[bookId],
	);

	useEffect(() => {
		if (!readingUrl) return;

		let mounted = true;

		const loadContent = async () => {
			setIsFetchingContent(true);
			setContentError(false);

			try {
				const response = await axios.get<string>(readingUrl, {
					responseType: "text",
					transformResponse: [(data) => data],
					headers: {
						Accept: "text/plain; charset=utf-8, text/plain, */*",
					},
					timeout: 20000,
				});

				const text = typeof response.data === "string" ? response.data : String(response.data);
				const readableContent = normalizeTxtContent(stripGutenbergBoilerplate(text));
				if (!readableContent) throw new Error("Book content is empty");
				if (mounted) setContent(readableContent);
			} catch {
				if (mounted) setContentError(true);
			} finally {
				if (mounted) setIsFetchingContent(false);
			}
		};

		loadContent();

		return () => {
			mounted = false;
		};
	}, [contentLoadAttempt, readingUrl]);

	useEffect(() => {
		if (!bookId) return;

		saveOpenedBook(bookId);
	}, [bookId, saveOpenedBook]);

	useEffect(() => {
		if (!bookId) return;

		Promise.all([readJsonMap<ProgressMap>(STORAGE_KEYS.READING_PROGRESS), readJsonMap<OffsetMap>(STORAGE_KEYS.READING_OFFSET)]).then(([progressMap, offsetMap]) => {
			progressRef.current = progressMap[bookId] ?? 0;
			offsetRef.current = offsetMap[bookId] ?? 0;
			setProgress(progressMap[bookId] ?? 0);
		});
	}, [bookId]);

	useEffect(() => {
		hasRestoredOffsetRef.current = false;
	}, [bookId, contentLoadAttempt]);

	useEffect(() => {
		if (!bookId) return;

		const markAsReading = async () => {
			const statusMap = await readJsonMap<LibraryStatusMap>(STORAGE_KEYS.LIBRARY_STATUS);
			if (statusMap[bookId] === "completed") return;

			statusMap[bookId] = "reading";
			await setSecureItem(STORAGE_KEYS.LIBRARY_STATUS, JSON.stringify(statusMap));
		};

		markAsReading();
	}, [bookId]);

	useEffect(() => {
		return () => {
			if (!bookId) return;
			persistReadingPosition(progressRef.current, offsetRef.current);
		};
	}, [bookId, persistReadingPosition]);

	const progressLabel = useMemo(() => `${Math.round(progress)}%`, [progress]);

	const restoreReadingOffset = useCallback(() => {
		if (hasRestoredOffsetRef.current || offsetRef.current <= 0 || readingSections.length === 0) return;

		hasRestoredOffsetRef.current = true;
		requestAnimationFrame(() => {
			listRef.current?.scrollToOffset({ offset: offsetRef.current, animated: false });
		});
	}, [readingSections.length]);

	const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
		const scrollableHeight = contentSize.height - layoutMeasurement.height;
		if (scrollableHeight <= 0) return;

		offsetRef.current = contentOffset.y;
		const nextProgress = Math.min(100, Math.max(0, (contentOffset.y / scrollableHeight) * 100));
		const previousRoundedProgress = Math.round(progressRef.current);
		progressRef.current = nextProgress;

		if (Math.round(nextProgress) !== previousRoundedProgress) {
			setProgress(nextProgress);
		}
	}, []);

	const handlePersistPosition = useCallback(() => {
		persistReadingPosition(progressRef.current, offsetRef.current);
	}, [persistReadingPosition]);

	const keyExtractor = useCallback((item: ReadingSection) => item.id, []);

	const renderParagraph = useCallback(({ item }: { item: ReadingSection }) => <ReadingParagraph section={item} color={paragraphColor} headingColor={headingColor} />, [headingColor, paragraphColor]);

	if (bookError) {
		return <ErrorMessage message="Failed to load book" onRetry={() => refetch()} />;
	}

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: readerBackground }} edges={["top"]}>
			<View className="px-4 pt-2 pb-3 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
				<TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.colors.surface }}>
					<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />
				</TouchableOpacity>

				<View className="flex-1 px-3">
					<Text className="font-manrope font-bold text-base text-center" style={{ color: theme.colors.textPrimary }} numberOfLines={1}>
						{title}
					</Text>
					<Text className="font-manrope text-xs text-center mt-1" style={{ color: theme.colors.textSecondary }}>
						{progressLabel} read
					</Text>
				</View>

				<TouchableOpacity
					disabled={!readingUrl}
					onPress={() => readingUrl && Linking.openURL(readingUrl)}
					className="w-10 h-10 items-center justify-center rounded-full"
					style={{ backgroundColor: theme.colors.surface }}
				>
					<Ionicons name="open-outline" size={20} color={readingUrl ? theme.colors.textPrimary : theme.colors.textMuted} />
				</TouchableOpacity>
			</View>
			<View className="h-1" style={{ backgroundColor: isDark ? "#1B1E28" : "#EFE7D8" }}>
				<View className="h-full" style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: theme.colors.primary }} />
			</View>

			{isFetchingBook || isFetchingContent ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator color={theme.colors.primary} />
					<Text className="font-manrope mt-4" style={{ color: theme.colors.textSecondary }}>
						Loading book...
					</Text>
				</View>
			) : !readingUrl ? (
				<View className="flex-1 px-5 pt-10">
					<Text className="font-manrope text-lg font-bold mb-3" style={{ color: theme.colors.textPrimary }}>
						Reading copy unavailable
					</Text>
					<Text className="font-manrope text-base leading-7" style={{ color: theme.colors.textSecondary }}>
						This saved book does not have a readable public-domain URL yet. New synced books from Project Gutenberg include full text when available.
					</Text>
				</View>
			) : contentError || readingSections.length === 0 ? (
				<ErrorMessage message="The book text could not be loaded. Try again, or open the source copy." onRetry={() => setContentLoadAttempt((attempt) => attempt + 1)} />
			) : (
				<FlatList
					ref={listRef}
					className="flex-1"
					contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 64 }}
					scrollEventThrottle={500}
					onScroll={handleScroll}
					onMomentumScrollEnd={handlePersistPosition}
					onScrollEndDrag={handlePersistPosition}
					onContentSizeChange={restoreReadingOffset}
					data={readingSections}
					keyExtractor={keyExtractor}
					initialNumToRender={18}
					maxToRenderPerBatch={8}
					updateCellsBatchingPeriod={80}
					windowSize={7}
					removeClippedSubviews
					ListHeaderComponent={
						<View className="rounded-2xl px-5 py-6 mb-5" style={{ backgroundColor: paperColor, borderWidth: 1, borderColor: isDark ? "#252936" : "#EFE2CC" }}>
							<Text className="font-manrope text-2xl font-bold text-center" style={{ color: headingColor }}>
								{book?.title}
							</Text>
							<Text className="font-manrope text-sm text-center mt-2" style={{ color: theme.colors.textSecondary }}>
								{book?.author}
							</Text>
						</View>
					}
					renderItem={renderParagraph}
				/>
			)}
		</SafeAreaView>
	);
}
