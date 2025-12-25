import { apiClient } from "@/lib/api-client";
import type {
    Inventory,
    AddStockDTO,
    RemoveStockDTO,
    APIResponse,
} from "@/types/api";

/**
 * Inventory Service
 * Handles all inventory-related API calls
 */
export const inventoryService = {
    /**
     * Get all inventory items
     */
    async getAll(): Promise<Inventory[]> {
        const response: any = await apiClient.get("/inventory");
        return response.data.inventory;
    },

    /**
     * Get inventory item by ID
     */
    async getById(id: string): Promise<Inventory> {
        const response: any = await apiClient.get(`/inventory/${id}`);
        return response.data.inventoryItem;
    },

    /**
     * Add stock to inventory
     */
    async addStock(data: AddStockDTO): Promise<Inventory> {
        const response: any = await apiClient.post("/inventory/add", data);
        return response.data.inventoryItem;
    },

    /**
     * Remove stock from inventory
     */
    async removeStock(data: RemoveStockDTO): Promise<Inventory> {
        const response: any = await apiClient.post("/inventory/remove", data);
        return response.data.inventoryItem;
    },

    /**
     * Update inventory item (Admin only)
     */
    async update(id: string, data: Partial<Inventory>): Promise<Inventory> {
        const response: any = await apiClient.put(`/inventory/${id}`, data);
        return response.data.inventoryItem;
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
    }): Promise<any> {
        const response: any = await apiClient.post("/inventory/transfer", data);
        return response.data;
    },
};
