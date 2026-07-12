import { http } from "@/lib/api-client";
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from "@/types/api";

export const categoriesService = {
    async getAll(isActive?: boolean): Promise<Category[]> {
        const params = new URLSearchParams();
        if (isActive !== undefined) params.append("isActive", String(isActive));
        const response = await http.get<{ data: { categories: Category[] } }>(`/categories?${params.toString()}`);
        return response.data.categories;
    },

    async getById(id: string): Promise<Category> {
        const response = await http.get<{ data: { category: Category } }>(`/categories/${id}`);
        return response.data.category;
    },

    async create(data: CreateCategoryDTO): Promise<Category> {
        const response = await http.post<{ data: { category: Category } }>("/categories", data);
        return response.data.category;
    },

    async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
        const response = await http.put<{ data: { category: Category } }>(`/categories/${id}`, data);
        return response.data.category;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/categories/${id}`);
    },
};
