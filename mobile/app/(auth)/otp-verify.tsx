import React, { useMemo, useRef, useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";

const OtpVerification = () => {
	const router = useRouter();
	const isDark = useColorScheme() === "dark";
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
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 px-6 pt-6">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<TouchableOpacity
					onPress={() => {
						setPasswordResetStep(1);
						router.back();
					}}
					className="mb-10"
				>
					<Ionicons name="chevron-back" size={28} color={isDark ? "#F4F5F7" : "#161719"} />
				</TouchableOpacity>

				<View className="items-center mb-8">
					<View className="w-32 h-32 bg-violet-100 dark:bg-violet-950 rounded-full justify-center items-center">
						<View className="w-16 h-16 bg-violet-600 rounded-2xl justify-center items-center shadow-lg">
							<Ionicons name="mail-open-outline" size={30} color="#FFF" />
						</View>
					</View>
				</View>

				<Text className="text-3xl font-bold text-[#161719] dark:text-zinc-100 text-center mb-4">OTP Verification</Text>
				<Text className="text-[#91919F] dark:text-zinc-400 text-base text-center px-4 mb-8 leading-6">Enter the 6-digit code sent to your email to continue resetting your password.</Text>

				<View className="mb-7 flex-row justify-between">
					{code.map((digit, index) => (
						<TextInput
							key={index}
							ref={(el) => {
								inputRefs.current[index] = el;
							}}
							className={`h-16 w-14 rounded-2xl border text-center text-xl font-bold focus:border-violet-500 focus:bg-violet-50 dark:focus:bg-violet-950 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[#161719] dark:text-zinc-100`}
							keyboardType="number-pad"
							placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
							maxLength={1}
							value={digit}
							onChangeText={(value) => handleChangeDigit(value, index)}
							onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
						/>
					))}
				</View>

				<TouchableOpacity onPress={handleSubmit} className={`p-4 rounded-2xl items-center mb-6 ${isCodeComplete ? "bg-violet-600" : "bg-[#D7D8DE] dark:bg-zinc-700"}`} disabled={!isCodeComplete}>
					<Text className="text-white text-base font-bold">Verify Code</Text>
				</TouchableOpacity>

				<View className="items-center mt-2">
					<Text className="text-base text-[#91919F] dark:text-zinc-400">Did not get the code?</Text>
					<TouchableOpacity className="mt-6">
						<Text className="text-base font-semibold text-violet-500">Resend in 00:30</Text>
					</TouchableOpacity>
				</View>

				<Text className="text-center text-base text-[#91919F] dark:text-zinc-400 mt-8">
					Wrong email?{" "}
					<Link href="/(auth)/forgot-password" className="text-violet-500 font-bold">
						Change it
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default OtpVerification;
