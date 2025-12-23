"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    Bell,
    BarChart3,
    Settings,
    LogOut,
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </ProtectedRoute>
    );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Products", href: "/dashboard/products", icon: Package },
        { name: "Inventory", href: "/dashboard/inventory", icon: Warehouse },
        { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
        { name: "Suppliers", href: "/dashboard/suppliers", icon: Users },
        { name: "Warehouses", href: "/dashboard/warehouses", icon: Warehouse },
        { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ];

    const adminNavigation = [
        { name: "Admin Dashboard", href: "/dashboard/admin", icon: BarChart3 },
        { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
        { name: "Metrics", href: "/dashboard/admin/metrics", icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">IMS</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}

                        {/* Admin Section */}
                        {user?.role === "admin" && (
                            <>
                                <div className="pt-6 mt-6 border-t border-gray-200">
                                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Admin
                                    </p>
                                </div>
                                {adminNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                ))}
                            </>
                        )}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    {user?.firstName?.[0]}
                                    {user?.lastName?.[0]}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-64">
                <main className="py-8 px-8">{children}</main>
            </div>
        </div>
    );
}
