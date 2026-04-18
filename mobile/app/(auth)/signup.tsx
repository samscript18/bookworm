import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/useAuthStore";
import { Controller, FieldPath, useForm } from "react-hook-form";
import { SignUpType } from "@/types/auth/auth.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { signup } from "@/lib/services/auth.service";
import { User } from "@/types/user/user";
import { toast } from "@/lib/utils/toast";
import { uploadSingleImage } from "@/lib/services/upload.service";

const TOTAL_STEPS = 6;
const STEP_FIELDS: Record<number, FieldPath<SignUpType>[]> = {
	1: ["email"],
	2: ["password"],
	3: ["firstName", "lastName"],
	4: ["userName"],
	5: ["bio"],
	6: ["profileImage"],
};

const SignUp = () => {
	const router = useRouter();
	const { registrationData, setRegistrationData, registrationStep, setRegistrationStep, setAccessToken, setUser, setIsAuthenticated } = useAuthStore();
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const isDark = useColorScheme() === "dark";
	const iconColor = isDark ? "#B8BCC8" : "#91919F";
	const step = registrationStep;
	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		trigger,
		getValues,
		setValue,
		watch,
	} = useForm<SignUpType>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: registrationData.email || "",
			password: registrationData.password || "",
			firstName: registrationData.firstName || "",
			lastName: registrationData.lastName || "",
			userName: registrationData.userName || "",
			bio: registrationData.bio || "",
			profileImage: registrationData.profileImage,
		},
	});
	const passwordValue = watch("password") || "";
	const passwordRequirements = [
		{ label: "At least 8 characters", met: passwordValue.length >= 8 },
		{ label: "One uppercase letter", met: /[A-Z]/.test(passwordValue) },
		{ label: "One lowercase letter", met: /[a-z]/.test(passwordValue) },
		{ label: "One number", met: /[0-9]/.test(passwordValue) },
		{ label: "One special character", met: /[^a-zA-Z0-9]/.test(passwordValue) },
	];

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});

		if (!result.canceled) {
			const file = result.assets[0];
			setValue("profileImage", file);
			setRegistrationData({ profileImage: file });
		}
	};

	const handleNext = async () => {
		const currentStepFields = STEP_FIELDS[step] || [];
		const isStepValid = await trigger(currentStepFields);

		if (!isStepValid) return;

		setRegistrationData(getValues());

		if (step < TOTAL_STEPS) {
			setRegistrationStep(step + 1);
			return;
		}
		handleSubmit(submit)();
	};

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<View className="mb-8">
						<Text className="mb-4 text-base font-semibold text-[#161719] dark:text-zinc-100">Email Address</Text>
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
										onChangeText={(val) => {
											onChange(val);
											setRegistrationData({ email: val });
											void trigger("email");
										}}
									/>
									{errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email.message}</Text>}
								</View>
							)}
						/>
					</View>
				);
			case 2:
				return (
					<View className="mb-8">
						<Text className="mb-3 text-base font-semibold text-[#161719] dark:text-zinc-100">Password</Text>
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
											secureTextEntry={!showPassword}
											className="flex-1 text-base text-[#161719] dark:text-zinc-100"
											value={value}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ password: val });
												void trigger("password");
											}}
										/>
										<Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={iconColor} onPress={() => setShowPassword(!showPassword)} />
									</View>
									{errors.password && <Text className="mt-1 text-sm text-red-500">{errors.password.message}</Text>}
									<View className="mt-6 rounded-2xl bg-violet-100 p-4 gap-3 dark:bg-zinc-900">
										<Text className="mb-3 text-sm font-medium text-[#161719] dark:text-zinc-100">Password must contain:</Text>
										{passwordRequirements.map((item) => (
											<View key={item.label} className="mb-3 flex-row items-center last:mb-0">
												<Ionicons
													name={item.met ? "checkmark-circle" : "ellipse-outline"}
													size={20}
													color={item.met ? "#7C3AED" : isDark ? "#52525B" : "#C4C7D2"}
												/>
												<Text className={`ml-3 text-sm ${item.met ? "text-[#161719] dark:text-white" : "text-[#91919F] dark:text-white"}`}>
													{item.label}
												</Text>
											</View>
										))}
									</View>
								</View>
							)}
						/>
					</View>
				);
			case 3:
				return (
					<View className="mb-8">
						<Text className="mb-3 text-base font-semibold text-[#161719] dark:text-zinc-100">Name</Text>
						<View className="flex-row justify-between">
							<Controller
								control={control}
								name="firstName"
								render={({ field: { onChange, value } }) => (
									<View className="mr-2 flex-1">
										<TextInput
											placeholder="First Name"
											placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
											value={value}
											className={`rounded-2xl bg-[#F6F6F6] p-6 text-base text-[#161719] dark:bg-zinc-900 dark:text-zinc-100 ${errors.firstName ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ firstName: val });
												void trigger("firstName");
											}}
										/>
										{errors.firstName && <Text className="mt-1 text-sm text-red-500">{errors.firstName.message}</Text>}
									</View>
								)}
							/>
							<Controller
								control={control}
								name="lastName"
								render={({ field: { onChange, value } }) => (
									<View className="ml-2 flex-1">
										<TextInput
											placeholder="Last Name"
											placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
											value={value}
											className={`rounded-2xl bg-[#F6F6F6] p-6 text-base text-[#161719] dark:bg-zinc-900 dark:text-zinc-100 ${errors.lastName ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ lastName: val });
												void trigger("lastName");
											}}
										/>
										{errors.lastName && <Text className="mt-1 text-sm text-red-500">{errors.lastName.message}</Text>}
									</View>
								)}
							/>
						</View>
					</View>
				);
			case 4:
				return (
					<View className="mb-8">
						<Text className="mb-3 text-base font-semibold text-[#161719] dark:text-zinc-100">Username</Text>
						<Controller
							control={control}
							name="userName"
							render={({ field: { onChange, value } }) => (
								<View>
									<TextInput
										placeholder="Username"
										placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
										autoCapitalize="none"
										value={value}
										className={`w-full rounded-2xl bg-[#F6F6F6] p-6 text-base text-[#161719] dark:bg-zinc-900 dark:text-zinc-100 ${errors.userName ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
										onChangeText={(val) => {
											onChange(val);
											setRegistrationData({ userName: val });
											void trigger("userName");
										}}
									/>
									{errors.userName && <Text className="mt-1 text-sm text-red-500">{errors.userName.message}</Text>}
								</View>
							)}
						/>
					</View>
				);
			case 5:
				return (
					<View className="mb-8">
						<Text className="mb-3 text-base font-semibold text-[#161719] dark:text-zinc-100">Bio</Text>
						<Controller
							control={control}
							name="bio"
							render={({ field: { onChange, value } }) => (
								<View>
									<TextInput
										placeholder="Tell us about yourself"
										placeholderTextColor={isDark ? "#8A8F9C" : "#91919F"}
										multiline
										textAlignVertical="top"
										value={value || ""}
										className={`min-h-[120px] w-full rounded-2xl bg-[#F6F6F6] p-6 text-base text-[#161719] dark:bg-zinc-900 dark:text-zinc-100 ${errors.bio ? "border border-red-500" : "focus:border focus:border-violet-600"}`}
										onChangeText={(val) => {
											onChange(val);
											setRegistrationData({ bio: val });
											void trigger("bio");
										}}
									/>
									{errors.bio && <Text className="mt-1 text-sm text-red-500">{errors.bio.message}</Text>}
								</View>
							)}
						/>
					</View>
				);
			case 6:
				return (
					<View className="mb-8 items-center">
						<Text className="mb-3 self-start text-base font-semibold text-[#161719] dark:text-zinc-100">Profile Image</Text>
						<Controller
							control={control}
							name="profileImage"
							render={({ field: { value } }) => (
								<TouchableOpacity
									onPress={pickImage}
									className="h-64 w-64 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-violet-500 bg-[#F6F6F6] dark:bg-zinc-900"
								>
									{value ? <Image source={{ uri: value.uri }} className="h-full w-full" /> : <Ionicons name="camera" size={32} color={isDark ? "#9B6BFF" : "#7F3DFF"} />}
								</TouchableOpacity>
							)}
						/>
						{errors.profileImage && <Text className="mt-1 self-start text-sm text-red-500">{errors.profileImage.message as String}</Text>}
						<TouchableOpacity onPress={pickImage} className="mt-2">
							<Text className="font-semibold text-base text-violet-500">Upload Photo</Text>
						</TouchableOpacity>
					</View>
				);
			default:
				return null;
		}
	};

	const { mutateAsync: _signingUp, isPending: isSigningUp } = useMutation({
		mutationKey: ["auth", "signup"],
		mutationFn: signup,
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
			setRegistrationData({ email: "", password: "", firstName: "", lastName: "", userName: "", bio: "", profileImage: undefined });
			setRegistrationStep(1);
			setIsAuthenticated(true);
		},
	});

	const { mutateAsync: _uploadingImage, isPending: isUploadingImage } = useMutation({
		mutationKey: ["auth", "image-upload"],
		mutationFn: uploadSingleImage,
	});

	const submit = async (data: SignUpType) => {
		let url: string | undefined;
		try {
			if (data.profileImage) {
				const formData = new FormData();
				formData.append("image", {
					uri: data.profileImage.uri,
					type: data.profileImage.mimeType || "image/jpeg",
					name: data.profileImage.uri.split("/").pop() || "image.jpg",
				} as any);

				const imageData = await uploadSingleImage(formData);
				url = imageData.url;
			}

			const payload = { ...data, ...(url ? { profileImage: url } : {}), ...(data.bio ? { bio: data.bio } : {}) };

			await _signingUp(payload);

			toast.success("Signup successful");
			router.push("/(dashboard)/home");
		} catch (error) {
			console.error("Failed to sign up", error);
		}
	};

	return (
		<ScrollView className="flex-1 bg-white dark:bg-zinc-950 px-5 pt-12 pb-10" showsVerticalScrollIndicator={false}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
				<TouchableOpacity onPress={() => router.back()} className="my-6">
					<Ionicons name="chevron-back" size={28} color={isDark ? "#F4F5F7" : "#161719"} />
				</TouchableOpacity>

				<Text className="text-3xl font-bold text-[#161719] dark:text-zinc-100 mb-2">Create Account</Text>
				<Text className="text-[#91919F] dark:text-zinc-400 mb-8 text-base">Join the reading community today</Text>
				<Text className="mb-6 font-semibold text-violet-500 text-base">
					Step {step} of {TOTAL_STEPS}
				</Text>

				<View key={`step-${step}`}>{renderStepContent()}</View>

				<View className="mb-2 flex-row justify-between">
					<TouchableOpacity
						onPress={() => setRegistrationStep(Math.max(1, step - 1))}
						disabled={step === 1}
						className={`w-[48%] items-center rounded-2xl p-4 ${step === 1 ? "bg-[#EEE] dark:bg-zinc-800" : "border border-violet-500 bg-white dark:bg-zinc-900"}`}
					>
						<Text className={`text-base font-semibold ${step === 1 ? "text-[#91919F] dark:text-zinc-500" : "text-violet-500"}`}>Previous</Text>
					</TouchableOpacity>

					<TouchableOpacity className="w-[48%] items-center rounded-2xl bg-violet-600 p-4" onPress={handleNext} disabled={isSubmitting || isSigningUp || isUploadingImage}>
						{isSubmitting || isSigningUp || isUploadingImage ? (
							<ActivityIndicator size={20} className="text-white" />
						) : (
							<Text className="text-base font-semibold text-white">{step === TOTAL_STEPS ? "Sign Up" : "Next"}</Text>
						)}
					</TouchableOpacity>
				</View>

				<Text className="my-12 text-base text-center text-[#91919F] dark:text-zinc-400">
					Already have an account?{" "}
					<Link href="/(auth)/login" className="font-bold text-violet-500">
						Login
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</ScrollView>
	);
};

export default SignUp;
