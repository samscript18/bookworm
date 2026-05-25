import { ApiResponse, PaginationMeta } from "@/types/api";
import { authApi } from "../config/axios-instance";
import { AxiosErrorShape, errorHandler } from "../config/axios-error";
import { getBooksParams, uploadBookDto } from "@/types/book/book.dto";
import { Book, BookGenre } from "@/types/book/book";

export const uploadBook = async (data: uploadBookDto) => {
	try {
		const response = await authApi.post<ApiResponse<Book>>("/books/", data);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getAllBooks = async (params: getBooksParams) => {
	try {
		const response = await authApi.get<
			ApiResponse<{
				books: Book[];
				nextCursor: string | null;
			}>
		>("/books/", { params });

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getTrendingBooks = async () => {
	try {
		const response = await authApi.get<ApiResponse<Book[]>>("/books/trending");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getSavedBooks = async (userId?: string) => {
	try {
		const response = await authApi.get<ApiResponse<Book[]>>("/books/saved", userId ? { params: { userId } } : {});

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getBook = async (bookId: string) => {
	try {
		const response = await authApi.get<ApiResponse<Book>>(`/books/${bookId}`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const saveBook = async (bookId: string) => {
	try {
		const response = await authApi.post<ApiResponse<{ saved: boolean; savedBooksCount: number }>>(`/books/${bookId}/react`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const addBookToLibrary = async (bookId: string) => {
	try {
		const response = await authApi.post<ApiResponse<{ saved: boolean; savedBooksCount: number }>>(`/books/${bookId}/save`);

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getAllGenres = async () => {
	try {
		const response = await authApi.get<ApiResponse<BookGenre[], PaginationMeta>>("/books/genres/all");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};

export const getTrendingGenres = async () => {
	try {
		const response = await authApi.get<ApiResponse<BookGenre[]>>("/books/genres/trending");

		return response.data.data;
	} catch (error) {
		errorHandler(error as AxiosErrorShape | string);
		throw error;
	}
};
