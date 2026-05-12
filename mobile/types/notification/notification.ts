import { BaseModelType } from "..";

export type Notification = {
	recipient: string;
	sender: string;
	type: string;
	category: string;
	entityId?: string;
	metadata?: {
		bookTitle: string;
		bookCover: string;
		textSnippet: string;
	};
	isRead: boolean;
} & BaseModelType;
