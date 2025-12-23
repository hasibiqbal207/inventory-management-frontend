import { apiClient } from "@/lib/api-client";
import type { Alert, APIResponse } from "@/types/api";

export const alertsService = {
    async getAll(filters?: { type?: string; isRead?: boolean }): Promise<Alert[]> {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.isRead !== undefined) params.append("isRead", String(filters.isRead));

        const response: any = await apiClient.get(`/alerts?${params.toString()}`);
        return response.data.alerts;
    },

    async getById(id: string): Promise<Alert> {
        const response: any = await apiClient.get(`/alerts/${id}`);
        return response.data.alert;
    },

    async markAsRead(id: string): Promise<Alert> {
        const response: any = await apiClient.put(`/alerts/${id}/read`);
        return response.data.alert;
    },

    async markAllAsRead(): Promise<void> {
        await apiClient.put("/alerts/read-all");
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/alerts/${id}`);
    },
};
