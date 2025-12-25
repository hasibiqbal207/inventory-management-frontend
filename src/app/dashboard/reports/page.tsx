"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Package, DollarSign, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { useAuth } from "@/contexts/auth-context";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ReportsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"]}>
            <ReportsPageContent />
        </ProtectedRoute>
    );
}

function ReportsPageContent() {
    const { user } = useAuth();
    const [reportType, setReportType] = useState<"inventory" | "sales" | "suppliers">("inventory");

    const canSeeInventory = user?.role === "admin" || user?.role === "inventory_manager" || user?.role === "warehouse_supervisor" || user?.role === "auditor" || user?.role === "executive";
    const canSeeSales = user?.role === "admin" || user?.role === "sales_rep" || user?.role === "finance_officer" || user?.role === "executive";
    const canSeeSuppliers = user?.role === "admin" || user?.role === "procurement_officer" || user?.role === "finance_officer" || user?.role === "executive";

    const { data: inventoryReport, isLoading: inventoryLoading } = useQuery({
        queryKey: ["reports", "inventory"],
        queryFn: () => reportsService.getInventoryReport(),
        enabled: reportType === "inventory",
    });

    const { data: salesReport, isLoading: salesLoading } = useQuery({
        queryKey: ["reports", "sales"],
        queryFn: () => reportsService.getSalesReport(),
        enabled: reportType === "sales",
    });

    const { data: supplierReport, isLoading: supplierLoading } = useQuery({
        queryKey: ["reports", "suppliers"],
        queryFn: () => reportsService.getSupplierReport(),
        enabled: reportType === "suppliers",
    });

    const isLoading = inventoryLoading || salesLoading || supplierLoading;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">View insights and performance metrics</p>
                </div>
                <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Report Type Selector */}
            <div className="flex gap-2 mb-6">
                {canSeeInventory && (
                    <Button
                        variant={reportType === "inventory" ? "default" : "outline"}
                        onClick={() => setReportType("inventory")}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Inventory Report
                    </Button>
                )}
                {canSeeSales && (
                    <Button
                        variant={reportType === "sales" ? "default" : "outline"}
                        onClick={() => setReportType("sales")}
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Sales Report
                    </Button>
                )}
                {canSeeSuppliers && (
                    <Button
                        variant={reportType === "suppliers" ? "default" : "outline"}
                        onClick={() => setReportType("suppliers")}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Supplier Performance
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : reportType === "inventory" && inventoryReport ? (
                <div className="space-y-6">
                    {/* Inventory Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {inventoryReport.totalProducts}
                                        </p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatCurrency(inventoryReport.totalValue)}
                                        </p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                                            {inventoryReport.lowStockItems}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">
                                            {inventoryReport.outOfStockItems}
                                        </p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* By Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {inventoryReport.byCategory?.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{cat.category}</p>
                                            <p className="text-sm text-gray-600">{cat.count} products</p>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatCurrency(cat.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : reportType === "sales" && salesReport ? (
                <div className="space-y-6">
                    {/* Sales Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {salesReport.totalOrders}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600 mt-2">
                                        {formatCurrency(salesReport.totalRevenue)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-2">
                                        {formatCurrency(salesReport.averageOrderValue)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {salesReport.topProducts?.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{product.productName}</p>
                                            <p className="text-sm text-gray-600">{product.quantitySold} units sold</p>
                                        </div>
                                        <p className="text-lg font-semibold text-green-600">
                                            {formatCurrency(product.revenue)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : reportType === "suppliers" && supplierReport ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Reliability & Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Orders</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Value</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg. Fulfillment</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Reliability</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierReport.map((s: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">{s.companyName}</td>
                                                <td className="py-3 px-4 text-right">{s.totalOrders}</td>
                                                <td className="py-3 px-4 text-right font-semibold text-green-600">
                                                    {formatCurrency(s.totalValue)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {s.avgFulfillmentDays ? `${s.avgFulfillmentDays.toFixed(1)} days` : "N/A"}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-sm font-bold ${s.reliability > 90 ? 'text-green-600' : s.reliability > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                            {s.reliability.toFixed(1)}%
                                                        </span>
                                                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                            <div
                                                                className={`h-full ${s.reliability > 90 ? 'bg-green-500' : s.reliability > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${s.reliability}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
