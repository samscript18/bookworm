import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Logo from "@/components/ui/logo";
import { useAuthStore } from "@/store/useAuthStore";
import { googleAuth } from "@/lib/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { User } from "@/types/user/user";
import { useThemeStore } from "@/store/useThemeStore";

const SignUpOption = () => {
	const router = useRouter();
	const { theme } = useThemeStore();
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
			router.push("/(tabs)/home");
		} catch (error) {
			console.log("Google sign-up failed", error);
			router.push("/(auth)/signup-option");
		}
	};

	return (
		<SafeAreaView className="flex-1 px-5 py-6" style={{ backgroundColor: theme.colors.background }}>
			<TouchableOpacity onPress={() => router.back()} className="mb-6 mt-2 w-10">
				<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
			</TouchableOpacity>

			<View className="items-center">
				<Logo />
				<Text className="font-manrope mt-3 text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
					Create your account
				</Text>
				<Text className="font-manrope mt-2 text-center text-base" style={{ color: theme.colors.textSecondary }}>
					Choose how you want to get started with BookWorm
				</Text>
			</View>

			<View className="mt-10 gap-4">
				<TouchableOpacity onPress={handleEmailSignUp} className="rounded-3xl p-5" style={{ borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: theme.colors.accentSurface }}>
					<View className="flex-row items-center">
						<View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.colors.primary }}>
							<Ionicons name="mail-outline" size={22} color={theme.colors.onPrimary} />
						</View>
						<View className="ml-4 flex-1">
							<Text className="font-manrope text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
								Sign up with Email
							</Text>
							<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.textSecondary }}>
								Use your email and complete the guided signup steps
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={handleGoogleSignUp} className="rounded-3xl p-5" style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }} disabled={isSigningUp}>
					<View className="flex-row items-center">
						{isSigningUp ? (
							<ActivityIndicator size={20} color={theme.colors.textSecondary} />
						) : (
							<View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.colors.surfaceMuted }}>
								<Ionicons name="logo-google" size={22} color={theme.colors.googleBrand} />
							</View>
						)}
						<View className="ml-4 flex-1">
							<Text className="font-manrope text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
								Sign up with Google
							</Text>
							<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.textSecondary }}>
								Create your account faster with your Google profile
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
					</View>
				</TouchableOpacity>
			</View>

			<Text className="font-manrope mt-auto mb-8 text-center text-base" style={{ color: theme.colors.textSecondary }}>
				Already have an account?{" "}
				<Text className="font-manrope font-bold" style={{ color: theme.colors.primary }} onPress={() => router.push("/(auth)/login")}>
					Login
				</Text>
			</Text>
		</SafeAreaView>
	);
};

export default SignUpOption;
