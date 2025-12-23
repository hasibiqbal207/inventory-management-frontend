import { apiClient } from "@/lib/api-client";
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    APIResponse,
} from "@/types/api";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<User> {
        const response: any = await apiClient.post(
            "/auth/register",
            data
        );
        // Interceptor returns response.data, so response is APIResponse<{ user: User }>
        return response.data.user;
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response: any = await apiClient.post(
            "/auth/login",
            credentials
        );

        // Interceptor returns response.data, so response is APIResponse<AuthResponse>
        // Store token in localStorage
        if (typeof window !== "undefined" && response.data.token) {
            localStorage.setItem("auth_token", response.data.token);
        }

        return response.data;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post("/auth/logout");
        } finally {
            // Always clear token, even if API call fails
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
            }
        }
    },

    /**
     * Get stored authentication token
     */
    getToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem("auth_token");
        }
        return null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    /**
     * Clear authentication data
     */
    clearAuth(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
        }
    },
};
