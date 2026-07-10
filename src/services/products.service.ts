import { apiClient } from "@/lib/api-client";
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    APIResponse,
    ImportResult,
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

    /**
     * Bulk-import products from parsed CSV rows. Returns a per-row summary.
     */
    async bulkImport(rows: Record<string, string>[]): Promise<ImportResult> {
        const response: any = await apiClient.post("/products/import", { rows });
        return response.data;
    },

    /**
     * Fetch all products as export rows (template column order) for CSV download.
     */
    async exportRows(): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
        const response: any = await apiClient.get("/products/export");
        return response.data;
    },

    /**
     * Fetch the import column template (header names).
     */
    async importTemplate(): Promise<string[]> {
        const response: any = await apiClient.get("/products/import/template");
        return response.data.columns;
    },
};
