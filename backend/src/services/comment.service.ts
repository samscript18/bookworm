import { NotFoundException } from "../exceptions/exceptions";
import { ErrorCode } from "../exceptions/root";
import { Comment } from "../models/comment.model";

export class CommentService {
	static async addComment(data: { book: string; user: string; content: string; parentComment?: string }) {
		const comment = await Comment.create(data);
		return comment;
	}

	static async getCommentsByBookId(bookId: string) {
		const comments = await Comment.find({ book: bookId }).populate("user", "userName profileImage").sort({ createdAt: -1 }).lean();
		return comments;
	}

	static async editComment(commentId: string, content: string) {
		const comment = await Comment.findByIdAndUpdate(commentId, { content }, { returnDocument: "after" });
		return comment;
	}

	static async deleteComment(commentId: string) {
		const comment = await Comment.findByIdAndDelete(commentId);
		return comment;
	}

	static async reactToComment(commentId: string, userId: string) {
		const comment = await Comment.findById(commentId);
		if (!comment) throw new NotFoundException("Comment not found", ErrorCode.NOT_FOUND);

		const index = comment.likes.indexOf(userId);
		if (index >= 0) comment.likes.splice(index, 1);
		else comment.likes.push(userId);

		await comment.save();
		return comment;
	}
}
