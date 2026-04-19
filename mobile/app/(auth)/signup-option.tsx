import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, useColorScheme, Alert, ActivityIndicator } from "react-native";
import Logo from "@/components/ui/logo";
import { useAuthStore } from "@/store/useAuthStore";
import { googleAuth } from "@/lib/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { User } from "@/types/user/user";

const SignUpOption = () => {
	const router = useRouter();
	const isDark = useColorScheme() === "dark";
	const { setRegistrationStep, setAccessToken, setIsAuthenticated, setUser } = useAuthStore();

	const handleEmailSignUp = () => {
		setRegistrationStep(1);
		router.push("/(auth)/signup");
	};

	const { mutateAsync: signUp, isPending: isSigningUp } = useMutation({
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

	const handleGoogleSignUp = async () => {
		try {
			await signUp();
			toast.success("Signed up with Google successfully");
			router.push("/(dashboard)/home");
		} catch (error) {
			console.log("Google sign-up failed", error);
			router.push("/(auth)/signup-option");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-950 px-5 py-6">
			<TouchableOpacity onPress={() => router.back()} className="mb-6 mt-2 w-10">
				<Ionicons name="chevron-back" size={28} color={isDark ? "#F4F5F7" : "#161719"} />
			</TouchableOpacity>

			<View className="items-center">
				<Logo />
				<Text className="mt-3 text-2xl font-bold text-[#161719] dark:text-zinc-100">Create your account</Text>
				<Text className="mt-2 text-center text-base text-[#6B7280] dark:text-zinc-400">Choose how you want to get started with BookWorm</Text>
			</View>

			<View className="mt-10 gap-4">
				<TouchableOpacity onPress={handleEmailSignUp} className="rounded-3xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-800 dark:bg-zinc-900">
					<View className="flex-row items-center">
						<View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
							<Ionicons name="mail-outline" size={22} color="#FFFFFF" />
						</View>
						<View className="ml-4 flex-1">
							<Text className="text-lg font-semibold text-[#161719] dark:text-zinc-100">Sign up with Email</Text>
							<Text className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">Use your email and complete the guided signup steps</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color={isDark ? "#A1A1AA" : "#6B7280"} />
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={handleGoogleSignUp} className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900" disabled={isSigningUp}>
					<View className="flex-row items-center">
						{isSigningUp ? (
							<ActivityIndicator size={20} />
						) : (
							<View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F5] dark:bg-zinc-800">
								<Ionicons name="logo-google" size={22} color="#EA4335" />
							</View>
						)}
						<View className="ml-4 flex-1">
							<Text className="text-lg font-semibold text-[#161719] dark:text-zinc-100">Sign up with Google</Text>
							<Text className="mt-1 text-sm text-[#6B7280] dark:text-zinc-400">Create your account faster with your Google profile</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color={isDark ? "#A1A1AA" : "#6B7280"} />
					</View>
				</TouchableOpacity>
			</View>

			<Text className="mt-auto mb-8 text-center text-base text-[#6B7280] dark:text-zinc-400">
				Already have an account?{" "}
				<Text className="font-bold text-violet-500" onPress={() => router.push("/(auth)/login")}>
					Login
				</Text>
			</Text>
		</SafeAreaView>
	);
};

export default SignUpOption;
