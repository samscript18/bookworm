import mongoose, { Schema, Document, HydratedDocument, Types } from "mongoose";

export interface IComment extends Document {
	review: Types.ObjectId;
	user: Types.ObjectId;
	content: string;
	likes: Types.ObjectId[];
	parentComment?: Types.ObjectId | null;
	repliesCount: number;
}

const CommentSchema: Schema = new Schema(
	{
		review: { type: Schema.Types.ObjectId, ref: "Review", required: true },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true },
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
		parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null, nullable: true },
		repliesCount: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

CommentSchema.index({ review: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
export type CommentDocument = HydratedDocument<IComment>;
