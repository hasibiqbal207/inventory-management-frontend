import { useQuery } from "@tanstack/react-query";
import { batchesService } from "@/services/batches.service";

/**
 * Batches for a product (optionally per warehouse). Disabled until a productId
 * is supplied.
 */
export function useProductBatches(productId?: string, warehouseId?: string, includeDepleted = false) {
    return useQuery({
        queryKey: ["batches", productId, warehouseId, includeDepleted],
        queryFn: () => batchesService.getForProduct(productId!, warehouseId, includeDepleted),
        enabled: !!productId,
    });
}

/**
 * Batches expiring within the given window (days).
 */
export function useExpiringBatches(days = 30, warehouseId?: string) {
    return useQuery({
        queryKey: ["batches", "expiring", days, warehouseId],
        queryFn: () => batchesService.getExpiring(days, warehouseId),
    });
}
