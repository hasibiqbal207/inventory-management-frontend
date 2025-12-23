import { apiClient } from "@/lib/api-client";
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    APIResponse,
} from "@/types/api";

/**
 * Products Service
 * Handles all product-related API calls
 */
export const productsService = {
    /**
     * Get all products
     */
    async getAll(): Promise<Product[]> {
        const response: any = await apiClient.get("/products");
        return response.data.products;
    },

    /**
     * Get product by ID
     */
    async getById(id: string): Promise<Product> {
        const response: any = await apiClient.get(`/products/${id}`);
        return response.data.product;
    },

    /**
     * Create new product (Admin only)
     */
    async create(data: CreateProductDTO): Promise<Product> {
        const response: any = await apiClient.post("/products", data);
        return response.data.product;
    },

    /**
     * Update product (Admin only)
     */
    async update(id: string, data: UpdateProductDTO): Promise<Product> {
        const response: any = await apiClient.put(`/products/${id}`, data);
        return response.data.product;
    },

    /**
     * Delete product (Admin only)
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/products/${id}`);
    },
};
