import { Types } from "mongoose";
import { IUser, User } from "../models/user.model";
import { NotificationType } from "../models/notification.model";
import { NotificationService } from "./notification.service";
import { BadRequestsException, NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { comparePassword, hashPassword, sanitizeUser } from "../utils/helpers/helper";

export class UserService {
	static async getUserById(userId: string) {
		const user = await User.findById(userId);
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);
		return sanitizeUser(user);
	}

	static async editUser(userId: string, data: Partial<IUser>) {
		const user = await User.findByIdAndUpdate(userId, data, { returnDocument: "after" });
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);
		return sanitizeUser(user);
	}

	static async changePassword(currentPassword: string, newPassword: string, userId: string) {
		const user = await User.findById(userId);
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		if (!user.password || user.password === null) {
			throw new BadRequestsException("Password change not allowed for Google-authenticated accounts", ErrorCode.UNAUTHORIZED);
		}

		const isMatch = await comparePassword(currentPassword, user.password);
		if (!isMatch) throw new BadRequestsException("Invalid Credentials", ErrorCode.INCORRECT_PASSWORD);

		if (currentPassword === newPassword) {
			throw new BadRequestsException("New password cannot be the same as the old one.", ErrorCode.SAME_PASSWORD);
		}

		user.password = await hashPassword(newPassword);
		await user.save();

		return { message: "Password changed successfully" };
	}

	static async reactToUser(followerId: string, targetId: string) {
		if (followerId === targetId) {
			return { isFollowing: false, action: "none" as const };
		}

		const session = await User.startSession();
		session.startTransaction();

		try {
			let action: "follow" | "unfollow" | "none" = "none";
			const existingFollow = await User.exists({ _id: followerId, following: targetId });

			if (existingFollow) {
				await User.findByIdAndUpdate(
					followerId,
					{
						$pull: { following: targetId },
						$inc: { followingCount: -1 },
					},
					{ session },
				);
				await User.findByIdAndUpdate(
					targetId,
					{
						$pull: { followers: followerId },
						$inc: { followersCount: -1 },
					},
					{ session },
				);

				action = "unfollow";
			} else {
				await User.findByIdAndUpdate(
					followerId,
					{
						$addToSet: { following: targetId },
						$inc: { followingCount: 1 },
					},
					{ session },
				);
				await User.findByIdAndUpdate(
					targetId,
					{
						$addToSet: { followers: followerId },
						$inc: { followersCount: 1 },
					},
					{ session },
				);

				action = "follow";

				await NotificationService.createNotification(new Types.ObjectId(targetId), new Types.ObjectId(followerId), NotificationType.userFollow, new Types.ObjectId(followerId), session);
			}

			await session.commitTransaction();
			session.endSession();

			return {
				isFollowing: action === "follow",
				action: action === "follow" ? "followed" : "unfollowed",
			};
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}

	static async addFcmToken(userId: string, { fcmToken, platform }: { fcmToken: string; platform: string }) {
		await User.updateMany({ "fcmTokens.token": fcmToken }, { $pull: { fcmTokens: { token: fcmToken } } });

		const user = await User.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: { token: fcmToken, platform } } }, { returnDocument: "after" });

		return user;
	}

	static async removeFcmToken(userId: string, { fcmToken, platform }: { fcmToken: string; platform: string }) {
		const user = await User.findByIdAndUpdate(userId, { $pull: { fcmTokens: { token: fcmToken, platform } } }, { returnDocument: "after" });

		return user;
	}
}
