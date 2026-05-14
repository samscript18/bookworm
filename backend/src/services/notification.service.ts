import { ClientSession, QueryFilter, Types } from "mongoose";
import { Notification, NotificationDocument, NotificationType } from "../models/notification.model";
import { DEFAULT_IMAGE, User } from "../models/user.model";
import { messaging } from "../config/firebase";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Review } from "../models/review.model";
import { Comment } from "../models/comment.model";
import { Book } from "../models/book.model";
import { formatNotification } from "../utils/helpers/helper";

export class NotificationService {
	private static getRoute(type: NotificationType) {
		switch (type) {
			case NotificationType.userFollow:
				return "profile";

			case NotificationType.reviewLike:
			case NotificationType.reviewReply:
				return "review";

			case NotificationType.commentLike:
			case NotificationType.commentReply:
				return "comment";

			default:
				return "notifications";
		}
	}

	private static async buildMetadata(type: NotificationType, entityId?: Types.ObjectId) {
		if (!entityId) return undefined;

		if (type === NotificationType.reviewLike) {
			const review = await Review.findById(entityId)
				.populate({
					path: "book",
					select: "title coverImage",
				})
				.select("content book")
				.lean();

			if (!review || !review.book) return undefined;

			return {
				bookTitle: (review.book as any).title,
				bookCover: (review.book as any).coverImage,
				textSnippet: review.content.slice(0, 120),
			};
		}

		if (type === NotificationType.reviewReply) {
			const comment = await Comment.findById(entityId)
				.populate({
					path: "review",
					select: "book",
					populate: {
						path: "book",
						model: Book,
						select: "title coverImage",
					},
				})
				.select("content review")
				.lean();

			if (!comment || !comment.review) return undefined;

			const review = comment.review as any;

			return {
				bookTitle: review.book?.title,
				bookCover: review.book?.coverImage,
				textSnippet: comment.content.slice(0, 120),
			};
		}

		if (type === NotificationType.commentLike || type === NotificationType.commentReply) {
			const comment = await Comment.findById(entityId)
				.populate({
					path: "review",
					select: "book",
					populate: {
						path: "book",
						model: Book,
						select: "title coverImage",
					},
				})
				.select("content review")
				.lean();

			if (!comment || !comment.review) return undefined;

			const review = comment.review as any;

			return {
				bookTitle: review.book?.title,
				bookCover: review.book?.coverImage,
				textSnippet: comment.content.slice(0, 120),
			};
		}

		return undefined;
	}

	private static getNotificationBody(name: string, type: NotificationType, metadata?: any): string {
		switch (type) {
			case NotificationType.userFollow:
				return `${name} started following you.`;

			case NotificationType.reviewLike:
				return `${name} liked your review${metadata?.bookTitle ? ` of ${metadata.bookTitle}` : ""}.`;

			case NotificationType.reviewReply:
				return `${name} commented on your review.`;

			case NotificationType.commentLike:
				return `${name} liked your comment.`;

			case NotificationType.commentReply:
				return `${name} replied to your comment.`;

			default:
				return `${name} interacted with your content.`;
		}
	}

	static async createNotification(recipient: Types.ObjectId, sender: Types.ObjectId, type: NotificationType, entityId?: Types.ObjectId, session?: ClientSession) {
		if (recipient.equals(sender)) return null;

		if (type === NotificationType.userFollow) {
			const exists = await Notification.findOne({
				recipient,
				sender,
				type,
			});

			if (exists) return exists;
		}

		const metadata = await this.buildMetadata(type, entityId);

		const data: {
			recipient: Types.ObjectId;
			sender: Types.ObjectId;
			type: NotificationType;
			entityId?: Types.ObjectId;
			metadata?: {
				bookTitle?: string;
				bookCover?: string;
				textSnippet?: string;
			};
		} = {
			recipient,
			sender,
			type,
		};

		if (entityId) {
			data.entityId = entityId;
		}

		if (metadata) {
			data.metadata = metadata;
		}

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

			if (recentNotify) {
				shouldPush = false;
			}
		}

		if (shouldPush && notification?._id) {
			await this.sendPushNotification(notification._id);
		}

