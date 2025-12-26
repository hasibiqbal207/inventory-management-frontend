"use client";

import { Package, Warehouse, ShoppingCart, Bell, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { formatRole } from "@/lib/format";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ModuleGuideCard } from "@/components/dashboard/module-guide-card";
import { getModuleGuidesByRole } from "@/config/module-guides";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardPageContent />
        </ProtectedRoute>
    );
}

function DashboardPageContent() {
    const { user } = useAuth();

    // Fetch dashboard stats
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const response: any = await apiClient.get("/system/dashboard-stats");
            return response.data;
        },
    });

    const statCards = [
        {
            name: "Total Products",
            value: stats?.totalProducts || 0,
            icon: Package,
            color: "bg-blue-500",
        },
        {
            name: "Warehouses",
            value: stats?.totalWarehouses || 0,
            icon: Warehouse,
            color: "bg-green-500",
        },
        {
            name: "Pending Orders",
            value: stats?.pendingOrders || 0,
            icon: ShoppingCart,
            color: "bg-yellow-500",
        },
        {
            name: "Active Alerts",
            value: stats?.activeAlerts || 0,
            icon: Bell,
            color: "bg-red-500",
        },
    ];

    // Get role-based module guides
    const moduleGuides = user ? getModuleGuidesByRole(user.role) : [];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here's an overview of your inventory system
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-card rounded-lg shadow p-6 border border-border hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {isLoading ? (
                                        <span className="inline-block h-9 w-16 bg-gray-200 animate-pulse rounded"></span>
                                    ) : (
                                        stat.value
                                    )}
                                </p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role-Based Module Guides */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Your Module Guides
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Quick access to features available for your role: <span className="font-semibold">{user?.role && formatRole(user.role)}</span>
                        </p>
                    </div>
                </div>

                {moduleGuides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {moduleGuides.map((guide) => (
                            <ModuleGuideCard key={guide.id} guide={guide} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-card rounded-lg shadow p-8 border border-border text-center">
                        <p className="text-muted-foreground">
                            No module guides available for your role. Please contact your administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
