export type fcmTokenDto = {
	fcmToken: string;
	platform: "ios" | "android";
};

export type EditProfileDto = {
	firstName?: string;
	lastName?: string;
	userName?: string;
	email?: string;
	profileImage?: string;
	bio?: string;
};

export type ChangePasswordDto = {
	currentPassword: string;
	newPassword: string;
};

export type UpdatePreferencesDto = {
	pushNotifications: boolean;
};

export type ReactToUserDto = {
	userId: string;
};
