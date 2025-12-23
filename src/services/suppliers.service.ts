import { apiClient } from "@/lib/api-client";
import type { Supplier, CreateSupplierDTO, APIResponse } from "@/types/api";

export const suppliersService = {
    async getAll(filters?: { isActive?: boolean; category?: string }): Promise<Supplier[]> {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.category) params.append("category", filters.category);

        const response: any = await apiClient.get(`/suppliers?${params.toString()}`);
        return response.data.suppliers;
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
