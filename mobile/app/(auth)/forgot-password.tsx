import React, { useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { ForgotPasswordType } from "@/types/auth/auth.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { requestForgotPasswordToken } from "@/lib/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";

const ForgotPassword = () => {
	const router = useRouter();
	const { theme } = useThemeStore();
	const { setPasswordResetStep } = useAuthStore();
	const [isFocused, setIsFocused] = React.useState<{ email: boolean }>({ email: false });

	useEffect(() => {
		setPasswordResetStep(1);
	}, [setPasswordResetStep]);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
	} = useForm<ForgotPasswordType>({ resolver: zodResolver(forgotPasswordSchema) });

	const { mutateAsync: _forgotPassword, isPending: isForgotPasswordPending } = useMutation({
		mutationKey: ["auth", "forgot-password"],
		mutationFn: requestForgotPasswordToken,
	});

	const onSubmit = async (data: ForgotPasswordType) => {
		try {
			await _forgotPassword(data);
			router.push("/(auth)/otp-verify");
		} catch (error) {
			console.error("Failed to request forgot password token", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 px-6 pt-6" style={{ backgroundColor: theme.colors.background }}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<TouchableOpacity
					onPress={() => {
						setPasswordResetStep(0);
						router.back();
					}}
					className="mb-10"
				>
					<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
				</TouchableOpacity>

				<View className="items-center mb-8">
					<View className="w-32 h-32 rounded-full justify-center items-center" style={{ backgroundColor: theme.colors.accentSurface }}>
						<View className="w-16 h-16 rounded-2xl justify-center items-center" style={{ backgroundColor: theme.colors.primary }}>
							<Ionicons name="shield-checkmark" size={32} color={theme.colors.onPrimary} />
						</View>
					</View>
				</View>

				<Text className="text-3xl font-bold text-center mb-4" style={{ color: theme.colors.textPrimary }}>
					Forgot Password?
				</Text>
				<Text className="text-base text-center px-4 mb-8 leading-6" style={{ color: theme.colors.textSecondary }}>
					Don't worry! Enter your email address and we'll send you a code to reset your password.
				</Text>

				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, value } }) => (
						<View className="mb-5">
							<View
								className="flex-row items-center p-6 rounded-2xl mb-4"
								style={{
									backgroundColor: theme.colors.surfaceMuted,
									borderWidth: 1,
									borderColor: errors.email ? theme.colors.error : isFocused.email ? theme.colors.primary : theme.colors.inputBorder,
								}}
							>
								<Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} className="mr-3" />
								<TextInput
									placeholder="Email address"
									placeholderTextColor={theme.colors.textMuted}
									keyboardType="email-address"
									autoCapitalize="none"
									className="rounded-2xl flex-1 ml-2 text-base"
									style={{ color: theme.colors.textPrimary }}
									value={value}
									onChangeText={onChange}
									onFocus={() => setIsFocused({ ...isFocused, email: true })}
									onBlur={() => setIsFocused({ ...isFocused, email: false })}
								/>
							</View>
							{errors.email && (
								<Text className="mt-1 text-sm" style={{ color: theme.colors.error }}>
									{errors.email.message}
								</Text>
							)}
						</View>
					)}
				/>

				<TouchableOpacity className="p-4 rounded-2xl items-center mb-6" style={{ backgroundColor: theme.colors.primary }} onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isForgotPasswordPending}>
					{isSubmitting || isForgotPasswordPending ? (
						<ActivityIndicator size={20} color={theme.colors.onPrimary} />
					) : (
						<Text className="text-base font-bold" style={{ color: theme.colors.onPrimary }}>
							Send Reset Code
						</Text>
					)}
				</TouchableOpacity>

				<Text className="text-center text-base mt-8" style={{ color: theme.colors.textSecondary }}>
					Remember your password?{" "}
					<Link href="/(auth)/login" className="font-bold" style={{ color: theme.colors.primary }}>
						Back to Login
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ForgotPassword;
