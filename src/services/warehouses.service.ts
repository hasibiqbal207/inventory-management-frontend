import { apiClient } from "@/lib/api-client";
import type { Warehouse, CreateWarehouseDTO, APIResponse, ListParams, PaginatedResponse } from "@/types/api";

const ALL_ITEMS_LIMIT = 1000;

export const warehousesService = {
    async getAll(filters?: { isActive?: boolean; type?: string }): Promise<Warehouse[]> {
        const params = new URLSearchParams();
        params.append("limit", String(ALL_ITEMS_LIMIT));
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.type) params.append("type", filters.type);

        const response: any = await apiClient.get(`/warehouses?${params.toString()}`);
        return response.data.warehouses;
    },

    async getPaginated(params: ListParams = {}): Promise<PaginatedResponse<Warehouse>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);

        const response: any = await apiClient.get(`/warehouses?${qs.toString()}`);
        return { data: response.data.warehouses, pagination: response.data.pagination };
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
