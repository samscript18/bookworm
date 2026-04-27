import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { Review } from "@/types/review/review";
import { AddReviewDto, EditReviewDto, GetHomeFeedParams } from "@/types/review/review.dto";
import { AddCommentDto } from "@/types/comment/comment.dto";
import { Comment } from "@/types/comment/comment";

export const getHomeFeed = async (params: GetHomeFeedParams) => {
	try {
		const response = await authApi.get<
			ApiResponse<{
				reviews: Review[];
				nextCursor: string | null;
			}>
		>("reviews/home-feed", { params });

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getUserReviews = async (userId: string) => {
	try {
		const response = await authApi.get<ApiResponse<Review[]>>(`reviews/user/${userId}`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getBookReviews = async (bookId: string) => {
	try {
		const response = await authApi.get<ApiResponse<Review[]>>(`/reviews/book/${bookId}`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const addReview = async (bookId: string, data: AddReviewDto) => {
	try {
		const response = await authApi.post<ApiResponse<Review>>(`/reviews/${bookId}`, data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const editReview = async (reviewId: string, data: EditReviewDto) => {
	try {
		const response = await authApi.patch<ApiResponse<Review>>(`/reviews/${reviewId}`, data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const deleteReview = async (reviewId: string) => {
	try {
		const response = await authApi.delete<ApiResponse<{}>>(`/reviews/${reviewId}`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const addCommentToReview = async (reviewId: string, data: AddCommentDto) => {
	try {
		const response = await authApi.post<ApiResponse<Comment>>(`/reviews/${reviewId}/comment`, data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getReviewComments = async (reviewId: string) => {
	try {
		const response = await authApi.get<ApiResponse<Comment[]>>(`/reviews/${reviewId}/comments`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const reactToReview = async (reviewId: string) => {
	try {
		const response = await authApi.post<
			ApiResponse<{
				reviewId: string;
				action: "liked" | "unliked";
				likesCount: number;
			}>
		>(`/reviews/${reviewId}/react`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
