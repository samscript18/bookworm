import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { API_URL } from "@/constants/env";
import { AxiosErrorShape } from "./axios-error";

export const publicApi: AxiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export const authApi: AxiosInstance = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	transformRequest: (data, headers) => {
		if (data instanceof FormData) {
			delete headers["Content-Type"];
			return data;
		}
		return data;
	},
});

authApi.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = useAuthStore.getState().accessToken;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error),
);

authApi.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<AxiosErrorShape>) => {
		const status = error.response?.status;

		if (status === 401 || status === 403) {
			useAuthStore.getState().logout();
			delete authApi.defaults.headers.common["Authorization"];
		}

		return Promise.reject(error);
	},
);
