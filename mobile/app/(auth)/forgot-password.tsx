import React, { useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
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

const ForgotPassword = () => {
	const router = useRouter();
	const isDark = useColorScheme() === "dark";
	const iconColor = isDark ? "#B8BCC8" : "#91919F";
	const { setPasswordResetStep } = useAuthStore();

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
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 px-6 pt-6">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<TouchableOpacity
					onPress={() => {
						setPasswordResetStep(0);
						router.back();
					}}
					className="mb-10"
				>
					<Ionicons name="chevron-back" size={28} color={isDark ? "#F4F5F7" : "#161719"} />
				</TouchableOpacity>

				<View className="items-center mb-8">
					<View className="w-32 h-32 bg-violet-100 dark:bg-violet-950 rounded-full justify-center items-center">
						<View className="w-16 h-16 bg-violet-600 rounded-2xl justify-center items-center shadow-lg">
							<Ionicons name="shield-checkmark" size={32} color="#FFF" />
						</View>
					</View>
				</View>

				<Text className="text-3xl font-bold text-[#161719] dark:text-zinc-100 text-center mb-4">Forgot Password?</Text>
				<Text className="text-[#91919F] dark:text-zinc-400 text-base text-center px-4 mb-8 leading-6">Don't worry! Enter your email address and we'll send you a code to reset your password.</Text>

				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, value } }) => (
						<View className="mb-5">
							<View className={`flex-row items-center bg-[#F6F6F6] dark:bg-zinc-900 p-6 rounded-2xl mb-4 ${errors.email ? "border border-red-500" : "focus:border focus:border-violet-600"}`}>
								<Ionicons name="mail-outline" size={20} color={iconColor} className="mr-3" />
								<TextInput
									placeholder="Email address"
									placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
									keyboardType="email-address"
									autoCapitalize="none"
									className="rounded-2xl flex-1 ml-2 bg-[#F6F6F6] dark:bg-zinc-900 text-base text-[#161719] dark:text-zinc-100"
									value={value}
									onChangeText={onChange}
								/>
							</View>
							{errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email.message}</Text>}
						</View>
					)}
				/>

				<TouchableOpacity className="bg-violet-600 p-4 rounded-2xl items-center mb-6" onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isForgotPasswordPending}>
					{isSubmitting || isForgotPasswordPending ? <ActivityIndicator size={20} color="#FFF" /> : <Text className="text-white text-base font-bold">Send Reset Code</Text>}
				</TouchableOpacity>

				<Text className="text-center text-base text-[#91919F] dark:text-zinc-400 mt-8">
					Remember your password?{" "}
					<Link href="/(auth)/login" className="text-[#7F3DFF] font-bold">
						Back to Login
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ForgotPassword;
