import { http } from "@/lib/api-client";
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    ImportResult,
    ListParams,
    PaginatedResponse,
    PaginationMeta,
} from "@/types/api";

// Dropdowns and other "give me everything" consumers request a high limit so a
// default page size never silently truncates a select list.
const ALL_ITEMS_LIMIT = 1000;

/**
 * Products Service
 * Handles all product-related API calls
 */
export const productsService = {
    /**
     * Get all products (unpaginated view for dropdowns / bulk consumers).
     */
    async getAll(): Promise<Product[]> {
        const response = await http.get<{ data: { products: Product[] } }>(`/products?limit=${ALL_ITEMS_LIMIT}`);
        return response.data.products;
    },

    /**
     * Get a page of products with optional search — for the list page.
     */
    async getPaginated(params: ListParams = {}): Promise<PaginatedResponse<Product>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);

        const response = await http.get<{ data: { products: Product[]; pagination: PaginationMeta } }>(`/products?${qs.toString()}`);
        return { data: response.data.products, pagination: response.data.pagination };
    },

    /**
     * Get product by ID
     */
    async getById(id: string): Promise<Product> {
        const response = await http.get<{ data: { product: Product } }>(`/products/${id}`);
        return response.data.product;
    },

    /**
     * Create new product (Admin only)
     */
    async create(data: CreateProductDTO): Promise<Product> {
        const response = await http.post<{ data: { product: Product } }>("/products", data);
        return response.data.product;
    },

    /**
     * Update product (Admin only)
     */
    async update(id: string, data: UpdateProductDTO): Promise<Product> {
        const response = await http.put<{ data: { product: Product } }>(`/products/${id}`, data);
        return response.data.product;
    },

    /**
     * Delete product (Admin only)
     */
    async delete(id: string): Promise<void> {
        await http.delete(`/products/${id}`);
    },

    /** Bulk activate/deactivate/delete a set of products. Returns count affected. */
    async bulkAction(ids: string[], action: "activate" | "deactivate" | "delete"): Promise<number> {
        const response = await http.post<{ data: { affected: number } }>("/products/bulk", { ids, action });
        return response.data.affected;
    },

    /**
     * Bulk-import products from parsed CSV rows. Returns a per-row summary.
     */
    async bulkImport(rows: Record<string, string>[]): Promise<ImportResult> {
        const response = await http.post<{ data: ImportResult }>("/products/import", { rows });
        return response.data;
    },

    /**
     * Fetch all products as export rows (template column order) for CSV download.
     */
    async exportRows(): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
        const response = await http.get<{ data: { columns: string[]; rows: Record<string, unknown>[] } }>("/products/export");
        return response.data;
    },

    /**
     * Fetch the import column template (header names).
     */
    async importTemplate(): Promise<string[]> {
        const response = await http.get<{ data: { columns: string[] } }>("/products/import/template");
        return response.data.columns;
    },
};
