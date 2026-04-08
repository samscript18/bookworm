import { Request, Response } from "express";
import { UnAuthorizedException, UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { asyncHandler } from "../middleware/asyncHandler";
import { ReviewService } from "../services/review.service";
import { editReviewSchema, postReviewSchema } from "../schemas/review.schema";
import { addCommentSchema } from "../schemas/comment.schema";
import { CommentService } from "../services/comment.service";

export const getHomeFeed = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	let data: {
		cursor?: string;
		limit: number;
		userId: string;
	} = {
		userId,
		limit: 100,
	};

	if (req.query.cursor) {
		data.cursor = req.query.cursor as string;
		if (isNaN(Date.parse(data.cursor))) {
			throw new UnprocessableEntity("Invalid cursor format. Expected ISO date string.", ErrorCode.UNPROCESSABLE_ENTITY, {});
		}
	}

	if (req.query.limit) {
		data.limit = Number(req.query.limit) || 100;
	}

	const result = await ReviewService.getHomeFeed(data);
	res.json({ success: true, message: "Home feed retrieved successfully", data: result });
});

export const postReview = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();
	const bookId = req.params.bookId as string;

	const parsed = postReviewSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new UnprocessableEntity("Invalid review data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	const data: {
		rating: number;
		content: string;
		tags?: string[];
	} = {
		rating: parsed.data.rating,
		content: parsed.data.content,
	};

	if (parsed.data.tags) {
		data.tags = parsed.data.tags;
	}

	const review = await ReviewService.postReview(userId, bookId, data);
	res.json({ success: true, message: "Review posted successfully", data: review });
});

export const getReviewsByBook = asyncHandler(async (req: Request, res: Response) => {
	const bookId = req.params.bookId as string;

	const reviews = await ReviewService.getReviewsByBook(bookId);

	res.json({ success: true, message: "Reviews for book retrieved successfully", data: reviews });
});

export const getReviewsByUser = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	const reviews = await ReviewService.getReviewsByUser(userId);

	res.json({ success: true, message: "Reviews by user retrieved successfully", data: reviews });
});

export const editReview = asyncHandler(async (req: Request, res: Response) => {
	const parsed = editReviewSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new UnprocessableEntity("Invalid review data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);
	}

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();
	const reviewId = req.params.reviewId as string;

	const filteredData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));

	const review = await ReviewService.editReview(reviewId, userId, filteredData);
	res.json({ success: true, message: "Review edited successfully", data: review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();
	const reviewId = req.params.reviewId as string;

	await ReviewService.deleteReview(reviewId, userId);
	res.json({ success: true, message: "Review deleted successfully" });
});

export const addCommentToReview = asyncHandler(async (req: Request, res: Response) => {
	const reviewId = req.params.reviewId as string;
	if (!reviewId) throw new UnprocessableEntity("Review ID is required", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const parsed = addCommentSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid comment data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	const data: { review: string; user: string; content: string; parentComment?: string } = {
		review: reviewId,
		user: userId,
		content: parsed.data.content,
	};
	if (parsed.data.parentCommentId) {
		data.parentComment = parsed.data.parentCommentId;
	}

	const comment = await CommentService.addComment(data);
	res.status(201).json({ success: true, message: "Comment added successfully", data: comment });
});

export const getCommentsByReview = asyncHandler(async (req: Request, res: Response) => {
	const reviewId = req.params.reviewId as string;
	if (!reviewId) throw new UnprocessableEntity("Invalid review ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const comments = await CommentService.getCommentsByReviewId(reviewId);

	res.json({ success: true, message: "Comments retrieved successfully", data: comments });
});

export const reactToReview = asyncHandler(async (req: Request, res: Response) => {
	const reviewId = req.params.reviewId as string;
	if (!reviewId) throw new UnprocessableEntity("Invalid review ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const data = await ReviewService.reactToReview(reviewId, userId);
	res.json({ success: true, message: `Review ${data.action} successfully`, data });
});