		return notification;
	}

	private static async sendPushNotification(notificationId: Types.ObjectId) {
		try {
			const notification = await Notification.findById(notificationId).lean();

			if (!notification) return;

			const [recipient, sender] = await Promise.all([User.findById(notification.recipient).select("fcmTokens preferences"), User.findById(notification.sender).select("userName firstName lastName profileImage")]);

			if (!recipient) return;

			if (!recipient.preferences?.pushNotifications) return;

			if (!recipient.fcmTokens?.length) return;

			const senderName = sender?.userName || `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim();

			const body = this.getNotificationBody(senderName, notification.type, notification.metadata);

			const tokenEntries = recipient.fcmTokens ?? [];

			const tokens = tokenEntries.map((t) => t.token).filter((t): t is string => Boolean(t));

			if (!tokens.length) {
				console.log("[NotificationService]: No valid FCM tokens.");
				return;
			}

			const message = {
				notification: {
					title: "BookWorm",
					body,
				},

				data: {
					notificationId: notification._id.toString(),

					type: notification.type,

					route: this.getRoute(notification.type),

					entityId: notification.entityId?.toString() || "",

					senderId: sender?._id?.toString() || "",

					avatar: sender?.profileImage || DEFAULT_IMAGE,

					bookCover: notification.metadata?.bookCover || "",

					bookTitle: notification.metadata?.bookTitle || "",
				},

				tokens,
			};

			const response = await messaging.sendEachForMulticast(message);

			console.log(`[NotificationService]: Sent ${response.successCount} push notifications.`);
			console.log(`[NotificationService]: Failed ${response.failureCount} push notifications.`);

			if (response.failureCount > 0) {
				const failedTokens: string[] = [];

				response.responses.forEach((resp, idx) => {
					if (!resp.success && tokenEntries[idx]) {
						failedTokens.push(tokenEntries[idx].token);
					}
				});

				if (failedTokens.length) {
					await User.findByIdAndUpdate(recipient._id, {
						$pull: {
							fcmTokens: {
								token: { $in: failedTokens },
							},
						},
					});
				}
			}
		} catch (error) {
			console.error("[NotificationService] FCM Error:", error);
		}
	}

	static async getGroupedNotifications(userId: string, category: string, cursor: string, limit: number) {
		const userObjectId = new Types.ObjectId(userId);

		const currentUser = await User.findById(userObjectId).select("following").lean();

		const followingArray = (currentUser?.following || []).map((id) => new Types.ObjectId(id));

		const match: QueryFilter<NotificationDocument> = {
			recipient: userObjectId,
		};

		if (category === "mentions") {
			match.type = {
				$in: [NotificationType.reviewReply, NotificationType.commentReply],
			};
		}

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
						day: {
							$dateToString: {
								format: "%Y-%m-%d",
								date: "$createdAt",
							},
						},
					},

					notificationIds: { $addToSet: "$_id" },

					count: { $sum: 1 },

					senders: { $addToSet: "$sender" },

					latestSender: { $first: "$sender" },

					entityId: { $first: "$entityId" },

					metadata: { $first: "$metadata" },

					isRead: { $first: "$isRead" },

					createdAt: { $first: "$createdAt" },
				},
			},

			{
				$lookup: {
					from: "users",
					localField: "latestSender",
					foreignField: "_id",
					as: "sender",
				},
			},

			{ $unwind: "$sender" },

			{
				$lookup: {
					from: "users",
					localField: "senders",
					foreignField: "_id",
					as: "senderList",
				},
			},

			{
				$lookup: {
					from: "comments",
					localField: "entityId",
					foreignField: "_id",
					as: "comment",
				},
			},

			{
				$unwind: {
					path: "$comment",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$addFields: {
					reviewId: {
						$ifNull: ["$comment.review", "$entityId"],
					},
				},
			},

			{
				$lookup: {
					from: "reviews",
					localField: "reviewId",
					foreignField: "_id",
					as: "review",
				},
			},

			{
				$unwind: {
					path: "$review",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$lookup: {
					from: "books",
					localField: "review.book",
					foreignField: "_id",
					as: "book",
				},
			},
			{
				$unwind: {
					path: "$book",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$addFields: {
					isFollowing: {
						$in: ["$sender._id", followingArray],
					},
				},
			},

			{
				$project: {
					id: {
						$concat: [{ $toString: "$_id.entityId" }, "-", "$_id.type", "-", "$_id.day"],
					},

					notificationId: { $arrayElemAt: ["$notificationIds", 0] },

					type: "$_id.type",

					entityId: "$_id.entityId",

					count: 1,

					createdAt: 1,

					isRead: 1,

					user: {
						$concat: ["$sender.firstName", " ", "$sender.lastName"],
					},

					userId: "$sender._id",

					avatar: {
						$ifNull: ["$sender.profileImage", DEFAULT_IMAGE],
					},

					avatars: {
						$map: {
							input: { $slice: ["$senderList", 3] },
							as: "s",
							in: {
								$ifNull: ["$$s.profileImage", DEFAULT_IMAGE],
							},
						},
					},

					isFollowing: 1,

					bookId: "$book._id",

					bookTitle: "$book.title",

					bookCover: "$book.coverImage",

					reviewId: "$review._id",

					commentId: "$comment._id",

					textSnippet: {
						$let: {
							vars: {
								commentText: { $ifNull: ["$comment.content", ""] },
								metadataText: { $ifNull: ["$metadata.textSnippet", ""] },
								reviewText: { $ifNull: ["$review.content", ""] },
							},
							in: {
								$cond: [
									{ $gt: [{ $strLenCP: "$$commentText" }, 0] },
									{ $substrCP: ["$$commentText", 0, 120] },
									{
										$cond: [
											{ $gt: [{ $strLenCP: "$$metadataText" }, 0] },
											{ $substrCP: ["$$metadataText", 0, 120] },
											{
												$cond: [{ $gt: [{ $strLenCP: "$$reviewText" }, 0] }, { $substrCP: ["$$reviewText", 0, 120] }, ""],
											},
										],
									},
								],
							},
						},
					},
				},
			},

			{ $sort: { createdAt: -1 } },

			{ $limit: limit + 1 },
		]);

		const hasNextPage = notifications.length > limit;

		const data = hasNextPage ? notifications.slice(0, limit) : notifications;

		const nextCursor = hasNextPage && data.length ? data[data.length - 1].createdAt : null;

		const formatted = data.map(formatNotification);

		return {
			notifications: formatted,
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

	static async getUnreadCount(userId: string) {
		const count = await Notification.countDocuments({ recipient: new Types.ObjectId(userId), isRead: false });

		return count;
	}
}
