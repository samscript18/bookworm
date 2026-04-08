import { PipelineStage, QueryFilter, Types } from "mongoose";
import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Book } from "../models/book.model";
import { IReview, Review } from "../models/review.model";
import { User } from "../models/user.model";
import { NotificationService } from "./notification.service";
import { NotificationType } from "../models/notification.model";

export class ReviewService {
	static async getHomeFeed(data: { userId: string; cursor?: string; limit: number }) {
		const user = await User.findById(data.userId).select("following");
		if (!user) throw new NotFoundException("User not found", ErrorCode.NOT_FOUND);

		const friendsIds = user.following.map((f) => f.toString());

		const friendsOfFriendsDocs = await User.find({ _id: { $in: friendsIds } }).select("following");

		const friendsOfFriendsIds = friendsOfFriendsDocs.flatMap((f) => f.following.map((id) => id.toString())).filter((id) => !friendsIds.includes(id) && id !== user._id.toString());

		const directFriendsSet = new Set(friendsIds);
		const fofSet = new Set(friendsOfFriendsIds);

		const pipeline: PipelineStage[] = [];

		if (data.cursor) {
			pipeline.push({ $match: { createdAt: { $lt: new Date(data.cursor) } } });
		}

		pipeline.push({
			$addFields: {
				priority: {
					$switch: {
						branches: [
							{ case: { $in: ["$user", Array.from(directFriendsSet)] }, then: 3 },
							{ case: { $in: ["$user", Array.from(fofSet)] }, then: 2 },
						],
						default: 1,
					},
				},
			},
		});

		pipeline.push({
			$sort: { priority: -1, createdAt: -1 },
		});

		pipeline.push({ $limit: data.limit });

		pipeline.push({
			$lookup: {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "user",
			},
		});

		pipeline.push({
			$unwind: "$user",
		});

		pipeline.push({
			$lookup: {
				from: "books",
				localField: "book",
				foreignField: "_id",
				as: "book",
			},
		});

		pipeline.push({ $unwind: "$book" });

		const reviews = await Review.aggregate(pipeline);

		const nextCursor = reviews.length > 0 ? reviews[reviews.length - 1].createdAt : null;

		return { reviews, nextCursor };
	}

	static async postReview(
		userId: string,
		bookId: string,
		data: {
			rating: number;
			content: string;
			tags?: string[];
		},
	) {
		const review = await Review.create({
			user: userId,
			book: bookId,
			...data,
		});

		const reviews = await Review.find({ book: bookId });
		const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

		await Book.findByIdAndUpdate(bookId, {
			averageRating: avg.toFixed(1),
			$inc: { totalReviews: 1 },
		});

		await User.findByIdAndUpdate(userId, { $inc: { reviewsCount: 1 } });

		return review;
	}

	static async getReviewsByBook(bookId: string) {
		const reviews = await Review.find({ book: bookId }).populate("user", "userName profileImage").sort({ createdAt: -1 }).lean();

		return reviews;
	}

	static async getReviewsByUser(userId: string) {
		const reviews = await Review.find({ user: userId }).populate("book", "title author description coverImage").sort({ createdAt: -1 }).lean();

		return reviews;
	}

	static async editReview(reviewId: string, userId: string, data: { rating?: number; content?: string; tags?: string[] }) {
		const review = await Review.findOneAndUpdate({ _id: reviewId, user: userId }, data, { returnDocument: "after" });

		if (!review) throw new NotFoundException("Review not found or unauthorized", ErrorCode.NOT_FOUND);

		return review;
	}

	static async deleteReview(reviewId: string, userId: string) {
		const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

		if (!review) throw new NotFoundException("Review not found or unauthorized", ErrorCode.NOT_FOUND);

		const reviews = await Review.find({ book: review.book });
		const avg = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;

		await Book.findByIdAndUpdate(review.book, {
			averageRating: avg.toFixed(1),
			$inc: { totalReviews: -1 },
		});

		await User.findByIdAndUpdate(userId, { $inc: { reviewsCount: -1 } });

		return review;
	}

	static async reactToReview(reviewId: string, userId: string) {
		const review = await Review.findById(reviewId);
		if (!review) throw new NotFoundException("Review not found", ErrorCode.NOT_FOUND);

		let action: "liked" | "unliked";
		const hasLiked = review.likes.some((id) => id.equals(new Types.ObjectId(userId)));

		if (hasLiked) {
			await Review.findByIdAndUpdate(reviewId, {
				$pull: { likes: new Types.ObjectId(userId) },
			});
			action = "unliked";
		} else {
			await Review.findByIdAndUpdate(reviewId, {
				$addToSet: { likes: new Types.ObjectId(userId) },
			});
			action = "liked";

			await NotificationService.createNotification(review.user, new Types.ObjectId(userId), NotificationType.reviewLike, review._id);
		}

		return {
			reviewId,
			action,
			likesCount: hasLiked ? review.likes.length - 1 : review.likes.length + 1,
		};
	}
}
