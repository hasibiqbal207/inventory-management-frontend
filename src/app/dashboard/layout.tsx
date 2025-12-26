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
        { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "procurement_officer", "sales_rep", "finance_officer", "auditor", "it_support", "executive"] },
        { name: "Products", href: "/dashboard/products", icon: Package, roles: ["admin", "inventory_manager", "procurement_officer", "sales_rep", "auditor", "executive"] },
        { name: "Inventory", href: "/dashboard/inventory", icon: Warehouse, roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "auditor", "executive"] },
        { name: "Requests", href: "/dashboard/inventory/requests", icon: Bell, roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"] },
        { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart, roles: ["admin", "inventory_manager", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"] },
        { name: "Suppliers", href: "/dashboard/suppliers", icon: Users, roles: ["admin", "inventory_manager", "procurement_officer", "auditor", "executive"] },
        { name: "Warehouses", href: "/dashboard/warehouses", icon: Warehouse, roles: ["admin", "inventory_manager", "warehouse_supervisor", "auditor", "executive"] },
        { name: "Alerts", href: "/dashboard/alerts", icon: Bell, roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"] },
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["admin", "inventory_manager", "warehouse_supervisor", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"] },
    ];

    const adminNavigation = [
        { name: "Admin Dashboard", href: "/dashboard/admin", icon: BarChart3, roles: ["admin"] },
        { name: "Users", href: "/dashboard/admin/users", icon: Users, roles: ["admin"] },
        { name: "Settings", href: "/dashboard/admin/settings", icon: Settings, roles: ["admin", "it_support"] },
        { name: "Metrics", href: "/dashboard/admin/metrics", icon: BarChart3, roles: ["admin", "it_support"] },
    ];

    const filteredNavigation = navigation.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    const filteredAdminNavigation = adminNavigation.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-border">
                        <h1 className="text-xl font-bold text-foreground">IMS</h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {filteredNavigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}

                        {/* Admin Section */}
                        {filteredAdminNavigation.length > 0 && (
                            <>
                                <div className="pt-6 mt-6 border-t border-border">
                                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Admin
                                    </p>
                                </div>
                                {filteredAdminNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        {item.name}
                                    </Link>
                                ))}
                            </>
                        )}
                    </nav>


                    {/* User Profile */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center mb-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                    {user?.firstName?.[0]}
                                    {user?.lastName?.[0]}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-foreground">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
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
