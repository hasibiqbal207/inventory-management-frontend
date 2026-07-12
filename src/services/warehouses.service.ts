import { http } from "@/lib/api-client";
import type { Warehouse, CreateWarehouseDTO, ListParams, PaginatedResponse, PaginationMeta } from "@/types/api";

const ALL_ITEMS_LIMIT = 1000;

export const warehousesService = {
    async getAll(filters?: { isActive?: boolean; type?: string }): Promise<Warehouse[]> {
        const params = new URLSearchParams();
        params.append("limit", String(ALL_ITEMS_LIMIT));
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.type) params.append("type", filters.type);

        const response = await http.get<{ data: { warehouses: Warehouse[] } }>(`/warehouses?${params.toString()}`);
        return response.data.warehouses;
    },

    async getPaginated(params: ListParams = {}): Promise<PaginatedResponse<Warehouse>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);

        const response = await http.get<{ data: { warehouses: Warehouse[]; pagination: PaginationMeta } }>(`/warehouses?${qs.toString()}`);
        return { data: response.data.warehouses, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Warehouse> {
        const response = await http.get<{ data: { warehouse: Warehouse } }>(`/warehouses/${id}`);
        return response.data.warehouse;
    },

    async create(data: CreateWarehouseDTO): Promise<Warehouse> {
        const response = await http.post<{ data: { warehouse: Warehouse } }>("/warehouses", data);
        return response.data.warehouse;
    },

    async update(id: string, data: Partial<CreateWarehouseDTO>): Promise<Warehouse> {
        const response = await http.put<{ data: { warehouse: Warehouse } }>(`/warehouses/${id}`, data);
        return response.data.warehouse;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/warehouses/${id}`);
    },
};
