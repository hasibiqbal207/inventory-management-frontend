"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Package, DollarSign, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
    const [reportType, setReportType] = useState<"inventory" | "sales">("inventory");

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

    const isLoading = inventoryLoading || salesLoading;

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
                <Button
                    variant={reportType === "inventory" ? "default" : "outline"}
                    onClick={() => setReportType("inventory")}
                >
                    <Package className="w-4 h-4 mr-2" />
                    Inventory Report
                </Button>
                <Button
                    variant={reportType === "sales" ? "default" : "outline"}
                    onClick={() => setReportType("sales")}
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Sales Report
                </Button>
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
            ) : null}
        </div>
    );
}
