import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { APIError, APIResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6002/api";

/**
 * Axios instance for API requests
 */
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Add authentication token
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle responses and errors
 */
apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response.data;
    },
    (error: AxiosError<APIError>) => {
        // Handle different error scenarios
        if (error.response) {
            const apiError = error.response.data;

            // Handle token expiration/invalidity
            // Only logout on specific authentication errors, not all 401s
            if (
                apiError?.error?.code === "TOKEN_EXPIRED" ||
                apiError?.error?.code === "TOKEN_INVALID" ||
                apiError?.error?.code === "INVALID_TOKEN" ||
                apiError?.error?.code === "NO_TOKEN"
            ) {
                console.warn("Authentication error detected:", apiError?.error?.code);
                // Clear token and redirect to login
                if (typeof window !== "undefined") {
                    localStorage.removeItem("auth_token");
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes("/login")) {
                        console.log("Redirecting to login due to auth error");
                        window.location.href = "/login";
                    }
                }
            } else if (error.response.status === 401) {
                // Log 401 errors that are NOT token-related for debugging
                console.warn("401 Unauthorized (non-token):", {
                    url: error.config?.url,
                    code: apiError?.error?.code,
                    message: apiError?.error?.message
                });
                // Don't logout - this might be a permission issue or other 401
            }

            // Return the API error
            return Promise.reject(apiError);
        } else if (error.request) {
            // Network error - no response received
            return Promise.reject({
                success: false,
                error: {
                    code: "NETWORK_ERROR",
                    message: "Unable to connect to the server. Please check your internet connection.",
                },
            });
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                error: {
                    code: "UNKNOWN_ERROR",
                    message: error.message || "An unexpected error occurred.",
                },
            });
        }
    }
);

/**
 * Helper function to handle API responses with type safety
 */
export async function apiRequest<T>(
    promise: Promise<APIResponse<T>>
): Promise<T> {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        throw error;
    }
}
