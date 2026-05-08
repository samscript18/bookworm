import { Request, Response } from "express";
import { UnAuthorizedException, UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserService } from "../services/user.service";
import { changePasswordSchema, editProfileSchema, fcmTokenSchema, updatePreferencesSchema, getNotificationsSchema, getProfileSchema } from "../schemas/user.schema";
import { NotificationService } from "../services/notification.service";

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
	const parsed = changePasswordSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const result = await UserService.changePassword(parsed.data.currentPassword, parsed.data.newPassword, userId);
	res.json({ success: true, message: result.message });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
	const parsed = getProfileSchema.safeParse(req.query);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const currentUserId = req.user._id.toString();

	const userId = parsed.data.userId;

	const result = await UserService.getUserById(currentUserId, userId);
	res.json({ success: true, message: "User data retrieved successfully", data: result });
});

export const editProfile = asyncHandler(async (req: Request, res: Response) => {
	const parsed = editProfileSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const filteredData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));

	const result = await UserService.editUser(userId, filteredData);
	res.json({ success: true, message: "User profile updated successfully", data: result });
});

export const reactToUser = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const targetId = req.params.userId as string;
	if (!targetId) {
		throw new UnprocessableEntity("Target user ID is required", ErrorCode.UNPROCESSABLE_ENTITY, {});
	}

	const result = await UserService.reactToUser(userId, targetId);
	res.json({ success: true, message: `User ${result.action} successfully`, data: { isFollowing: result.isFollowing } });
});

export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
	try {
		if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
		const userId = req.user._id.toString();

		const parsed = updatePreferencesSchema.safeParse(req.body);

		if (!parsed.success) {
			throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
		}

		const filteredData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));

		const updatedUser = await UserService.editUser(userId, { preferences: filteredData as { pushNotifications: boolean; darkMode: boolean } });

		res.status(200).json({
			success: true,
			message: "User preferences updated successfully",
			data: updatedUser?.preferences,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: "Failed to update settings" });
	}
});

export const updateFcmToken = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const parsed = fcmTokenSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	await UserService.addFcmToken(userId, { fcmToken: parsed.data.fcmToken, platform: parsed.data.platform });

	res.status(200).json({ success: true, message: "Device token registered" });
});

export const removeFcmToken = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const parsed = fcmTokenSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new UnprocessableEntity("Validation error", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	await UserService.removeFcmToken(userId, { fcmToken: parsed.data.fcmToken, platform: parsed.data.platform });

	res.status(200).json({ success: true });
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const parsed = getNotificationsSchema.safeParse(req.query);
	if (!parsed.success) {
		throw new UnprocessableEntity("Invalid query parameters", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	const { category, page, limit } = parsed.data;

	const result = await NotificationService.getGroupedNotifications(userId, category, page, limit);

	res.status(200).json({
		success: true,
		message: "Notifications fetched successfully",
		data: result.data,
		meta: {
			totalPages: result.meta.totalPages,
			currentPage: result.meta.currentPage,
			count: result.meta.count,
		},
	});
});
