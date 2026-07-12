import { InventoryRequest, CreateInventoryRequestDTO, RequestStatus, RequestType } from "@/types/api";
import { http } from "@/lib/api-client";

export const inventoryRequestService = {
    getAllRequests: async (params?: { status?: RequestStatus; type?: RequestType }): Promise<InventoryRequest[]> => {
        const response = await http.get<{ data: { requests: InventoryRequest[] } }>("/inventory-requests", { params });
        return response.data.requests;
    },

    getRequestById: async (id: string): Promise<InventoryRequest> => {
        const response = await http.get<{ data: { request: InventoryRequest } }>(`/inventory-requests/${id}`);
        return response.data.request;
    },

    createRequest: async (data: CreateInventoryRequestDTO): Promise<InventoryRequest> => {
        const response = await http.post<{ data: { request: InventoryRequest } }>("/inventory-requests", data);
        return response.data.request;
    },

    approveRequest: async (id: string): Promise<InventoryRequest> => {
        const response = await http.post<{ data: { request: InventoryRequest } }>(`/inventory-requests/${id}/approve`);
        return response.data.request;
    },

    rejectRequest: async (id: string, reason: string): Promise<InventoryRequest> => {
        const response = await http.post<{ data: { request: InventoryRequest } }>(`/inventory-requests/${id}/reject`, { reason });
        return response.data.request;
    }
};
