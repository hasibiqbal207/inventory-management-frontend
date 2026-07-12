import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "./protected-route";
import { useAuth } from "@/contexts/auth-context";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/contexts/auth-context", () => ({
    useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows a loading state and renders nothing else while auth is resolving", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: true,
        } as ReturnType<typeof useAuth>);

        render(
            <ProtectedRoute>
                <div>secret content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to /login and renders nothing when not authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <ProtectedRoute>
                <div>secret content</div>
            </ProtectedRoute>
        );

        expect(pushMock).toHaveBeenCalledWith("/login");
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });

    it("redirects to /dashboard and renders nothing when the role is not allowed", () => {
        mockUseAuth.mockReturnValue({
            user: { role: "warehouse_staff" },
            isAuthenticated: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <ProtectedRoute allowedRoles={["admin", "inventory_manager"]}>
                <div>secret content</div>
            </ProtectedRoute>
        );

        expect(pushMock).toHaveBeenCalledWith("/dashboard");
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });

    it("renders children when authenticated and the role is allowed", () => {
        mockUseAuth.mockReturnValue({
            user: { role: "admin" },
            isAuthenticated: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <ProtectedRoute allowedRoles={["admin", "inventory_manager"]}>
                <div>secret content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("secret content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("renders children when authenticated and no role restriction is set", () => {
        mockUseAuth.mockReturnValue({
            user: { role: "auditor" },
            isAuthenticated: true,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <ProtectedRoute>
                <div>secret content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText("secret content")).toBeInTheDocument();
    });
});
