import { http } from "@/lib/api-client";

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

export interface SupplierReportRow {
    companyName: string;
    totalOrders: number;
    totalValue: number;
    avgFulfillmentDays?: number;
    reliability: number;
}

export interface DamageReportRow {
    date: string;
    productName: string;
    sku: string;
    warehouseName: string;
    quantity: number;
    value: number;
    reference: string;
}

export const reportsService = {
    async getInventoryReport(params?: { startDate?: string; endDate?: string }): Promise<InventoryReport> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);

        const response = await http.get<{ data: { report: InventoryReport } }>(`/reports/inventory?${queryParams.toString()}`);
        return response.data.report;
    },

    async getSalesReport(params?: { startDate?: string; endDate?: string }): Promise<SalesReport> {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);

        const response = await http.get<{ data: { report: SalesReport } }>(`/reports/sales?${queryParams.toString()}`);
        return response.data.report;
    },

    async getSupplierReport(): Promise<SupplierReportRow[]> {
        const response = await http.get<{ data: { report: SupplierReportRow[] } }>("/reports/suppliers");
        return response.data.report;
    },
    async getDamageReport(): Promise<DamageReportRow[]> {
        const response = await http.get<{ data: { report: DamageReportRow[] } }>("/reports/damage");
        return response.data.report;
    },
};
