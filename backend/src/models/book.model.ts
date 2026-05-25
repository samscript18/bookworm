import mongoose, { Schema, Document, HydratedDocument } from "mongoose";
import { toLowercaseArray } from "../utils/helpers/helper";

export interface IBook extends Document {
	title: string;
	author: string;
	description: string;
	coverImage: string;
	pages: number;
	publisher: string;
	publishYear: number;
	isbn: string;
	genres: string[];
	tags: string[];
	readingUrl?: string;
	source?: string;
	externalId?: string;
	language?: string;
	averageRating: number;
	totalReviews: number;
}

const BookSchema: Schema = new Schema(
	{
		title: { type: String, required: true },
		author: { type: String, required: true },
		description: { type: String, required: true },
		coverImage: { type: String, required: true },
		pages: { type: Number },
		publisher: { type: String },
		publishYear: { type: Number },
		isbn: { type: String, unique: true, sparse: true },
		genres: { type: [String], set: toLowercaseArray },
		tags: { type: [String], set: toLowercaseArray },
		readingUrl: { type: String },
		source: { type: String, index: true },
		externalId: { type: String, unique: true, sparse: true },
		language: { type: String },
		averageRating: { type: Number, default: 0, min: 0, max: 5 },
		totalReviews: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

BookSchema.index({ genres: 1, averageRating: -1 });
BookSchema.index({ source: 1, externalId: 1 }, { unique: true, sparse: true });

export const Book = mongoose.model<IBook>("Book", BookSchema);
export type BookDocument = HydratedDocument<IBook>;
