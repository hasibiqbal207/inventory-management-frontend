import { apiClient } from "@/lib/api-client";
import type { ReturnRMA, CreateReturnDTO, ReturnStatus, ReturnType } from "@/types/api";

/**
 * Returns / RMA Service
 * Drives the return authorization workflow (create, approve, receive, etc.).
 */
export const returnsService = {
    async getAll(filters?: { status?: ReturnStatus; returnType?: ReturnType }): Promise<ReturnRMA[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.returnType) params.append("returnType", filters.returnType);
        const qs = params.toString();
        const response: any = await apiClient.get(`/returns${qs ? `?${qs}` : ""}`);
        return response.data.returns;
    },

    async getById(id: string): Promise<ReturnRMA> {
        const response: any = await apiClient.get(`/returns/${id}`);
        return response.data.return;
    },

    async create(data: CreateReturnDTO): Promise<ReturnRMA> {
        const response: any = await apiClient.post("/returns", data);
        return response.data.return;
    },

    async approve(id: string): Promise<ReturnRMA> {
        const response: any = await apiClient.patch(`/returns/${id}/approve`, {});
        return response.data.return;
    },

    async reject(id: string, reason: string): Promise<ReturnRMA> {
        const response: any = await apiClient.patch(`/returns/${id}/reject`, { reason });
        return response.data.return;
    },

    async cancel(id: string): Promise<ReturnRMA> {
        const response: any = await apiClient.patch(`/returns/${id}/cancel`, {});
        return response.data.return;
    },

    async receive(id: string): Promise<ReturnRMA> {
        const response: any = await apiClient.patch(`/returns/${id}/receive`, {});
        return response.data.return;
    },

    async complete(id: string): Promise<ReturnRMA> {
        const response: any = await apiClient.patch(`/returns/${id}/complete`, {});
        return response.data.return;
    },
};
