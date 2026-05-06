export type uploadBookDto = {
	title: string;
	author: string;
	description: string;
	coverImage: string;
	pages?: number;
	publisher?: string;
	publishYear?: number;
	isbn?: string;
	genres?: string[];
	tags?: string[];
};

export type getBooksParams = {
	cursor?: string;
	limit?: number;
	search?: string;
	genre?: string;
};

export type rateBookDto = {
	rating: number;
};
