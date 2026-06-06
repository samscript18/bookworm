import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/useThemeStore";

interface ErrorMessageProps {
	message?: string;
	onRetry?: () => void;
	showRetry?: boolean;
}

export const ErrorMessage = ({ message = "Something went wrong. Please try again.", onRetry, showRetry = true }: ErrorMessageProps) => {
	const { theme } = useThemeStore();

	return (
		<View className="flex-1 items-center justify-center px-4 py-8">
			<View className="items-center">
				<Ionicons name="alert-circle-outline" size={60} color={theme.colors.primary} />
				<Text className="font-manrope text-lg font-semibold mt-4 text-center" style={{ color: theme.colors.textPrimary }}>
					{message}
				</Text>
				{showRetry && onRetry && (
					<TouchableOpacity onPress={onRetry} className="mt-6 px-8 py-3 rounded-xl" style={{ backgroundColor: theme.colors.primary }}>
						<Text className="font-manrope text-white font-semibold">Try Again</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export const ErrorBanner = ({ message = "Something went wrong", onDismiss }: { message?: string; onDismiss?: () => void }) => {
	const { isDark } = useThemeStore();

	return (
		<View className="px-4 py-3 rounded-lg mb-4 flex-row items-center justify-between" style={{ backgroundColor: isDark ? "#4A2C2C" : "#FEE2E2" }}>
			<View className="flex-row items-center flex-1">
				<Ionicons name="alert-circle" size={20} color="#EF4444" />
				<Text className="font-manrope ml-2 flex-1 text-sm" style={{ color: "#DC2626" }}>
					{message}
				</Text>
			</View>
			{onDismiss && (
				<TouchableOpacity onPress={onDismiss}>
					<Ionicons name="close" size={18} color="#DC2626" />
				</TouchableOpacity>
			)}
		</View>
	);
};
