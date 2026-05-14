export type NotificationCard =
	| {
			notificationId: string;
			id: string;
			type: "follow";
			user: string;
			userId: string;
			text: "started following you";
			time: string;
			avatar: string;
			isFollowing: boolean;
			isRead: boolean;
	  }
	| {
			notificationId: string;
			id: string;
			type: "like";
			user: string;
			userId: string;
			text: "liked your review of";
			target: string;
			time: string;
			avatar: string;
			image?: string;
			isRead: boolean;
			bookId: string;
			reviewId?: string;
			commentId?: string;
	  }
	| {
			notificationId: string;
			id: string;
			type: "like_multi";
			user: string;
			userId: string;
			text: "liked your review of";
			target: string;
			time: string;
			avatars: string[];
			image?: string;
			isRead: boolean;
			bookId: string;
			reviewId?: string;
			commentId?: string;
	  }
	| {
			notificationId: string;
			id: string;
			type: "like";
			user: string;
			userId: string;
			text: "liked your comment of";
			target: string;
			time: string;
			avatar: string;
			image?: string;
			isRead: boolean;
			reviewId?: string;
			commentId?: string;
	  }
	| {
			notificationId: string;
			id: string;
			type: "like_multi";
			user: string;
			userId: string;
			text: "liked your comment of";
			target: string;
			time: string;
			avatars: string[];
			image?: string;
			isRead: boolean;
			reviewId?: string;
			commentId?: string;
	  }
	| {
			notificationId: string;
			id: string;
			type: "comment";
			user: string;
			userId: string;
			text: "replied to your review:";
			quote: string;
			time: string;
			avatar: string;
			isRead: boolean;
			reviewId?: string;
			commentId?: string;
	  }
	| {
			notificationId: string;
			id: string;
			type: "comment";
			user: string;
			userId: string;
			text: "replied to your comment:";
			quote: string;
			time: string;
			avatar: string;
			isRead: boolean;
			reviewId?: string;
			commentId?: string;
	  }
	| undefined;
