export interface ApiResponse<T, M = { page: number; count: number; totalPages: number }> {
	success: boolean;
	message: string;
	data: T;
	meta?: M;
}
