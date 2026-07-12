import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
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
// Serialize concurrent refresh attempts so a burst of 401s triggers one refresh.
let refreshPromise: Promise<string | null> | null = null;
async function tryRefresh(): Promise<string | null> {
    const stored = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (!stored) return null;
    try {
        // Call the endpoint directly (bare axios) to avoid recursing through this
        // interceptor.
        const base = apiClient.defaults.baseURL || "";
        const res = await fetch(`${base}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: stored }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        const token = json?.data?.token;
        const newRefresh = json?.data?.refreshToken;
        if (token) localStorage.setItem("auth_token", token);
        if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
        return token ?? null;
    } catch {
        return null;
    }
}

apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response.data;
    },
    async (error: AxiosError<APIError>) => {
        // Handle different error scenarios
        if (error.response) {
            const apiError = error.response.data;
            const isTokenError =
                apiError?.error?.code === "TOKEN_EXPIRED" ||
                apiError?.error?.code === "TOKEN_INVALID" ||
                apiError?.error?.code === "INVALID_TOKEN" ||
                apiError?.error?.code === "NO_TOKEN";

            // On an expired access token, attempt a one-time transparent refresh
            // and retry the original request before giving up.
            const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
            if (isTokenError && original && !original._retried && typeof window !== "undefined") {
                original._retried = true;
                refreshPromise = refreshPromise ?? tryRefresh();
                const newToken = await refreshPromise;
                refreshPromise = null;
                if (newToken) {
                    original.headers = original.headers ?? {};
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(original);
                }
            }

            // Handle token expiration/invalidity
            // Only logout on specific authentication errors, not all 401s
            if (isTokenError) {
                console.warn("Authentication error detected:", apiError?.error?.code);
                // Clear token and redirect to login
                if (typeof window !== "undefined") {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("refresh_token");
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

/**
 * Typed HTTP helpers.
 *
 * The response interceptor above resolves each request to the raw API envelope
 * body (`response.data`) rather than the full AxiosResponse. Axios's own
 * generics don't model that unwrapping, so these thin wrappers restore type
 * safety: callers declare the envelope shape they expect (e.g.
 * `http.get<{ returns: ReturnRMA[] }>(...)`) and receive it without casting.
 */
export const http = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get(url, config) as unknown as Promise<T>,
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.post(url, data, config) as unknown as Promise<T>,
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.put(url, data, config) as unknown as Promise<T>,
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
        apiClient.patch(url, data, config) as unknown as Promise<T>,
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete(url, config) as unknown as Promise<T>,
};
