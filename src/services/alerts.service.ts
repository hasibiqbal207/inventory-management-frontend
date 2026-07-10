import { apiClient } from "@/lib/api-client";
import type { Alert, APIResponse, ListParams, PaginatedResponse } from "@/types/api";

const ALL_ITEMS_LIMIT = 1000;

interface AlertListFilters {
    type?: string;
    status?: string;
    severity?: string;
}

export const alertsService = {
    async getAll(filters?: AlertListFilters): Promise<Alert[]> {
        const params = new URLSearchParams();
        params.append("limit", String(ALL_ITEMS_LIMIT));
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.severity) params.append("severity", filters.severity);

        const response: any = await apiClient.get(`/alerts?${params.toString()}`);
        return response.data.alerts;
    },

    async getPaginated(params: ListParams & AlertListFilters = {}): Promise<PaginatedResponse<Alert>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);
        if (params.type) qs.append("type", params.type);
        if (params.status) qs.append("status", params.status);
        if (params.severity) qs.append("severity", params.severity);

        const response: any = await apiClient.get(`/alerts?${qs.toString()}`);
        return { data: response.data.alerts, pagination: response.data.pagination };
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
