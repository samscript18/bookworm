import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Keyboard } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/useAuthStore";
import { Controller, FieldPath, useForm } from "react-hook-form";
import { SignUpType } from "@/types/auth/auth.form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailExistenceSchema, signupSchema, usernameExistenceSchema } from "@/schemas/auth.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkEmail, checkUsername, signup } from "@/lib/services/auth.service";
import { User } from "@/types/user/user";
import { toast } from "@/lib/utils/toast";
import { uploadSingleImage } from "@/lib/services/upload.service";
import { useThemeStore } from "@/store/useThemeStore";

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
	const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});
	const { theme } = useThemeStore();
	const step = registrationStep;
	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		control,
		trigger,
		getValues,
		setValue,
		watch,
		setError,
		clearErrors,
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

	const emailValue = watch("email");
	const isEmailValid = !!emailValue && emailExistenceSchema.safeParse({ email: emailValue }).success;

	const { isFetching: isCheckingEmail, data: emailData } = useQuery({
		queryKey: ["check-email", emailValue],
		queryFn: () => checkEmail({ email: emailValue }),
		enabled: !!isEmailValid && !!emailValue,
		retry: false,
	});

	const usernameValue = watch("userName");
	const isUsernameValid = !!usernameValue && usernameExistenceSchema.safeParse({ username: usernameValue }).success;

	const { isFetching: isCheckingUsername, data: usernameData } = useQuery({
		queryKey: ["check-username", usernameValue],
		queryFn: () => checkUsername({ username: usernameValue }),
		enabled: !!isUsernameValid && !!usernameValue,
		retry: false,
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
		const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!granted) {
			Alert.alert("Permission Denied", "Media library permission is needed to upload profile image.");
			return;
		}

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
			Keyboard.dismiss();
			setRegistrationStep(step + 1);
			return;
		}
		handleSubmit(submit)();
	};

	const getInputStyle = (hasError?: boolean) => ({
		backgroundColor: theme.colors.surfaceMuted,
		color: theme.colors.textPrimary,
		borderWidth: 1,
		borderColor: hasError ? theme.colors.error : isFocused[STEP_FIELDS[step][0]] ? theme.colors.primary : theme.colors.inputBorder,
	});

	const getErrorText = (message?: string) => {
		if (!message) return null;
		return (
			<Text className="font-manrope mt-1 text-sm" style={{ color: theme.colors.error }}>
				{message}
			</Text>
		);
	};

	useEffect(() => {
		if (emailData?.exists) {
			setError("email", { type: "manual", message: "Email already taken" });
		} else {
			clearErrors("email");
		}

		if (usernameData?.exists) {
			setError("userName", { type: "manual", message: "Username already taken" });
		} else {
			clearErrors("userName");
		}
	}, [emailData, usernameData, setError, clearErrors]);

	const renderStepContent = () => {
		switch (step) {
			case 1:
				return (
					<View className="mb-8">
						<Text className="font-manrope mb-4 text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Email Address
						</Text>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, value } }) => (
								<View className="mb-[15px] relative">
									<View className="relative justify-center">
										<TextInput
											placeholder="Email address"
											placeholderTextColor={theme.colors.textMuted}
											keyboardType="email-address"
											autoCapitalize="none"
											className="rounded-2xl p-6 pr-14 text-base"
											style={getInputStyle(!!errors.email)}
											value={value}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ email: val });
											}}
											onFocus={() => setIsFocused({ ...isFocused, email: true })}
											onBlur={() => setIsFocused({ ...isFocused, email: false })}
										/>

										<View className="absolute right-5">
											{isCheckingEmail ? (
												<ActivityIndicator size="small" color="#7F3DFF" />
											) : isEmailValid && emailData && !emailData.exists ? (
												<Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
											) : isEmailValid && emailData && emailData.exists ? (
												<Ionicons name="close-circle" size={24} color={theme.colors.error} />
											) : null}
										</View>
									</View>

									{getErrorText(errors.email?.message)}
								</View>
							)}
						/>
					</View>
				);
			case 2:
				return (
					<View className="mb-8">
						<Text className="font-manrope mb-3 text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Password
						</Text>
						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, value } }) => (
								<View>
									<View className={`flex-row items-center rounded-2xl ${Platform.OS === "ios" ? "p-6" : "p-3"}`} style={getInputStyle(!!errors.password)}>
										<TextInput
											placeholder="Password"
											placeholderTextColor={theme.colors.textMuted}
											secureTextEntry={!showPassword}
											className="flex-1 text-base"
											style={{ color: theme.colors.textPrimary }}
											value={value}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ password: val });
												void trigger("password");
											}}
										/>
										<Ionicons
											name={showPassword ? "eye-outline" : "eye-off-outline"}
											size={20}
											color={theme.colors.textSecondary}
											onPress={() => setShowPassword(!showPassword)}
										/>
									</View>
									{getErrorText(errors.password?.message)}
									<View className="mt-6 rounded-2xl p-4 gap-3" style={{ backgroundColor: theme.colors.accentSurface }}>
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
					</View>
				);
			case 3:
				return (
					<View className="mb-8">
						<Text className="font-manrope mb-3 text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Name
						</Text>
						<View className="flex-row justify-between">
							<Controller
								control={control}
								name="firstName"
								render={({ field: { onChange, value } }) => (
									<View className="mr-2 flex-1">
										<TextInput
											placeholder="First Name"
											placeholderTextColor={theme.colors.textMuted}
											value={value}
											className="rounded-2xl p-6 text-base"
											style={getInputStyle(!!errors.firstName)}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ firstName: val });
												void trigger("firstName");
											}}
										/>
										{getErrorText(errors.firstName?.message)}
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
											placeholderTextColor={theme.colors.textMuted}
											value={value}
											className="rounded-2xl p-6 text-base"
											style={getInputStyle(!!errors.lastName)}
											onChangeText={(val) => {
												onChange(val);
												setRegistrationData({ lastName: val });
												void trigger("lastName");
											}}
										/>
										{getErrorText(errors.lastName?.message)}
									</View>
								)}
							/>
						</View>
					</View>
				);
			case 4:
				return (
					<View className="mb-8">
						<Text className="font-manrope mb-3 text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Username
						</Text>
						<Controller
							control={control}
							name="userName"
							render={({ field: { onChange, value } }) => (
								<View>
									<TextInput
										placeholder="Username"
										placeholderTextColor={theme.colors.textMuted}
										autoCapitalize="none"
										value={value}
										className="w-full rounded-2xl p-6 text-base"
										style={getInputStyle(!!errors.userName)}
										onChangeText={(val) => {
											onChange(val);
											setRegistrationData({ userName: val });
										}}
									/>

									<View className="absolute top-5 right-5">
										{isCheckingUsername ? (
											<ActivityIndicator size="small" color="#7F3DFF" />
										) : isUsernameValid && usernameData && !usernameData.exists ? (
											<Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
										) : isUsernameValid && usernameData && usernameData.exists ? (
											<Ionicons name="close-circle" size={24} color={theme.colors.error} />
										) : null}
									</View>

									{getErrorText(errors.userName?.message)}
								</View>
							)}
						/>
					</View>
				);
			case 5:
				return (
					<View className="mb-8">
						<Text className="font-manrope mb-3 text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Bio
						</Text>
						<Controller
							control={control}
							name="bio"
							render={({ field: { onChange, value } }) => (
								<View>
									<TextInput
										placeholder="Tell us about yourself"
										placeholderTextColor={theme.colors.textMuted}
										multiline
										textAlignVertical="top"
										value={value || ""}
										className="min-h-[120px] w-full rounded-2xl p-6 text-base"
										style={getInputStyle(!!errors.bio)}
										onChangeText={(val) => {
											onChange(val);
											setRegistrationData({ bio: val });
											void trigger("bio");
										}}
									/>
									{getErrorText(errors.bio?.message)}
								</View>
							)}
						/>
					</View>
				);
			case 6:
				return (
					<View className="mb-8 items-center">
						<Text className="font-manrope mb-3 self-start text-base font-semibold" style={{ color: theme.colors.textPrimary }}>
							Profile Image
						</Text>
						<Controller
							control={control}
							name="profileImage"
							render={({ field: { value } }) => (
								<TouchableOpacity
									onPress={pickImage}
									className="h-64 w-64 items-center justify-center overflow-hidden rounded-full border-2 border-dashed"
									style={{ borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceMuted }}
								>
									{value ? <Image source={{ uri: value.uri }} className="h-full w-full" /> : <Ionicons name="camera" size={32} color={theme.colors.primary} />}
								</TouchableOpacity>
							)}
						/>
						{errors.profileImage && (
							<Text className="font-manrope mt-1 self-start text-sm" style={{ color: theme.colors.error }}>
								{errors.profileImage.message as string}
							</Text>
						)}
						<TouchableOpacity onPress={pickImage} className="mt-2">
							<Text className="font-manrope font-semibold text-base" style={{ color: theme.colors.primary }}>
								Upload Photo
							</Text>
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

				const imageData = await _uploadingImage(formData);
				url = imageData.url;
			}

			const payload = { ...data, ...(url ? { profileImage: url } : {}), ...(data.bio ? { bio: data.bio } : {}) };

			await _signingUp(payload);

			toast.success("Signup successful");
			router.push("/(tabs)/home");
		} catch (error) {
			console.error("Failed to sign up", error);
		}
	};

	return (
		<ScrollView className="flex-1 px-5 pt-12 pb-10" style={{ backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<TouchableOpacity
					onPress={() => {
						if (step === 1) {
							router.back();
						} else {
							setRegistrationStep(Math.max(1, step - 1));
						}
					}}
					className="my-6"
				>
					<Ionicons name="chevron-back" size={28} color={theme.colors.textPrimary} />
				</TouchableOpacity>

				<Text className="font-manrope text-3xl font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
					Create Account
				</Text>
				<Text className="font-manrope mb-8 text-base" style={{ color: theme.colors.textSecondary }}>
					Join the reading community today
				</Text>
				<Text className="font-manrope mb-6 font-semibold text-base" style={{ color: theme.colors.primary }}>
					Step {step} of {TOTAL_STEPS}
				</Text>

				<View key={`step-${step}`}>{renderStepContent()}</View>

				<View className="mb-2 flex-row justify-between">
					<TouchableOpacity
						onPress={() => setRegistrationStep(Math.max(1, step - 1))}
						disabled={step === 1}
						className="w-[48%] items-center rounded-2xl p-4"
						style={{
							backgroundColor: step === 1 ? theme.colors.buttonDisabled : theme.colors.surface,
							borderWidth: step === 1 ? 0 : 1,
							borderColor: step === 1 ? "transparent" : theme.colors.primary,
						}}
					>
						<Text className="font-manrope text-base font-semibold" style={{ color: step === 1 ? theme.colors.textSecondary : theme.colors.primary }}>
							Previous
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="w-[48%] items-center rounded-2xl p-4"
						style={{ backgroundColor: theme.colors.primary }}
						onPress={handleNext}
						disabled={isSubmitting || isSigningUp || isUploadingImage || STEP_FIELDS[step].some((field) => !!errors[field as keyof typeof errors])}
					>
						{isSubmitting || isSigningUp || isUploadingImage ? (
							<ActivityIndicator size={20} color={theme.colors.onPrimary} />
						) : (
							<Text className="font-manrope text-base font-semibold" style={{ color: theme.colors.onPrimary }}>
								{step === TOTAL_STEPS ? "Sign Up" : "Next"}
							</Text>
						)}
					</TouchableOpacity>
				</View>

				<Text className="font-manrope my-12 text-base text-center" style={{ color: theme.colors.textSecondary }}>
					Already have an account?{" "}
					<Link href="/(auth)/login" className="font-bold" style={{ color: theme.colors.primary }}>
						Login
					</Link>
				</Text>
			</KeyboardAvoidingView>
		</ScrollView>
	);
};

export default SignUp;
