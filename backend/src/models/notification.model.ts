import { Schema, model, Document, Types, HydratedDocument } from "mongoose";

export enum NotificationType {
	userFollow = "user.folow",
	reviewLike = "review.like",
	reviewReply = "review.reply",
	commentReply = "comment.reply",
	commentLike = "comment.like",
}

export enum NotificationCategory {
	ALL = "all",
	MENTIONS = "mentions",
	FOLLOWING = "following",
}

export interface INotification extends Document {
	recipient: Types.ObjectId;
	sender: Types.ObjectId;
	type: NotificationType;
	category: NotificationCategory;
	entityId?: Types.ObjectId;
	metadata?: {
		bookTitle: string;
		bookCover: string;
		textSnippet: string;
	};
	isRead: boolean;
	createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
	{
		recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
		type: { type: String, enum: Object.values(NotificationType), required: true },
		category: { type: String, enum: Object.values(NotificationCategory) },
		entityId: { type: Schema.Types.ObjectId },
		metadata: {
			bookTitle: String,
			bookCover: String,
			textSnippet: String,
		},
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Notification = model<INotification>("Notification", NotificationSchema);
export type NotificationDocument = HydratedDocument<INotification>;
