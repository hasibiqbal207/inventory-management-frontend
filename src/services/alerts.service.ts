import { apiClient } from "@/lib/api-client";
import type { Alert, APIResponse } from "@/types/api";

export const alertsService = {
    async getAll(filters?: { type?: string; status?: string }): Promise<Alert[]> {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);

        const response: any = await apiClient.get(`/alerts?${params.toString()}`);
        return response.data.alerts;
    },

    async getById(id: string): Promise<Alert> {
        const response: any = await apiClient.get(`/alerts/${id}`);
        return response.data.alert;
    },

    async acknowledge(id: string): Promise<Alert> {
        const response: any = await apiClient.put(`/alerts/${id}/acknowledge`);
        return response.data.alert;
    },

    async resolve(id: string): Promise<Alert> {
        const response: any = await apiClient.put(`/alerts/${id}/resolve`);
        return response.data.alert;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/alerts/${id}`);
    },
};
