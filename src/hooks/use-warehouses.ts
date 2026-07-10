import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { warehousesService } from "@/services/warehouses.service";
import type { ListParams } from "@/types/api";

export function useWarehouses(filters?: { isActive?: boolean; type?: string }) {
    return useQuery({
        queryKey: ["warehouses", filters],
        queryFn: () => warehousesService.getAll(filters),
    });
}

/** Paginated warehouses with search — for the warehouses list page. */
export function useWarehousesPaginated(params: ListParams) {
    return useQuery({
        queryKey: ["warehouses", "paginated", params],
        queryFn: () => warehousesService.getPaginated(params),
        placeholderData: keepPreviousData,
    });
}

export function useWarehouse(id: string) {
    return useQuery({
        queryKey: ["warehouse", id],
        queryFn: () => warehousesService.getById(id),
        enabled: !!id,
    });
}
