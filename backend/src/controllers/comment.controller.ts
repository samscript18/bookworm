import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { CommentService } from "../services/comment.service";
import { addCommentSchema, editCommentSchema } from "../schemas/comment.schema";
import { UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const addComment = asyncHandler(async (req: Request, res: Response) => {
	const parsed = addCommentSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid comment data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	if (!req.user) throw new UnprocessableEntity("User not authenticated", ErrorCode.UNPROCESSABLE_ENTITY, {});
	const userId = req.user._id.toString();

	const data: { book: string; user: string; content: string; parentComment?: string } = {
		book: parsed.data.bookId,
		user: userId,
		content: parsed.data.content,
	};
	if (parsed.data.parentCommentId) {
		data.parentComment = parsed.data.parentCommentId;
	}

	const comment = await CommentService.addComment(data);
	res.status(201).json({ success: true, message: "Comment added successfully", data: comment });
});

export const getCommentsByBookId = asyncHandler(async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	if (!bookId || typeof bookId !== "string") throw new UnprocessableEntity("Invalid book ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const comments = await CommentService.getCommentsByBookId(bookId);
	res.json({ success: true, message: "Comments retrieved successfully", data: comments });
});

export const editComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	const parsed = editCommentSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid comment data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const comment = await CommentService.editComment(commentId, parsed.data.content);
	res.json({ success: true, message: "Comment updated successfully", data: comment });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	await CommentService.deleteComment(commentId);
	res.json({ success: true, message: "Comment deleted successfully" });
});

export const reactToComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnprocessableEntity("User not authenticated", ErrorCode.UNPROCESSABLE_ENTITY, {});
	const userId = req.user._id.toString();

	const comment = await CommentService.reactToComment(commentId, userId);
	res.json({ success: true, message: "Comment liked successfully", data: comment });
});
