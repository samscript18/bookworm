import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
	title: string;
	author: string;
	image: string;
	ratings: { user: string; rating: number }[];
}

const BookSchema: Schema = new Schema(
	{
		title: { type: String, required: true },
		author: { type: String, required: true },
		image: { type: String, required: true },
		ratings: [
			{
				user: { type: Schema.Types.ObjectId, ref: "User" },
				rating: {
					type: Number,
					required: true,
					min: [1, "Rating must be at least 1"],
					max: [5, "Rating cannot exceed 5"],
				},
			},
		],
	},
	{ timestamps: true },
);

export const Book = mongoose.model<IBook>("Book", BookSchema);
