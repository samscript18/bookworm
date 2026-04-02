import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
	book: string;
	user: string;
	content: string;
	likes: string[];
	parentComment?: string;
}

const CommentSchema: Schema = new Schema(
	{
		book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
		parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null, nullable: true },
	},
	{ timestamps: true },
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
