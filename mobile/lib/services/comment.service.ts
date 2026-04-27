import { ApiResponse } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { EditCommentDto } from "@/types/comment/comment.dto";
import { Comment } from "@/types/comment/comment";

export const editComment = async (commentId: string, data: EditCommentDto) => {
	try {
		const response = await authApi.patch<ApiResponse<Comment>>(`/comments/${commentId}`, data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const deleteComment = async (commentId: string) => {
	try {
		const response = await authApi.delete<ApiResponse<{}>>(`/comments/${commentId}`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const reactToComment = async (commentId: string) => {
	try {
		const response = await authApi.post<
			ApiResponse<{
				commentId: string;
				action: "liked" | "unliked";
				likesCount: number;
			}>
		>(`/comments/${commentId}/react`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
