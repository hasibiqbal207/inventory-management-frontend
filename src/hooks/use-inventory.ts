import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import type { AddStockDTO, RemoveStockDTO } from "@/types/api";
import { toast } from "sonner";

/**
 * Get all inventory items
 */
export function useInventory() {
    return useQuery({
        queryKey: ["inventory"],
        queryFn: () => inventoryService.getAll(),
    });
}

/**
 * Get single inventory item by ID
 */
export function useInventoryItem(id: string) {
    return useQuery({
        queryKey: ["inventory", id],
        queryFn: () => inventoryService.getById(id),
        enabled: !!id,
    });
}

/**
 * Add stock to inventory
 */
export function useAddStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddStockDTO) => inventoryService.addStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Stock added successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to add stock");
        },
    });
}

/**
 * Remove stock from inventory
 */
export function useRemoveStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RemoveStockDTO) => inventoryService.removeStock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Stock removed successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to remove stock");
        },
    });
}

/**
 * Update inventory item
 */
export function useUpdateInventory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
            inventoryService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["inventory", variables.id] });
            toast.success("Inventory updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update inventory");
        },
    });
}
