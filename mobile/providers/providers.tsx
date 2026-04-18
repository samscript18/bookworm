import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import Toast from "react-native-toast-message";

const queryClient = new QueryClient();

export const AppProvider = ({ children }: { children: ReactNode }) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<Toast topOffset={56} />
		</QueryClientProvider>
	);
};
