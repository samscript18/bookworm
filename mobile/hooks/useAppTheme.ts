import { useColorScheme } from "react-native";
import { getThemeByMode, type AppTheme, type ThemeMode } from "@/constants/theme";

export const useAppTheme = (): AppTheme => {
	const colorScheme = useColorScheme();
	const mode: ThemeMode = colorScheme === "dark" ? "dark" : "light";

	return getThemeByMode(mode);
};
