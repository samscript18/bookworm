import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { CommentService } from "../services/comment.service";
import { editCommentSchema } from "../schemas/comment.schema";
import { UnAuthorizedException, UnprocessableEntity } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";

export const editComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	const parsed = editCommentSchema.safeParse(req.body);
	if (!parsed.success) throw new UnprocessableEntity("Invalid comment data", ErrorCode.UNPROCESSABLE_ENTITY, parsed.error);

	const comment = await CommentService.editComment(commentId, userId, parsed.data.content);
	res.json({ success: true, message: "Comment updated successfully", data: comment });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);

	const userId = req.user._id.toString();

	await CommentService.deleteComment(commentId, userId);

	res.json({ success: true, message: "Comment deleted successfully" });
});

export const reactToComment = asyncHandler(async (req: Request, res: Response) => {
	const commentId = req.params.commentId;
	if (!commentId || typeof commentId !== "string") throw new UnprocessableEntity("Invalid comment ID", ErrorCode.UNPROCESSABLE_ENTITY, {});

	if (!req.user) throw new UnAuthorizedException("User not authenticated", ErrorCode.AUTH_REQUIRED);
	const userId = req.user._id.toString();

	const data = await CommentService.reactToComment(commentId, userId);
	res.json({ success: true, message: `Comment ${data.action} successfully`, data });
});
