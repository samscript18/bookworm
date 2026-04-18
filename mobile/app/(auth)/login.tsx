import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
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
import { login } from "@/lib/services/auth.service";
import { toast } from "@/lib/utils/toast";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types/user/user";

const Login = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState<boolean>(true);
	const isDark = useColorScheme() === "dark";
	const iconColor = isDark ? "#B8BCC8" : "#91919F";

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

	const onSubmit = async (data: LoginType) => {
		try {
			await _logIn(data);
			toast.success("Signed in successfully");
			router.push("/(dashboard)/home");
		} catch (error) {
			console.error("Failed to login", error);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 px-5 py-6">
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<View className="items-center">
					<Logo />
					<Text className="my-[13px] text-2xl font-bold text-[#161719] dark:text-zinc-100">BookWorm</Text>
					<Text className="text-[28px] font-bold mt-8 text-[#161719] dark:text-zinc-100">Welcome Back!</Text>
					<Text className="mt-[5px] text-base text-[#91919F] dark:text-zinc-400">Sign in to continue your reading journey</Text>
				</View>

				<View className="mt-10">
					<Controller
						control={control}
						name="email"
						render={({ field: { onChange, value } }) => (
							<View className="mb-[15px]">
								<TextInput
									placeholder="Email address"
									placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
									keyboardType="email-address"
									autoCapitalize="none"
									className={`rounded-2xl bg-[#F6F6F6] p-6 text-base text-[#161719] dark:bg-zinc-900 dark:text-zinc-100 ${errors.email ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
									value={value}
									onChangeText={onChange}
								/>
								{errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email.message}</Text>}
							</View>
						)}
					/>

					<Controller
						control={control}
						name="password"
						render={({ field: { onChange, value } }) => (
							<View>
								<View
									className={`flex-row items-center rounded-2xl bg-[#F6F6F6] ${Platform.OS === "ios" ? "p-6" : "p-3"} dark:bg-zinc-900 ${errors.password ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
								>
									<TextInput
										placeholder="Password"
										placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
										secureTextEntry={showPassword}
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

					<Link href="/(auth)/forgot-password" className="my-4 text-right text-base font-semibold text-violet-500">
						Forgot Password?
					</Link>

					<TouchableOpacity className="mt-[10px] items-center rounded-2xl bg-violet-600 p-4" onPress={handleSubmit(onSubmit)} disabled={isSubmitting || isloggingIn}>
						{isSubmitting || isloggingIn ? <ActivityIndicator size={20} className="text-white" /> : <Text className="text-lg font-semibold text-white">Login</Text>}
					</TouchableOpacity>

					<View className="flex-row items-center gap-4 my-6">
						<View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-700" />
						<Text className="text-center text-base text-[#6B7280] dark:text-zinc-400">Or continue with</Text>
						<View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-700" />
					</View>

					<TouchableOpacity className="flex-row items-center justify-center rounded-2xl border border-gray-300 p-4 dark:border-zinc-700 dark:bg-zinc-900">
						<Ionicons name="logo-google" size={24} color="red" />
						<Text className="ml-[10px] text-base text-[#161719] dark:text-zinc-100">Google</Text>
					</TouchableOpacity>

					<Text className="mt-20 text-center text-base text-[#6B7280] dark:text-zinc-400">
						Don't have an account?{" "}
						<Link href="/(auth)/signup" className="font-bold text-violet-500">
							Sign Up
						</Link>
					</Text>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default Login;
