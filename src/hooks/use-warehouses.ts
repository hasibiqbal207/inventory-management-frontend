import { useQuery } from "@tanstack/react-query";
import { warehousesService } from "@/services/warehouses.service";

export function useWarehouses(filters?: { isActive?: boolean; type?: string }) {
    return useQuery({
        queryKey: ["warehouses", filters],
        queryFn: () => warehousesService.getAll(filters),
    });
}

export function useWarehouse(id: string) {
    return useQuery({
        queryKey: ["warehouse", id],
        queryFn: () => warehousesService.getById(id),
        enabled: !!id,
    });
}
