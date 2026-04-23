import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "./theme";

const queryClient = new QueryClient();

export const AppProvider = ({ children }: { children: ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>{children}</ThemeProvider>
			<Toast topOffset={56} />
		</QueryClientProvider>
	);
};
