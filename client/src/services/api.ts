import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Optional request tracing / auth token attach point
    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ success?: boolean; error?: { code?: string; message?: string } }>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    const message =
      errorData?.error?.message ||
      error.message ||
      "An unexpected network or server error occurred";
    const code = errorData?.error?.code || "NETWORK_ERROR";

    console.error(`[API Response Error ${status || "UNKNOWN"}] [${code}]:`, message);

    return Promise.reject({
      status,
      code,
      message,
      originalError: error,
    });
  }
);

export default api;
