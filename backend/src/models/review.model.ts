import { Schema, model, Document, Types, HydratedDocument } from "mongoose";

export interface IReview extends Document {
	user: Types.ObjectId;
	book: Types.ObjectId;
	rating: number;
	content: string;
	tags: string[];
	likes: Types.ObjectId[];
	commentsCount: number;
	createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		content: { type: String, required: true, maxlength: 3000 },
		tags: [{ type: String }],
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
		commentsCount: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

ReviewSchema.index({ book: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

export const Review = model<IReview>("Review", ReviewSchema);
export type ReviewDocument = HydratedDocument<IReview>;
