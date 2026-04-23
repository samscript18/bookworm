import React, { useMemo, useRef, useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppTheme } from "@/providers/theme";

const OtpVerification = () => {
	const router = useRouter();
	const theme = useAppTheme();
	const isDark = theme.mode === "dark";
	const [code, setCode] = useState<Array<string>>(["", "", "", "", "", ""]);
	const inputRefs = useRef<Array<TextInput | null>>([]);
	const { setForgotPasswordToken, setPasswordResetStep } = useAuthStore();

	useEffect(() => {
		setPasswordResetStep(2);
	}, [setPasswordResetStep]);

	const joinedCode = useMemo(() => code.join(""), [code]);
	const isCodeComplete = joinedCode.length === 6;

	const handleChangeDigit = (value: string, index: number) => {
		const cleaned = value.replace(/[^0-9]/g, "");
		const next = [...code];
		next[index] = cleaned;
		setCode(next);

		if (cleaned && index < code.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		if (key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleSubmit = () => {
		setForgotPasswordToken(joinedCode);
		router.push("/(auth)/reset-password");
	};

	return (
		<SafeAreaView className="flex-1 px-6 pt-6" style={{ backgroundColor: theme.colors.background }}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<TouchableOpacity
					onPress={() => {
						setPasswordResetStep(1);
						router.back();
					}}
					className="mb-10"
				>
					<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
				</TouchableOpacity>

				<View className="items-center mb-8">
					<View className="w-32 h-32 rounded-full justify-center items-center" style={{ backgroundColor: theme.colors.inputFocusBackground }}>
						<View className="w-16 h-16 rounded-2xl justify-center items-center shadow-lg" style={{ backgroundColor: theme.colors.primary }}>
							<Ionicons name="mail-open-outline" size={30} color={theme.colors.onPrimary} />
						</View>
					</View>
				</View>

				<Text className="text-3xl font-bold text-center mb-4" style={{ color: theme.colors.textPrimary }}>
					OTP Verification
				</Text>
				<Text className="text-base text-center px-4 mb-8 leading-6" style={{ color: theme.colors.textSecondary }}>
					Enter the 6-digit code sent to your email to continue resetting your password.
				</Text>

				<View className="mb-7 flex-row justify-between">
					{code.map((digit, index) => (
						<TextInput
							key={index}
							ref={(el) => {
								inputRefs.current[index] = el;
							}}
							className="h-16 w-14 rounded-2xl border text-center text-xl font-bold"
							style={{
								borderColor: theme.colors.inputBorder,
								backgroundColor: isDark ? theme.colors.surfaceMuted : theme.colors.surface,
								color: theme.colors.textPrimary,
							}}
							keyboardType="number-pad"
							placeholderTextColor={theme.colors.textMuted}
							maxLength={1}
							value={digit}
							onChangeText={(value) => handleChangeDigit(value, index)}
							onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
						/>
					))}
				</View>

				<TouchableOpacity
					onPress={handleSubmit}
					className="p-4 rounded-2xl items-center mb-6"
					style={{ backgroundColor: isCodeComplete ? theme.colors.primary : theme.colors.buttonDisabled }}
					disabled={!isCodeComplete}
				>
					<Text className="text-base font-bold" style={{ color: theme.colors.onPrimary }}>
						Verify Code
					</Text>
				</TouchableOpacity>

				<View className="items-center mt-2">
					<Text className="text-base" style={{ color: theme.colors.textSecondary }}>
						Did not get the code?
					</Text>
					<TouchableOpacity className="mt-6">
						<Text className="text-base font-semibold" style={{ color: theme.colors.primary }}>
							Resend in 00:30
						</Text>
					</TouchableOpacity>
				</View>

				<Text className="text-center text-base mt-8" style={{ color: theme.colors.textSecondary }}>
					Wrong email?{" "}
					<Link href="/(auth)/forgot-password" className="font-bold" style={{ color: theme.colors.primary }}>
						Change it
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default OtpVerification;
