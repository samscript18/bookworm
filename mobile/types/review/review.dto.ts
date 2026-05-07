export type AddReviewDto = {
	rating: number;
	content: string;
	tags?: string[];
};

export type EditReviewDto = {
	rating?: number;
	content?: string;
	tags?: string[];
};

export type GetHomeFeedParams = {
	limit?: number;
	cursor?: string;
};

export type AddReviewType = {
	bookId: string;
	data: AddReviewDto;
};
