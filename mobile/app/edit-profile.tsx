import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useThemeStore } from "@/store/useThemeStore";
import { editProfile, getProfile } from "@/lib/services/user.service";
import { EditProfileType } from "@/types/user/user";
import InputField from "@/components/input";
import * as ImagePicker from "expo-image-picker";
import { toast } from "@/lib/utils/toast";
import { uploadSingleImage } from "@/lib/services/upload.service";
import { usernameExistenceSchema } from "@/schemas/auth.schema";
import { checkUsername } from "@/lib/services/auth.service";

type FocusState = Record<keyof EditProfileType, boolean>;

export default function EditProfile() {
	const router = useRouter();
	const { theme, isDark } = useThemeStore();

	const [form, setForm] = useState<EditProfileType>({
		firstName: "",
		lastName: "",
		userName: "",
		email: "",
		profileImage: "",
		bio: "",
	});

	const [focus, setFocus] = useState<FocusState>({
		firstName: false,
		lastName: false,
		userName: false,
		email: false,
		profileImage: false,
		bio: false,
	});

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
			setForm({ ...form, profileImage: file });
		}
	};

	const { data: profile } = useQuery({
		queryKey: ["profile"],
		queryFn: () => getProfile(),
	});

	useEffect(() => {
		if (!profile) return;
		setForm({
			firstName: profile.firstName ?? "",
			lastName: profile.lastName ?? "",
			userName: profile.userName ?? "",
			email: profile.email ?? "",
			profileImage: profile.profileImage ?? "",
			bio: profile.bio ?? "",
		});
	}, [profile]);

	const initials = useMemo(() => {
		const first = form.firstName.trim().charAt(0).toUpperCase();
		const last = form.lastName.trim().charAt(0).toUpperCase();
		return `${first}${last}`.trim() || "BW";
	}, [form.firstName, form.lastName]);

	const updateField = (key: keyof EditProfileType, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const { mutateAsync: _uploadingImage, isPending: isUploadingImage } = useMutation({
		mutationKey: ["auth", "image-upload"],
		mutationFn: uploadSingleImage,
	});

	const { mutateAsync: _editProfile, isPending: isEditingProfile } = useMutation({
		mutationKey: ["editProfile"],
		mutationFn: editProfile,
		onSuccess() {
			toast.success("Profile updated successfully");
			router.push("/(tabs)/profile");
		},
	});

	const usernameValue = form.userName.trim();
	const isUsernameValid = !!usernameValue && usernameExistenceSchema.safeParse({ username: usernameValue }).success;

	const { isFetching: isCheckingUsername, data: usernameData } = useQuery({
		queryKey: ["check-username", usernameValue],
		queryFn: () => checkUsername({ username: usernameValue }),
		enabled: !!isUsernameValid && !!usernameValue,
		retry: false,
	});

	const submit = async (data: EditProfileType) => {
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

			const payload = { ...data, ...(url ? { profileImage: url } : { profileImage: profile?.profileImage }), ...(data.bio ? { bio: data.bio } : { bio: profile?.bio }) };

			await _editProfile(payload);
		} catch (error) {
			console.error("Failed to edit profile details", error);
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }} edges={["top"]}>
			<View className="absolute -top-24 -right-14 h-48 w-48 rounded-full" style={{ backgroundColor: isDark ? "#1F2937" : "#FDE68A", opacity: 0.25 }} />
			<View className="absolute top-12 -left-12 h-32 w-32 rounded-full" style={{ backgroundColor: isDark ? "#0B1220" : "#FCA5A5", opacity: 0.2 }} />

			<View className="flex-row items-center px-4 py-3">
				<TouchableOpacity onPress={() => router.back()} className="w-10">
					<Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
				</TouchableOpacity>
				<Text className="font-manrope text-xl font-bold flex-1 text-center pr-10" style={{ color: theme.colors.textPrimary }}>
					Edit Profile
				</Text>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} className="px-4">
				<View className="rounded-3xl p-5 mb-8" style={{ backgroundColor: theme.colors.surface }}>
					<View className="flex-row items-center">
						<TouchableOpacity onPress={pickImage}>
							<View className="relative">
								{form.profileImage ? (
									<Image source={{ uri: typeof form.profileImage === "string" ? form.profileImage : form.profileImage.uri }} className="h-20 w-20 rounded-full" />
								) : (
									<View className="h-20 w-20 rounded-full items-center justify-center" style={{ backgroundColor: theme.colors.accentSurface }}>
										<Text className="font-manrope text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
											{initials}
										</Text>
									</View>
								)}
								<View className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
									<Ionicons name="camera" size={16} color={theme.colors.onPrimary} />
								</View>
							</View>
						</TouchableOpacity>
						<View className="ml-4 flex-1">
							<Text className="font-manrope text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
								{form.firstName} {form.lastName}
							</Text>
							<Text className="font-manrope text-sm mt-2" style={{ color: theme.colors.textSecondary }}>
								Update your details to keep your profile fresh.
							</Text>
						</View>
					</View>
					<View className="mt-5 rounded-2xl p-4" style={{ backgroundColor: theme.colors.accentSurface }}>
						<Text className="font-manrope text-sm" style={{ color: theme.colors.textSecondary }}>
							Tip: Use a high-quality image so your profile looks sharp across devices.
						</Text>
					</View>
				</View>

				<View className="rounded-3xl p-5" style={{ backgroundColor: theme.colors.surface }}>
					<InputField
						label="First name"
						value={form.firstName}
						placeholder="Jane"
						onChangeText={(val) => updateField("firstName", val)}
						autoCapitalize="words"
						focused={focus.firstName}
						onFocus={() => setFocus((prev) => ({ ...prev, firstName: true }))}
						onBlur={() => setFocus((prev) => ({ ...prev, firstName: false }))}
					/>

					<InputField
						label="Last name"
						value={form.lastName}
						placeholder="Doe"
						onChangeText={(val) => updateField("lastName", val)}
						autoCapitalize="words"
						focused={focus.lastName}
						onFocus={() => setFocus((prev) => ({ ...prev, lastName: true }))}
						onBlur={() => setFocus((prev) => ({ ...prev, lastName: false }))}
					/>

					<InputField
						label="Username"
						value={form.userName}
						placeholder="booklover"
						onChangeText={(val) => updateField("userName", val)}
						autoCapitalize="none"
						focused={focus.userName}
						onFocus={() => setFocus((prev) => ({ ...prev, userName: true }))}
						onBlur={() => setFocus((prev) => ({ ...prev, userName: false }))}
						iconLoading={isCheckingUsername}
						exists={isUsernameValid && usernameData && usernameData.exists}
						checkIcon={profile?.userName !== form.userName.trim() && isUsernameValid}
					/>

					<InputField
						label="Email"
						value={form.email}
						placeholder="user@example.com"
						onChangeText={(val) => {
							updateField("email", val);
						}}
						keyboardType="email-address"
						autoCapitalize="none"
						focused={focus.email}
						editable={!profile?.email}
						onFocus={() => setFocus((prev) => ({ ...prev, email: true }))}
						onBlur={() => setFocus((prev) => ({ ...prev, email: false }))}
					/>

					<InputField
						label="Bio"
						value={form.bio}
						placeholder="Tell readers what you are into."
						onChangeText={(val) => updateField("bio", val)}
						multiline
						lines={5}
						focused={focus.bio}
						onFocus={() => setFocus((prev) => ({ ...prev, bio: true }))}
						onBlur={() => setFocus((prev) => ({ ...prev, bio: false }))}
					/>
				</View>

				<TouchableOpacity
					activeOpacity={0.85}
					className="mt-8 rounded-2xl py-4 items-center"
					style={{ backgroundColor: theme.colors.primary }}
					onPress={() => submit({ ...form })}
					disabled={isEditingProfile || isUploadingImage}
				>
					{isEditingProfile || isUploadingImage ? (
						<ActivityIndicator size="small" color={theme.colors.onPrimary} />
					) : (
						<Text className="font-manrope text-base font-semibold" style={{ color: theme.colors.onPrimary }}>
							Save Changes
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
