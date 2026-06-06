import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { useThemeStore } from "@/store/useThemeStore";
import { changePassword } from "@/lib/services/user.service";
import { ChangePasswordType } from "@/types/user/user";
import { changePasswordSchema } from "@/schemas/user.schema";

const ResetPassword = () => {
	const router = useRouter();
	const { theme } = useThemeStore();
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		watch,
	} = useForm<ChangePasswordType>({ resolver: zodResolver(changePasswordSchema) });

	const passwordValue = watch("newPassword") || "";
	const passwordRequirements = [
		{ label: "At least 8 characters", met: passwordValue.length >= 8 },
		{ label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
		{ label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
		{ label: "One number", met: /[0-9]/.test(passwordValue) },
		{ label: "One special character", met: /[^a-zA-Z0-9]/.test(passwordValue) },
	];

	const { mutateAsync: _changePassword } = useMutation({
		mutationKey: ["change-password"],
		mutationFn: changePassword,
		onSuccess: () => {
			toast.success("Password changed successfully");
			router.push("/settings");
		},
	});

	const onSubmit = async (data: ChangePasswordType) => {
		try {
			await _changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
		} catch (error) {
			console.error("Failed to change password", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 px-6 pt-8" style={{ backgroundColor: theme.colors.background }}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
					<TouchableOpacity
						onPress={() => {
							router.back();
						}}
						className="mb-4"
					>
						<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
					</TouchableOpacity>

					<View className="items-center mb-8">
						<View className="w-32 h-32 rounded-full justify-center items-center" style={{ backgroundColor: theme.mode === "dark" ? theme.colors.accentSurface : "#E0D4F7" }}>
							<View className="w-16 h-16 rounded-2xl justify-center items-center" style={{ backgroundColor: theme.colors.primary }}>
								<Ionicons name="lock-closed" size={30} color={theme.colors.onPrimary} />
							</View>
						</View>
					</View>

					<Text className="font-manrope text-3xl font-bold text-center mb-4" style={{ color: theme.colors.textPrimary }}>
						Create New Password
					</Text>
					<Text className="font-manrope text-base text-center px-4 mb-8 leading-6" style={{ color: theme.colors.textSecondary }}>
						Your new password must be different from previously used passwords.
					</Text>

					<Text className="font-manrope text-base font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
						Current Password
					</Text>
					<Controller
						control={control}
						name="currentPassword"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl ${Platform.OS === "ios" ? "p-6" : "p-3"}`}
									style={{
										backgroundColor: theme.colors.surfaceMuted,
										borderWidth: 1,
										borderColor: errors.currentPassword ? theme.colors.error : theme.colors.primary,
									}}
								>
									<TextInput
										placeholder="Current Password"
										placeholderTextColor={theme.colors.textMuted}
										secureTextEntry={!showPassword}
										className="flex-1 text-base"
										style={{ color: theme.colors.textPrimary }}
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} onPress={() => setShowPassword(!showPassword)} />
								</View>
								{errors.currentPassword && (
									<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
										{errors.currentPassword.message}
									</Text>
								)}
							</View>
						)}
					/>

					<Text className="font-manrope text-base font-semibold mt-4 mb-2" style={{ color: theme.colors.textPrimary }}>
						New Password
					</Text>
					<Controller
						control={control}
						name="newPassword"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl ${Platform.OS === "ios" ? "p-6" : "p-3"}`}
									style={{
										backgroundColor: theme.colors.surfaceMuted,
										borderWidth: 1,
										borderColor: errors.newPassword ? theme.colors.error : theme.colors.primary,
									}}
								>
									<TextInput
										placeholder="New Password"
										placeholderTextColor={theme.colors.textMuted}
										secureTextEntry={!showNewPassword}
										className="flex-1 text-base"
										style={{ color: theme.colors.textPrimary }}
										value={value}
										onChangeText={onChange}
									/>
									<Ionicons
										name={showNewPassword ? "eye-outline" : "eye-off-outline"}
										size={20}
										color={theme.colors.textSecondary}
										onPress={() => setShowNewPassword(!showNewPassword)}
									/>
								</View>

								{value && value !== watch("newPassword") ? (
									<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
										Passwords should not match
									</Text>
								) : (
									errors.newPassword && (
										<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
											{errors.newPassword.message}
										</Text>
									)
								)}

								<View className="my-6 rounded-2xl p-4 gap-3" style={{ backgroundColor: theme.mode === "dark" ? theme.colors.accentSurface : "#E0D4F7" }}>
									<Text className="font-manrope mb-3 text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
										Password must contain:
									</Text>
									{passwordRequirements.map((item) => (
										<View key={item.label} className="mb-3 flex-row items-center last:mb-0">
											<Ionicons
												name={item.met ? "checkmark-circle" : "ellipse-outline"}
												size={20}
												color={item.met ? theme.colors.primary : theme.colors.textMuted}
											/>
											<Text className="font-manrope ml-3 text-sm" style={{ color: item.met ? theme.colors.textPrimary : theme.colors.textSecondary }}>
												{item.label}
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					/>

					<TouchableOpacity onPress={handleSubmit(onSubmit)} className="py-4 rounded-2xl items-center mb-8" style={{ backgroundColor: theme.colors.primary }} disabled={isSubmitting}>
						{isSubmitting ? (
							<ActivityIndicator size={20} color={theme.colors.onPrimary} />
						) : (
							<Text className="font-manrope text-lg font-bold" style={{ color: theme.colors.onPrimary }}>
								Change Password
							</Text>
						)}
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ResetPassword;
