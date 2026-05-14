import mongoose, { Types } from "mongoose";
import { BadRequestsException, NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Comment } from "../models/comment.model";
import { Review } from "../models/review.model";
import { NotificationService } from "./notification.service";
import { NotificationType } from "../models/notification.model";

export class CommentService {
	static async addComment(data: { review: string; user: string; content: string; parentComment?: string }) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const [comment] = await Comment.create([data], { session });

			if (!comment) throw new BadRequestsException("Failed to create comment", ErrorCode.UNPROCESSABLE_ENTITY);

			if (data.parentComment) {
				const parentComment = await Comment.findByIdAndUpdate(data.parentComment, { $inc: { repliesCount: 1 } }, { session });

				if (parentComment) {
					await NotificationService.createNotification(parentComment.user, new Types.ObjectId(data.user), NotificationType.commentReply, comment._id, session);
				}
			} else {
				const review = await Review.findById(data.review).session(session);
				if (!review) throw new NotFoundException("Review not found", ErrorCode.NOT_FOUND);

				await NotificationService.createNotification(review.user, new Types.ObjectId(data.user), NotificationType.reviewReply, comment._id, session);
			}

			await Review.findByIdAndUpdate(data.review, { $inc: { commentsCount: 1 } }, { session });

			await session.commitTransaction();
			session.endSession();

			return comment;
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}

	static async getComment(commentId: string) {
		const comment = await Comment.findById(commentId).select("review").lean();
		return comment;
	}

	static async getCommentsByReviewId(reviewId: string) {
		const comments = await Comment.find({ review: reviewId }).populate("user", "userName profileImage").sort({ createdAt: -1 }).lean();
		return comments;
	}

	static async editComment(commentId: string, userId: string, content: string) {
		const comment = await Comment.findOneAndUpdate({ _id: commentId, user: userId }, { content }, { returnDocument: "after" });

		if (!comment) throw new NotFoundException("Comment not found", ErrorCode.NOT_FOUND);

		return comment;
	}

	static async deleteComment(commentId: string, userId: string) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const comment = await Comment.findOneAndDelete({ _id: commentId, user: userId }, { session });

			if (!comment) throw new NotFoundException("Comment not found", ErrorCode.NOT_FOUND);

			const repliesCount = await Comment.countDocuments({ parentComment: commentId }, { session });

			if (comment.parentComment) {
				await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } }, { session });
			}

			await Comment.deleteMany({ parentComment: commentId }, { session });

			await Review.findByIdAndUpdate(comment.review, { $inc: { commentsCount: -(1 + repliesCount) } }, { session });

			await session.commitTransaction();
			session.endSession();

			return comment;
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}

	static async reactToComment(commentId: string, userId: string) {
		const comment = await Comment.findById(commentId);
		if (!comment) throw new NotFoundException("Comment not found", ErrorCode.NOT_FOUND);

		let action: "liked" | "unliked";
		const hasLiked = comment.likes.some((id) => id.equals(new Types.ObjectId(userId)));

		if (hasLiked) {
			await Comment.findByIdAndUpdate(commentId, {
				$pull: { likes: new Types.ObjectId(userId) },
			});
			action = "unliked";
		} else {
			await Comment.findByIdAndUpdate(commentId, {
				$addToSet: { likes: new Types.ObjectId(userId) },
			});
			action = "liked";

			await NotificationService.createNotification(comment.user, new Types.ObjectId(userId), NotificationType.commentLike, comment._id);
		}

		return {
			commentId,
			action,
			likesCount: hasLiked ? comment.likes.length - 1 : comment.likes.length + 1,
		};
	}
}
