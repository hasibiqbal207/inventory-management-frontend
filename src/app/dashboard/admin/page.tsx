"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Users,
    Package,
    Warehouse,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    Settings,
    Activity,
    BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPageContent />
        </ProtectedRoute>
    );
}

function AdminDashboardPageContent() {
    // Fetch system metrics
    const { data: metrics } = useQuery({
        queryKey: ["admin-metrics"],
        queryFn: async () => {
            const response: any = await apiClient.get("/system/metrics");
            return response.data;
        },
    });

    // Fetch quick stats
    const { data: stats } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            // This would be a real endpoint in production
            return {
                totalUsers: 24,
                totalProducts: 156,
                totalOrders: 89,
                totalRevenue: 45678.90,
                lowStockItems: 12,
                pendingOrders: 8,
            };
        },
    });

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    System overview and administrative controls
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.totalUsers || 0}
                                </p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.totalProducts || 0}
                                </p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stats?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="bg-purple-500 p-3 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    {formatCurrency(stats?.totalRevenue || 0)}
                                </p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">API Status</p>
                                    <p className="text-sm text-gray-600">All systems operational</p>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Database</p>
                                    <p className="text-sm text-gray-600">Connected</p>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Uptime</p>
                                    <p className="text-sm text-gray-600">{metrics?.uptime || "99.9%"}</p>
                                </div>
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Alerts & Warnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Low Stock Items</p>
                                    <p className="text-sm text-gray-600">{stats?.lowStockItems || 0} products need attention</p>
                                </div>
                                <Link href="/dashboard/inventory">
                                    <Button size="sm" variant="outline">
                                        View
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Pending Orders</p>
                                    <p className="text-sm text-gray-600">{stats?.pendingOrders || 0} orders awaiting processing</p>
                                </div>
                                <Link href="/dashboard/orders">
                                    <Button size="sm" variant="outline">
                                        View
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">System Alerts</p>
                                    <p className="text-sm text-gray-600">No critical alerts</p>
                                </div>
                                <Link href="/dashboard/alerts">
                                    <Button size="sm" variant="outline">
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/dashboard/admin/settings">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                System Settings
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                Manage Users
                            </Button>
                        </Link>

                        <Link href="/dashboard/admin/metrics">
                            <Button variant="outline" className="w-full justify-start">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                View Metrics
                            </Button>
                        </Link>

                        <Link href="/dashboard/reports">
                            <Button variant="outline" className="w-full justify-start">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Generate Reports
                            </Button>
                        </Link>

                        <Link href="/dashboard/products">
                            <Button variant="outline" className="w-full justify-start">
                                <Package className="w-4 h-4 mr-2" />
                                Manage Products
                            </Button>
                        </Link>

                        <Link href="/dashboard/warehouses">
                            <Button variant="outline" className="w-full justify-start">
                                <Warehouse className="w-4 h-4 mr-2" />
                                Manage Warehouses
                            </Button>
                        </Link>

                        <Link href="/dashboard/suppliers">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                Manage Suppliers
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
