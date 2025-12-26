import { InventoryRequest, CreateInventoryRequestDTO, RequestStatus, RequestType } from "@/types/api";
import { apiClient } from "@/lib/api-client";

export const inventoryRequestService = {
    getAllRequests: async (params?: { status?: RequestStatus; type?: RequestType }) => {
        const response: any = await apiClient.get("/inventory-requests", { params });
        return response.data.requests;
    },

    getRequestById: async (id: string) => {
        const response: any = await apiClient.get(`/inventory-requests/${id}`);
        return response.data.request;
    },

    createRequest: async (data: CreateInventoryRequestDTO) => {
        const response: any = await apiClient.post("/inventory-requests", data);
        return response.data.request;
    },

    approveRequest: async (id: string) => {
        const response: any = await apiClient.post(`/inventory-requests/${id}/approve`);
        return response.data.request;
    },

    rejectRequest: async (id: string, reason: string) => {
        const response: any = await apiClient.post(`/inventory-requests/${id}/reject`, { reason });
        return response.data.request;
    }
};
