export interface ListHeaderProps {
	theme: any;
	isDark: boolean;
	searchInput: string;
	setSearchInput: (text: string) => void;
	debouncedSearch: string;
	activeGenre: string;
	setActiveGenre: (genre: string) => void;
	setParams: React.Dispatch<React.SetStateAction<{ genre?: string; search?: string }>>;
	isFetchingGenres: boolean;
	genres: any[] | undefined;
	genresError: any;
	refetchGenres: () => void;
	viewMode: "grid" | "list";
	setViewMode: (mode: "grid" | "list") => void;
}
