import { Ionicons } from "@expo/vector-icons";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { useThemeStore } from "@/store/useThemeStore";

interface SettingRowProps {
	icon: any;
	title: string;
	type?: "link" | "switch";
	value?: boolean;
	onValueChange?: (val: boolean) => void;
	rightText?: string;
	onPress?: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const { theme } = useThemeStore();
	return (
		<View className="mb-6">
			<Text className="font-manrope text-xs font-bold mb-2 uppercase" style={{ color: theme.colors.textSecondary }}>
				{title}
			</Text>
			<View style={{ backgroundColor: theme.colors.background }}>{children}</View>
		</View>
	);
};

const SettingRow = ({ icon, title, type = "link", value, onValueChange, rightText, onPress }: SettingRowProps) => {
	const { theme, isDark } = useThemeStore();
	const isSwitch = type === "switch";
	const Container = isSwitch ? View : TouchableOpacity;

	return (
		<Container className="flex-row items-center py-6 border-b" style={{ borderBottomColor: isDark ? theme.colors.accentSurface : theme.colors.inputBorder }} onPress={!isSwitch ? onPress : undefined} activeOpacity={0.7}>
			<Ionicons name={icon} size={22} color={theme.colors.textSecondary} className="mr-3" />
			<Text className="font-manrope flex-1 text-base" style={{ color: theme.colors.textPrimary }}>
				{title}
			</Text>

			{rightText && (
				<Text className={`mr-2 ${rightText === "••••••••" ? "tracking-widest" : ""}`} style={{ color: theme.colors.textSecondary }}>
					{rightText.length > 22 ? rightText.slice(0, 22) + "..." : rightText}
				</Text>
			)}

			{isSwitch ? (
				<Switch value={value} onValueChange={onValueChange} trackColor={{ false: theme.colors.buttonDisabled, true: theme.colors.primary }} thumbColor="white" />
			) : (
				<Ionicons name="chevron-forward" size={20} color={theme.colors.divider} />
			)}
		</Container>
	);
};

export { Section, SettingRow };
