import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { ResetPasswordType } from "@/types/auth/auth.form";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { resetPassword } from "@/lib/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

const ResetPassword = () => {
	const router = useRouter();
	const isDark = useColorScheme() === "dark";
	const iconColor = isDark ? "#B8BCC8" : "#91919F";
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirm, setShowConfirm] = useState<boolean>(false);
	const { forgotPasswordToken, setPasswordResetStep } = useAuthStore();

	useEffect(() => {
		setPasswordResetStep(3);
	}, [setPasswordResetStep]);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		watch,
	} = useForm<ResetPasswordType>({ resolver: zodResolver(resetPasswordSchema) });

	const passwordValue = watch("password") || "";
	const passwordRequirements = [
		{ label: "At least 8 characters", met: passwordValue.length >= 8 },
		{ label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
		{ label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
		{ label: "One number", met: /[0-9]/.test(passwordValue) },
		{ label: "One special character", met: /[^a-zA-Z0-9]/.test(passwordValue) },
	];

	const { mutateAsync: _resetPassword, isPending: isResetPasswordPending } = useMutation({
		mutationKey: ["auth", "reset-password"],
		mutationFn: resetPassword,
	});

	const onSubmit = async (data: ResetPasswordType) => {
		try {
			await _resetPassword({ password: data.password, token: forgotPasswordToken });
			toast.success("Password reset successfully");
			setPasswordResetStep(0);
			router.push("/(auth)/login");
		} catch (error) {
			console.error("Failed to reset password", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 px-6 pt-8 py-12">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
					<TouchableOpacity
						onPress={() => {
							setPasswordResetStep(2);
							router.back();
						}}
						className="mb-10"
					>
						<Ionicons name="chevron-back" size={28} color={isDark ? "#F4F5F7" : "#161719"} />
					</TouchableOpacity>

					<View className="items-center mb-8">
						<View className="w-32 h-32 bg-violet-100 dark:bg-violet-950 rounded-full justify-center items-center">
							<View className="w-16 h-16 bg-violet-600 rounded-2xl justify-center items-center shadow-lg">
								<Ionicons name="lock-closed" size={30} color="#FFF" />
							</View>
						</View>
					</View>

					<Text className="text-3xl font-bold text-[#161719] dark:text-zinc-100 text-center mb-4">Create New Password</Text>
					<Text className="text-[#91919F] dark:text-zinc-400 text-base text-center px-4 mb-8 leading-6">Your new password must be different from previously used passwords.</Text>

					<Text className="text-[#161719] dark:text-zinc-100 text-base font-semibold mb-2">New Password</Text>
					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl bg-[#F6F6F6] dark:bg-zinc-900 ${Platform.OS === "ios" ? "p-6" : "p-3"} ${errors.password ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
								>
									<TextInput
										placeholder="Password"
										placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
										secureTextEntry={!showPassword}
										className="flex-1 text-base text-[#161719] dark:text-zinc-100"
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={iconColor} onPress={() => setShowPassword(!showPassword)} />
								</View>
								{errors.password && <Text className="mt-1 text-sm text-red-500">{errors.password.message}</Text>}
							</View>
						)}
					/>

					<Text className="text-[#161719] dark:text-zinc-100 text-base font-semibold mt-4 mb-2">Confirm Password</Text>
					<Controller
						control={control}
						name="confirmPassword"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl bg-[#F6F6F6] dark:bg-zinc-900 ${Platform.OS === "ios" ? "p-6" : "p-3"} ${errors.confirmPassword ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
								>
									<TextInput
										placeholder="Confirm Password"
										placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
										secureTextEntry={!showConfirm}
										className="flex-1 text-base text-[#161719] dark:text-zinc-100"
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color={iconColor} onPress={() => setShowConfirm(!showConfirm)} />
								</View>

								{value && value !== watch("password") ? (
									<Text className="mt-1 text-sm text-red-500">Passwords do not match</Text>
								) : (
									errors.confirmPassword && <Text className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</Text>
								)}

								<View className="my-6 rounded-2xl bg-violet-100 dark:bg-zinc-900 p-4 gap-3">
									<Text className="mb-3 text-sm font-medium text-[#161719] dark:text-zinc-100">Password must contain:</Text>
									{passwordRequirements.map((item) => (
										<View key={item.label} className="mb-3 flex-row items-center last:mb-0">
											<Ionicons
												name={item.met ? "checkmark-circle" : "ellipse-outline"}
												size={20}
												color={item.met ? "#7C3AED" : isDark ? "#52525B" : "#C4C7D2"}
											/>
											<Text className={`ml-3 text-sm ${item.met ? "text-[#161719] dark:text-zinc-100" : "text-[#91919F] dark:text-zinc-400"}`}>{item.label}</Text>
										</View>
									))}
								</View>
							</View>
						)}
					/>

					<TouchableOpacity onPress={handleSubmit(onSubmit)} className="py-4 rounded-2xl items-center bg-violet-600" disabled={isSubmitting}>
						{isSubmitting ? <ActivityIndicator size={20} color="#FFF" /> : <Text className="text-white text-lg font-bold">Reset Password</Text>}
					</TouchableOpacity>

					<Text className="text-center text-base text-[#91919F] dark:text-zinc-400 mt-8">
						Remember your password?{" "}
						<Link href="/(auth)/login" className="text-violet-500 font-bold">
							Back to Login
						</Link>
					</Text>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ResetPassword;
