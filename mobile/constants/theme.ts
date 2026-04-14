export type ThemeMode = "light" | "dark";

export type AppTheme = {
	mode: ThemeMode;
	colors: {
		background: string;
		textPrimary: string;
		textSecondary: string;
		primary: string;
		onPrimary: string;
		dot: string;
	};
};

export const lightTheme: AppTheme = {
	mode: "light",
	colors: {
		background: "#FFFFFF",
		textPrimary: "#161719",
		textSecondary: "#91919F",
		primary: "#7F3DFF",
		onPrimary: "#FFFFFF",
		dot: "#EEEEEE",
	},
};

export const darkTheme: AppTheme = {
	mode: "dark",
	colors: {
		background: "#0E0F13",
		textPrimary: "#F4F5F7",
		textSecondary: "#B8BCC8",
		primary: "#9B6BFF",
		onPrimary: "#FFFFFF",
		dot: "#2A2D38",
	},
};

export const getThemeByMode = (mode: ThemeMode): AppTheme => {
	return mode === "dark" ? darkTheme : lightTheme;
};
