"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";
import type { User, LoginCredentials, RegisterData } from "@/types/api";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials & { mfaToken?: string }) => Promise<{ mfaRequired: boolean }>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate the session on mount: a valid token alone doesn't carry the
    // full user record, so fetch it before treating the user as logged in.
    useEffect(() => {
        const token = authService.getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        authService
            .getCurrentUser()
            .then((fetchedUser) => setUser(fetchedUser))
            .catch(() => authService.clearAuth())
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (credentials: LoginCredentials & { mfaToken?: string }) => {
        setIsLoading(true);
        try {
            const result = await authService.login(credentials);
            // MFA-enabled account with no code yet: signal the caller to prompt.
            if (result.mfaRequired) {
                return { mfaRequired: true };
            }
            if (result.user) setUser(result.user);
            return { mfaRequired: false };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const user = await authService.register(data);
            // After registration, user needs to login
            // You might want to auto-login here
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
