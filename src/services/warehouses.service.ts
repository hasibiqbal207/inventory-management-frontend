import { apiClient } from "@/lib/api-client";
import type { Warehouse, CreateWarehouseDTO, APIResponse } from "@/types/api";

export const warehousesService = {
    async getAll(filters?: { isActive?: boolean; type?: string }): Promise<Warehouse[]> {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.type) params.append("type", filters.type);

        const response: any = await apiClient.get(`/warehouses?${params.toString()}`);
        return response.data.warehouses;
    },

    async getById(id: string): Promise<Warehouse> {
        const response: any = await apiClient.get(`/warehouses/${id}`);
        return response.data.warehouse;
    },

    async create(data: CreateWarehouseDTO): Promise<Warehouse> {
        const response: any = await apiClient.post("/warehouses", data);
        return response.data.warehouse;
    },

    async update(id: string, data: Partial<CreateWarehouseDTO>): Promise<Warehouse> {
        const response: any = await apiClient.put(`/warehouses/${id}`, data);
        return response.data.warehouse;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/warehouses/${id}`);
    },
};
