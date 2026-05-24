import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Logo from "@/components/ui/logo";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginType } from "@/types/auth/auth.form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { googleAuth, login } from "@/lib/services/auth.service";
import { toast } from "@/lib/utils/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/user/user";
import { useThemeStore } from "@/store/useThemeStore";
import { isGoogleSignInAvailable } from "@/lib/config/google";

const Login = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState<boolean>(true);
	const [isFocused, setIsFocused] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
	const { theme } = useThemeStore();

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
	} = useForm<LoginType>({ resolver: zodResolver(loginSchema) });

	const { setAccessToken, setUser, setIsAuthenticated } = useAuthStore();

	const { mutateAsync: _logIn, isPending: isloggingIn } = useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: login,
		onSuccess(data) {
			setAccessToken(data.token as string);
			setUser({
				_id: data.user._id,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				userName: data.user.userName,
				email: data.user.email,
				bio: data.user.bio,
				profileImage: data.user.profileImage,
				createdAt: data.user.createdAt,
				updatedAt: data.user.updatedAt,
			} as User);
			setIsAuthenticated(true);
		},
	});

	const { mutateAsync: signIn, isPending: isSigningIn } = useMutation({
		mutationKey: ["auth", "google"],
		mutationFn: googleAuth,
		onSuccess(data) {
			setAccessToken(data.token as string);
			setUser({
				_id: data.user._id,
				firstName: data.user.firstName,
				lastName: data.user.lastName,
				userName: data.user.userName,
				email: data.user.email,
				bio: data.user.bio,
				profileImage: data.user.profileImage,
				createdAt: data.user.createdAt,
				updatedAt: data.user.updatedAt,
			} as User);
			setIsAuthenticated(true);
		},
	});

	const onSubmit = async (data: LoginType) => {
		try {
			await _logIn(data);
			toast.success("Signed in successfully");
			router.push("/(tabs)/home");
		} catch (error) {
			console.error("Failed to login", error);
		}
	};

	const handleGoogleLogIn = async () => {
		try {
			await signIn();
			toast.success("Signed in with Google successfully");
			router.push("/(tabs)/home");
		} catch (error) {
			console.log("Google sign-in failed", error);
			router.push("/(auth)/login");
		}
	};

	return (
		<SafeAreaView className="flex-1 px-5 py-6" style={{ backgroundColor: theme.colors.background }}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<View className="items-center">
					<Logo />
					<Text className="font-manrope my-[13px] text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
						BookWorm
					</Text>
					<Text className="font-manrope text-[28px] font-bold mt-8" style={{ color: theme.colors.textPrimary }}>
						Welcome Back!
					</Text>
					<Text className="font-manrope mt-[5px] text-base" style={{ color: theme.colors.textSecondary }}>
						Sign in to continue your reading journey
					</Text>
				</View>

				<View className="mt-10">
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<View className="mb-[15px]">
								<TextInput
									placeholder="Email address"
									placeholderTextColor={theme.colors.textMuted}
									keyboardType="email-address"
									autoCapitalize="none"
									className={`rounded-2xl p-6 text-base`}
									style={{
										backgroundColor: theme.colors.surfaceMuted,
										color: theme.colors.textPrimary,
										borderWidth: 1,
										borderColor: errors.email ? theme.colors.error : isFocused.email ? theme.colors.primary : theme.colors.inputBorder,
									}}
									value={value}
									onChangeText={onChange}
									onFocus={() => setIsFocused({ ...isFocused, email: true })}
									onBlur={() => setIsFocused({ ...isFocused, email: false })}
								/>
								{errors.email && (
									<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
										{errors.email.message}
									</Text>
								)}
							</View>
						)}
					/>

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
										borderColor: errors.password ? theme.colors.error : isFocused.password ? theme.colors.primary : theme.colors.inputBorder,
									}}
								>
									<TextInput
										placeholder="Password"
										placeholderTextColor={theme.colors.textMuted}
										secureTextEntry={showPassword}
										className="flex-1 text-base"
										style={{ color: theme.colors.textPrimary }}
										value={value}
										onChangeText={onChange}
										onFocus={() => setIsFocused({ ...isFocused, password: true })}
										onBlur={() => setIsFocused({ ...isFocused, password: false })}
									/>
									<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.colors.textSecondary} onPress={() => setShowPassword(!showPassword)} />
								</View>
								{errors.password && (
									<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
										{errors.password.message}
									</Text>
								)}
							</View>
						)}
					/>

					<View className="flex-row justify-end items-end">
						<Text onPress={() => router.push("/(auth)/forgot-password")} className="my-4 text-base font-semibold" style={{ color: theme.colors.primary }}>
							Forgot Password?
						</Text>
					</View>

					<TouchableOpacity className="mt-[10px] items-center rounded-2xl p-4" style={{ backgroundColor: theme.colors.primary }} onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isloggingIn}>
						{isSubmitting || isloggingIn ? (
							<ActivityIndicator size={20} color={theme.colors.onPrimary} />
						) : (
							<Text className="font-manrope text-lg font-semibold" style={{ color: theme.colors.onPrimary }}>
								Login
							</Text>
						)}
					</TouchableOpacity>

					{isGoogleSignInAvailable && (
						<>
							<View className="flex-row items-center gap-4 my-6">
								<View className="flex-1 h-[1px]" style={{ backgroundColor: theme.colors.divider }} />
								<Text className="font-manrope text-center text-base" style={{ color: theme.colors.textSecondary }}>
									Or continue with
								</Text>
								<View className="flex-1 h-[1px]" style={{ backgroundColor: theme.colors.divider }} />
							</View>

							<TouchableOpacity
								onPress={handleGoogleLogIn}
								className="flex-row items-center justify-center rounded-2xl p-4"
								style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
								disabled={isSigningIn}
							>
								{isSigningIn ? <ActivityIndicator size={20} color={theme.colors.textSecondary} /> : <Ionicons name="logo-google" size={24} color={theme.colors.googleBrand} />}
								<Text className="font-manrope ml-[10px] text-base" style={{ color: theme.colors.textPrimary }}>
									Google
								</Text>
							</TouchableOpacity>
						</>
					)}

					<Text className="font-manrope mt-20 text-center text-base" style={{ color: theme.colors.textSecondary }}>
						Don't have an account?{" "}
						<Link href="/(auth)/signup-option" className="font-bold" style={{ color: theme.colors.primary }}>
							Sign Up
						</Link>
					</Text>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default Login;
