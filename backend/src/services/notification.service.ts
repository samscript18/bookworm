import { ClientSession, QueryFilter, Types } from "mongoose";
import { Notification, NotificationDocument, NotificationType } from "../models/notification.model";
import { DEFAULT_IMAGE, User } from "../models/user.model";
import { messaging } from "../config/firebase";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export class NotificationService {
	private static getNotificationBody(name: string, type: NotificationType): string {
		const messages: Record<NotificationType, string> = {
			[NotificationType.userFollow]: `${name} started following you.`,
			[NotificationType.reviewLike]: `${name} liked your review.`,
			[NotificationType.reviewReply]: `${name} commented on your review.`,
			[NotificationType.commentLike]: `${name} liked your comment.`,
			[NotificationType.commentReply]: `${name} replied to your comment.`,
		};
		return messages[type];
	}

	static async createNotification(recipient: Types.ObjectId, sender: Types.ObjectId, type: NotificationType, entityId?: Types.ObjectId, session?: ClientSession) {
		if (recipient.equals(sender)) return;

		const data: {
			recipient: Types.ObjectId;
			sender: Types.ObjectId;
			type: NotificationType;
			entityId?: Types.ObjectId;
		} = { recipient, sender, type };
		if (entityId) data.entityId = entityId;

		const options = session ? { session } : {};
		const [notification] = await Notification.create([data], options);

		let shouldPush = true;
		if (type === NotificationType.reviewLike && entityId && notification?._id) {
			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
			const recentNotify = await Notification.findOne({
				recipient,
				entityId,
				type: NotificationType.reviewLike,
				createdAt: { $gte: oneHourAgo },
				_id: { $ne: notification._id },
			});

			if (recentNotify) shouldPush = false;
		}

		if (shouldPush) {
			this.sendPushNotification(recipient, sender, type, entityId);
		}

		return notification;
	}

	private static async sendPushNotification(recipientId: Types.ObjectId, senderId: Types.ObjectId, type: NotificationType, entityId?: Types.ObjectId) {
		try {
			const [recipient, sender] = await Promise.all([User.findById(recipientId).select("fcmTokens preferences"), User.findById(senderId).select("userName firstName lastName profileImage")]);

			if (!recipient || !recipient.preferences?.pushNotifications || !recipient.fcmTokens.length) return;

			const senderName = sender?.userName || `${sender?.firstName} ${sender?.lastName}`;
			const body = this.getNotificationBody(senderName, type);

			const notifyDoc = await Notification.findOne({ recipient: recipientId, sender: senderId, type }).sort({ createdAt: -1 });

			const tokenEntries = recipient.fcmTokens ?? [];
			const tokens = tokenEntries.map((t) => t.token).filter((t): t is string => Boolean(t));

			if (tokens.length === 0) {
				console.log("[NotificationService]: No valid FCM tokens for recipient.");
				return;
			}

			const message = {
				notification: {
					title: "BookWorm",
					body: body,
				},
				data: {
					type: type,
					entityId: entityId?.toString() || "",
					avatar: sender?.profileImage || DEFAULT_IMAGE,
					bookCover: notifyDoc?.metadata?.bookCover || "",
				},
				tokens,
			};

			const response = await messaging.sendEachForMulticast(message);

			console.log(`[NotificationService]: Successfully sent ${response.successCount} push notifications.`);
			console.log(`[NotificationService]: Failed to send ${response.failureCount} push notifications.`);

			if (response.failureCount > 0) {
				const failedTokens: string[] = [];
				response.responses.forEach((resp, idx) => {
					if (!resp.success && tokenEntries[idx]) {
						failedTokens.push(tokenEntries[idx].token);
					}
				});

				await User.findByIdAndUpdate(recipientId, {
					$pull: { fcmTokens: { $in: failedTokens } },
				});
			}
		} catch (error) {
			console.error("FCM Error:", error);
		}
	}

	static async getGroupedNotifications(userId: string, category: string, cursor: string, limit: number) {
		const match: QueryFilter<NotificationDocument> = { recipient: new Types.ObjectId(userId) };

		if (category === "mentions") match.type = { $in: [NotificationType.reviewReply, NotificationType.commentReply] };

		if (cursor) {
			match.createdAt = {
				$lt: new Date(cursor),
			};
		}

		const notifications = await Notification.aggregate([
			{ $match: match },
			{ $sort: { createdAt: -1, _id: -1 } },
			{
				$group: {
					_id: {
						type: "$type",
						entityId: "$entityId",
						day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					},
					latestSender: { $first: "$sender" },
					count: { $sum: 1 },
					metadata: { $first: "$metadata" },
					createdAt: { $first: "$createdAt" },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: limit + 1 },
			{ $lookup: { from: "users", localField: "latestSender", foreignField: "_id", as: "senderInfo" } },
			{ $unwind: "$senderInfo" },
		]);

		const hasNextPage = notifications.length > limit;

		const data = hasNextPage ? notifications.slice(0, limit) : notifications;

		const nextCursor = hasNextPage && data.length ? data[data.length - 1].createdAt : null;

		return {
			data,
			nextCursor,
		};
	}

	static async markAllAsRead(userId: string) {
		const notifications = await Notification.updateMany({ recipient: new Types.ObjectId(userId), isRead: false }, { isRead: true }).sort({ createdAt: -1 });

		return notifications;
	}

	static async markAsRead(notificationId: string) {
		const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { returnDocument: "after" });

		if (!notification) {
			throw new NotFoundException("Notification not found", ErrorCode.NOT_FOUND);
		}

		return notification;
	}
}
