import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import secrets from "../../constants/secrets.constant";
import { UserDocument } from "../../models/user.model";
import crypto from "crypto";
import { PaginationQuery } from "../../types/pagination.type";
import { formatDistanceToNow } from "date-fns";
import { NotificationCard } from "../../types";
import { NotificationType } from "../../models/notification.model";

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export const hashToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateResetToken = () => {
	const token = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
	const hashedToken = hashToken(token);

	return { token, hashedToken };
};

export const generateUniqueUsername = (baseName: string): string => {
	const cleanName = baseName
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[^a-z0-9]/g, "");

	const suffix = crypto.randomBytes(2).toString("hex");

	return `${cleanName}${suffix}`;
};

class JWT {
	private get secret(): string {
		return secrets.jwtSecret;
	}

	public generateToken(userId: string): string {
		return jwt.sign({ sub: userId }, this.secret, {
			expiresIn: "7d",
			algorithm: "HS256",
		});
	}

	public verifyToken<T = JwtPayload>(token: string): T {
		try {
			return jwt.verify(token, this.secret) as T;
		} catch (err) {
			throw new Error("Invalid or expired token");
		}
	}
}
export const jwtHelper = new JWT();

export const sanitizeUser = (user: UserDocument) => {
	const userObj = user.toObject();
	const { password, __v, ...sanitized } = userObj;
	return sanitized;
};

export function getPaginationData(query: PaginationQuery, count: number) {
	const skip = typeof query?.page === "number" ? query.page : 1;
	let limit = query?.limit ?? 30;
	const offset = (skip - 1) * limit;
	const totalPages = Math.ceil(count / limit);
	if (query?.limit === 0 && count === 0) limit++;

	return {
		limit,
		offset,
		totalPages,
	};
}

export const toLowercaseArray = (arr: string[]) => {
	if (!Array.isArray(arr)) return arr;

	return [...new Set(arr.filter(Boolean).map((item) => item.toLowerCase().trim()))];
};

function formatNotificationTime(date: Date) {
	return formatDistanceToNow(new Date(date), {
		addSuffix: true,
	})
		.replace("about ", "")
		.replace("minutes", "m")
		.replace("minute", "m")
		.replace("hours", "h")
		.replace("hour", "h")
		.replace("days", "d")
		.replace("day", "d");
}

export function formatNotification(notification: any): NotificationCard {
	const count = notification.count ?? 1;
	const time = formatNotificationTime(notification.createdAt);

	const avatar = notification.avatar;

	switch (notification.type) {
		case NotificationType.userFollow:
			return {
				notificationId: notification.notificationId,
				id: notification.id,
				type: "follow",
				user: count > 1 ? `${notification.user} and ${count - 1} others` : notification.user,
				userId: notification.userId,
				isFollowing: notification.isFollowing,
				text: "started following you",
				time,
				avatar,
				isRead: notification.isRead,
			};

		case NotificationType.reviewLike:
		case NotificationType.commentLike:
			if (count > 1) {
				return {
					notificationId: notification.notificationId,
					id: notification.id,
					type: "like_multi",
					user: `${notification.user} and ${count - 1} others`,
					text: `liked your ${notification.type === NotificationType.reviewLike ? "review" : "comment"} of`,
					time,
					avatars: notification.avatars || [avatar],
					userId: notification.userId,
					isRead: notification.isRead,
					...(notification.reviewId && { reviewId: notification.reviewId }),
					...(notification.commentId && { commentId: notification.commentId }),
					...(notification.bookId && { bookId: notification.bookId }),
					...(notification.type === NotificationType.commentLike && { quote: notification.textSnippet }),
					...(notification.type === NotificationType.reviewLike && { target: notification.bookTitle, image: notification.bookCover }),
				};
			}

			return {
				notificationId: notification.notificationId,
				id: notification.id,
				type: "like",
				user: notification.user,
				text: `liked your ${notification.type === NotificationType.reviewLike ? "review" : "comment"} of`,
				time,
				avatar,
				userId: notification.userId,
				isRead: notification.isRead,
				...(notification.reviewId && { reviewId: notification.reviewId }),
				...(notification.commentId && { commentId: notification.commentId }),
				...(notification.bookId && { bookId: notification.bookId }),
				...(notification.type === NotificationType.commentLike && { quote: notification.textSnippet }),
				...(notification.type === NotificationType.reviewLike && { target: notification.bookTitle, image: notification.bookCover }),
			};

		case NotificationType.reviewReply:
		case NotificationType.commentReply:
			return {
				notificationId: notification.notificationId,
				id: notification.id,
				type: "comment",
				user: notification.user,
				text: `replied to your ${notification.type === NotificationType.reviewReply ? "review" : "comment"}:`,
				quote: notification.textSnippet,
				time,
				avatar,
				userId: notification.userId,
				isRead: notification.isRead,
				...(notification.reviewId && { reviewId: notification.reviewId }),
				...(notification.commentId && { commentId: notification.commentId }),
			};

		default:
			return undefined;
	}
}
