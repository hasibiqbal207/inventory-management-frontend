import { apiClient } from "@/lib/api-client";
import type { Buildability } from "@/types/api";

/**
 * Assembly / BOM service — buildable-quantity lookups and kit assembly.
 */
export const assemblyService = {
    async getBuildable(kitProductId: string, warehouseId: string): Promise<Buildability> {
        const qs = new URLSearchParams({ kitProductId, warehouseId });
        const response: any = await apiClient.get(`/assembly/buildable?${qs.toString()}`);
        return response.data;
    },

    async assemble(
        kitProductId: string,
        warehouseId: string,
        quantity: number,
        disassemble = false
    ): Promise<{ kitProductId: string; quantity: number; assembled: boolean }> {
        const response: any = await apiClient.post(`/assembly/assemble`, {
            kitProductId,
            warehouseId,
            quantity,
            disassemble,
        });
        return response.data;
    },
};
