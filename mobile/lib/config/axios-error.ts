import { toast } from "../utils/toast";

export type AxiosErrorShape = {
	response?: {
		data?: {
			message?: string;
			error?: string;
		};
	};
	message?: string;
};

export function errorHandler<T = AxiosErrorShape | string>(error: AxiosErrorShape | string): T {
	const extractedError = typeof error === "object" && "response" in error ? error.response?.data?.message || error.response?.data?.error || error.message : error;

	toast.error(String(extractedError) || "An unknown error occurred");
	return extractedError as T;
}
