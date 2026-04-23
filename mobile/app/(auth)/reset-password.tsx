import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { useAppTheme } from "@/providers/theme";

const ResetPassword = () => {
	const router = useRouter();
	const theme = useAppTheme();
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
		<SafeAreaView className="flex-1 px-6 pt-8 py-12" style={{ backgroundColor: theme.colors.background }}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
					<TouchableOpacity
						onPress={() => {
							setPasswordResetStep(2);
							router.back();
						}}
						className="mb-10"
					>
						<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
					</TouchableOpacity>

					<View className="items-center mb-8">
						<View className="w-32 h-32 rounded-full justify-center items-center" style={{ backgroundColor: theme.colors.accentSurface }}>
							<View className="w-16 h-16 rounded-2xl justify-center items-center" style={{ backgroundColor: theme.colors.primary }}>
								<Ionicons name="lock-closed" size={30} color={theme.colors.onPrimary} />
							</View>
						</View>
					</View>

					<Text className="text-3xl font-bold text-center mb-4" style={{ color: theme.colors.textPrimary }}>
						Create New Password
					</Text>
					<Text className="text-base text-center px-4 mb-8 leading-6" style={{ color: theme.colors.textSecondary }}>
						Your new password must be different from previously used passwords.
					</Text>

					<Text className="text-base font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
						New Password
					</Text>
					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl ${Platform.OS === "ios" ? "p-6" : "p-3"}`}
									style={{
										backgroundColor: theme.colors.surfaceMuted,
										borderWidth: 1,
										borderColor: errors.password ? theme.colors.error : theme.colors.inputBorder,
									}}
								>
									<TextInput
										placeholder="Password"
										placeholderTextColor={theme.colors.textMuted}
										secureTextEntry={!showPassword}
										className="flex-1 text-base"
										style={{ color: theme.colors.textPrimary }}
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} onPress={() => setShowPassword(!showPassword)} />
								</View>
								{errors.password && (
									<Text className="mt-1 text-sm" style={{ color: theme.colors.error }}>
										{errors.password.message}
									</Text>
								)}
							</View>
						)}
					/>

					<Text className="text-base font-semibold mt-4 mb-2" style={{ color: theme.colors.textPrimary }}>
						Confirm Password
					</Text>
					<Controller
						control={control}
						name="confirmPassword"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl ${Platform.OS === "ios" ? "p-6" : "p-3"}`}
									style={{
										backgroundColor: theme.colors.surfaceMuted,
										borderWidth: 1,
										borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.inputBorder,
									}}
								>
									<TextInput
										placeholder="Confirm Password"
										placeholderTextColor={theme.colors.textMuted}
										secureTextEntry={!showConfirm}
										className="flex-1 text-base"
										style={{ color: theme.colors.textPrimary }}
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} onPress={() => setShowConfirm(!showConfirm)} />
								</View>

								{value && value !== watch("password") ? (
									<Text className="mt-1 text-sm" style={{ color: theme.colors.error }}>
										Passwords do not match
									</Text>
								) : (
									errors.confirmPassword && (
										<Text className="mt-1 text-sm" style={{ color: theme.colors.error }}>
											{errors.confirmPassword.message}
										</Text>
									)
								)}

								<View className="my-6 rounded-2xl p-4 gap-3" style={{ backgroundColor: theme.colors.accentSurface }}>
									<Text className="mb-3 text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
										Password must contain:
									</Text>
									{passwordRequirements.map((item) => (
										<View key={item.label} className="mb-3 flex-row items-center last:mb-0">
											<Ionicons
												name={item.met ? "checkmark-circle" : "ellipse-outline"}
												size={20}
												color={item.met ? theme.colors.primary : theme.colors.textMuted}
											/>
											<Text className="ml-3 text-sm" style={{ color: item.met ? theme.colors.textPrimary : theme.colors.textSecondary }}>
												{item.label}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					/>

					<TouchableOpacity onPress={handleSubmit(onSubmit)} className="py-4 rounded-2xl items-center" style={{ backgroundColor: theme.colors.primary }} disabled={isSubmitting}>
						{isSubmitting ? (
							<ActivityIndicator size={20} color={theme.colors.onPrimary} />
						) : (
							<Text className="text-lg font-bold" style={{ color: theme.colors.onPrimary }}>
								Reset Password
							</Text>
						)}
					</TouchableOpacity>

					<Text className="text-center text-base mt-8" style={{ color: theme.colors.textSecondary }}>
						Remember your password?{" "}
						<Link href="/(auth)/login" className="font-bold" style={{ color: theme.colors.primary }}>
							Back to Login
						</Link>
					</Text>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ResetPassword;
