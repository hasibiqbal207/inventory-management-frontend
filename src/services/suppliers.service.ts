import { apiClient } from "@/lib/api-client";
import type { Supplier, CreateSupplierDTO, APIResponse, ListParams, PaginatedResponse } from "@/types/api";

const ALL_ITEMS_LIMIT = 1000;

export const suppliersService = {
    async getAll(filters?: { isActive?: boolean; category?: string }): Promise<Supplier[]> {
        const params = new URLSearchParams();
        params.append("limit", String(ALL_ITEMS_LIMIT));
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.category) params.append("category", filters.category);

        const response: any = await apiClient.get(`/suppliers?${params.toString()}`);
        return response.data.suppliers;
    },

    async getPaginated(params: ListParams = {}): Promise<PaginatedResponse<Supplier>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);

        const response: any = await apiClient.get(`/suppliers?${qs.toString()}`);
        return { data: response.data.suppliers, pagination: response.data.pagination };
    },

    async getById(id: string): Promise<Supplier> {
        const response: any = await apiClient.get(`/suppliers/${id}`);
        return response.data.supplier;
    },

    async create(data: CreateSupplierDTO): Promise<Supplier> {
        const response: any = await apiClient.post("/suppliers", data);
        return response.data.supplier;
    },

    async update(id: string, data: Partial<CreateSupplierDTO>): Promise<Supplier> {
        const response: any = await apiClient.put(`/suppliers/${id}`, data);
        return response.data.supplier;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/suppliers/${id}`);
    },
};
