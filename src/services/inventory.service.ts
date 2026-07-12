import { http } from "@/lib/api-client";
import type {
    Inventory,
    AddStockDTO,
    RemoveStockDTO,
} from "@/types/api";

/**
 * Inventory Service
 * Handles all inventory-related API calls
 */
export const inventoryService = {
    /**
     * Get all inventory items with pagination and filtering
     */
    async getAll(page: number = 1, limit: number = 20, warehouseId?: string): Promise<{ inventory: Inventory[]; total: number; page: number; totalPages: number }> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (warehouseId) {
            params.append('warehouseId', warehouseId);
        }

        const response = await http.get<{ data: { inventory: Inventory[]; total: number; page: number; totalPages: number } }>(`/inventory?${params.toString()}`);
        return response.data;
    },

    /**
     * Get inventory item by ID
     */
    async getById(id: string): Promise<Inventory> {
        const response = await http.get<{ data: { inventory: Inventory } }>(`/inventory/${id}`);
        return response.data.inventory;
    },

    /**
     * Add stock to inventory
     */
    async addStock(data: AddStockDTO): Promise<Inventory> {
        const response = await http.post<{ data: { inventory: Inventory } }>("/inventory/add", data);
        return response.data.inventory;
    },

    /**
     * Remove stock from inventory
     */
    async removeStock(data: RemoveStockDTO): Promise<Inventory> {
        const response = await http.post<{ data: { inventory: Inventory } }>("/inventory/remove", data);
        return response.data.inventory;
    },

    /**
     * Update inventory item (Admin only)
     */
    async update(id: string, data: Partial<Inventory>): Promise<Inventory> {
        const response = await http.put<{ data: { inventory: Inventory } }>(`/inventory/${id}`, data);
        return response.data.inventory;
    },

    /**
     * Transfer stock between warehouses
     */
    async transferStock(data: {
        productId: string;
        fromWarehouseId: string;
        toWarehouseId: string;
        quantity: number;
        reason: string;
    }): Promise<unknown> {
        const response = await http.post<{ data: unknown }>("/inventory/transfer", data);
        return response.data;
    },

    /**
     * Scan-first lookup: resolve a product by barcode/SKU and its on-hand at a
     * warehouse. Used by the mobile warehouse flow.
     */
    async scan(code: string, warehouseId?: string): Promise<{
        product: { _id: string; productName: string; sku: string; barcode?: string; category: string };
        quantity: number | null;
    }> {
        const qs = new URLSearchParams({ code });
        if (warehouseId) qs.append("warehouseId", warehouseId);
        const response = await http.get<{ data: {
            product: { _id: string; productName: string; sku: string; barcode?: string; category: string };
            quantity: number | null;
        } }>(`/inventory/scan?${qs.toString()}`);
        return response.data;
    },
};
