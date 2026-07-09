import { apiClient } from "@/lib/api-client";
import type { Batch, FEFOAllocationPreview } from "@/types/api";

/**
 * Batch / Lot Service
 * Handles batch-tracking API calls (FEFO lots, expiry, allocation preview).
 */
export const batchesService = {
    /**
     * List batches for a product, optionally scoped to a warehouse. Active only
     * unless includeDepleted is set.
     */
    async getForProduct(
        productId: string,
        warehouseId?: string,
        includeDepleted = false
    ): Promise<Batch[]> {
        const params = new URLSearchParams({ productId });
        if (warehouseId) params.append("warehouseId", warehouseId);
        if (includeDepleted) params.append("includeDepleted", "true");

        const response: any = await apiClient.get(`/batches?${params.toString()}`);
        return response.data.batches;
    },

    /**
     * Batches expiring within `days` (default 30), optionally per warehouse.
     */
    async getExpiring(days = 30, warehouseId?: string): Promise<Batch[]> {
        const params = new URLSearchParams({ days: days.toString() });
        if (warehouseId) params.append("warehouseId", warehouseId);

        const response: any = await apiClient.get(`/batches/expiring?${params.toString()}`);
        return response.data.batches;
    },

    async getById(id: string): Promise<Batch> {
        const response: any = await apiClient.get(`/batches/${id}`);
        return response.data.batch;
    },

    /**
     * Preview which lots a FEFO removal would drain, without committing.
     */
    async previewAllocation(
        productId: string,
        warehouseId: string,
        quantity: number
    ): Promise<FEFOAllocationPreview> {
        const response: any = await apiClient.post("/batches/preview-allocation", {
            productId,
            warehouseId,
            quantity,
        });
        return response.data;
    },
};
