import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorCode } from "../exceptions/root";
import { UnAuthorizedException, UnprocessableEntity } from "../exceptions/exceptions";
import { NotificationService } from "../services/notification.service";
import { getNotificationsSchema } from "../schemas/notification.schema";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const parsed = getNotificationsSchema.safeParse(req.query);
	if (!parsed.success) {
		throw new UnprocessableEntity("Invalid query parameters", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	const { category, cursor, limit } = parsed.data;

	const result = await NotificationService.getGroupedNotifications(userId, category, cursor as string, Number(limit));

	res.status(200).json({
		success: true,
		message: "Notifications fetched successfully",
		data: result,
	});
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
	const notificationId = req.params.notificationId;
	if (!notificationId || typeof notificationId !== "string") throw new UnprocessableEntity("Invalid notification ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const notification = await NotificationService.markAsRead(notificationId);
	res.json({ success: true, message: "Notification marked as read", data: notification });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const notifications = await NotificationService.markAllAsRead(userId);
	res.json({ success: true, message: "All notifications marked as read", data: notifications });
});
