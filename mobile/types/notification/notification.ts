import { BaseModelType } from "..";

export type Notification = {
	type: "follow" | "like" | "like_multi" | "comment";
	user: string;
	userId: string;
	text: string;
	time: string;
	avatar?: string;
	avatars?: string[];
	target?: string;
	quote?: string;
	image?: string;
	count?: number;
	isRead: boolean;
	isFollowing?: boolean;
	bookId?: string;
	reviewId?: string;
	commentId?: string;
	notificationId: string;
	id: string;
};
