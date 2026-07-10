import { apiClient } from "@/lib/api-client";
import type { CycleCount, SkuClassification } from "@/types/api";

export const cycleCountService = {
    async list(warehouseId?: string, status?: string): Promise<CycleCount[]> {
        const qs = new URLSearchParams();
        if (warehouseId) qs.append("warehouseId", warehouseId);
        if (status) qs.append("status", status);
        const response: any = await apiClient.get(`/cycle-counts?${qs.toString()}`);
        return response.data.sessions;
    },

    async get(id: string): Promise<CycleCount> {
        const response: any = await apiClient.get(`/cycle-counts/${id}`);
        return response.data.session;
    },

    async create(input: { warehouseId: string; productIds?: string[]; notes?: string }): Promise<CycleCount> {
        const response: any = await apiClient.post(`/cycle-counts`, input);
        return response.data.session;
    },

    async recordCount(id: string, productId: string, countedQuantity: number): Promise<CycleCount> {
        const response: any = await apiClient.post(`/cycle-counts/${id}/count`, { productId, countedQuantity });
        return response.data.session;
    },

    async complete(id: string): Promise<{ session: CycleCount; adjustments: number }> {
        const response: any = await apiClient.post(`/cycle-counts/${id}/complete`, {});
        return response.data;
    },

    async cancel(id: string): Promise<CycleCount> {
        const response: any = await apiClient.post(`/cycle-counts/${id}/cancel`, {});
        return response.data.session;
    },

    async classification(months = 12): Promise<SkuClassification[]> {
        const response: any = await apiClient.get(`/cycle-counts/classification?months=${months}`);
        return response.data.classification;
    },
};
