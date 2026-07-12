import { apiClient, http } from "@/lib/api-client";
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
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
        // Interceptor returns response.data, so response is APIResponse<{ user: User }>
        const response = await http.post<{ data: { user: User } }>(
            "/auth/register",
            data
        );
        return response.data.user;
    },

    /**
     * Login user. May return { mfaRequired: true } when the account has MFA on
     * and no code was supplied — the caller should re-submit with mfaToken.
     */
    async login(credentials: LoginCredentials & { mfaToken?: string }): Promise<AuthResponse & { mfaRequired?: boolean }> {
        const response = await http.post<{ data: AuthResponse & { refreshToken?: string; mfaRequired?: boolean } }>(
            "/auth/login",
            credentials
        );

        if (typeof window !== "undefined") {
            if (response.data.token) localStorage.setItem("auth_token", response.data.token);
            if (response.data.refreshToken) localStorage.setItem("refresh_token", response.data.refreshToken);
        }

        return response.data;
    },

    /**
     * Exchange the stored refresh token for a fresh access+refresh pair.
     * Returns the new access token, or null if refresh failed.
     */
    async refresh(): Promise<string | null> {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        if (!refreshToken) return null;
        try {
            const response = await http.post<{ data: { token: string; refreshToken: string } }>("/auth/refresh", { refreshToken });
            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", response.data.token);
                localStorage.setItem("refresh_token", response.data.refreshToken);
            }
            return response.data.token;
        } catch {
            this.clearAuth();
            return null;
        }
    },

    async forgotPassword(email: string): Promise<{ devResetToken?: string }> {
        const response = await http.post<{ data: { devResetToken?: string } }>("/auth/forgot-password", { email });
        return response.data;
    },

    async resetPassword(token: string, password: string): Promise<void> {
        await apiClient.post("/auth/reset-password", { token, password });
    },

    async setupMfa(): Promise<{ secret: string; otpauthUri: string }> {
        const response = await http.post<{ data: { secret: string; otpauthUri: string } }>("/auth/mfa/setup", {});
        return response.data;
    },

    async enableMfa(token: string): Promise<void> {
        await apiClient.post("/auth/mfa/enable", { token });
    },

    async disableMfa(token: string): Promise<void> {
        await apiClient.post("/auth/mfa/disable", { token });
    },

    /**
     * Fetch the currently authenticated user's profile.
     * Used to rehydrate session state on page load, since the JWT alone
     * doesn't carry the full user record.
     */
    async getCurrentUser(): Promise<User> {
        const response = await http.get<{ data: { user: User } }>("/auth/me");
        return response.data.user;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        try {
            // Send the refresh token so the server can actually revoke it.
            await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : {});
        } finally {
            this.clearAuth();
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
            localStorage.removeItem("refresh_token");
        }
    },
};
