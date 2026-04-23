import { darkTheme, lightTheme } from "@/constants/theme";
import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext(lightTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const scheme = useColorScheme();
	console.log("System color scheme:", scheme);
	const theme = scheme === "dark" ? darkTheme : lightTheme;

	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
