import { apiClient } from "@/lib/api-client";
import type { APIResponse } from "@/types/api";

export interface InventoryReport {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    byCategory: Array<{
        category: string;
        count: number;
        value: number;
    }>;
    byWarehouse: Array<{
        warehouseId: string;
        warehouseName: string;
        productCount: number;
        totalValue: number;
    }>;
}

export interface SalesReport {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
    }>;
    salesByPeriod: Array<{
        date: string;
        orders: number;
        revenue: number;
    }>;
}

export const reportsService = {
    async getInventoryReport(params?: { startDate?: string; endDate?: string }): Promise<InventoryReport> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);

        const response: any = await apiClient.get(`/reports/inventory?${queryParams.toString()}`);
        return response.data.report;
    },

    async getSalesReport(params?: { startDate?: string; endDate?: string }): Promise<SalesReport> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);

        const response: any = await apiClient.get(`/reports/sales?${queryParams.toString()}`);
        return response.data.report;
    },
};
