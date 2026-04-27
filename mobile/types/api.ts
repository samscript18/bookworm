export interface PaginationMeta {
	currentPage: number;
	count: number;
	totalPages: number;
}
export interface ApiResponse<T, M = PaginationMeta> {
	success: boolean;
	message: string;
	data: T;
	meta?: M;
}
