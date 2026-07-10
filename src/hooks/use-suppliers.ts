import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { suppliersService } from "@/services/suppliers.service";
import type { ListParams } from "@/types/api";

export function useSuppliers() {
    return useQuery({
        queryKey: ["suppliers"],
        queryFn: () => suppliersService.getAll(),
    });
}

/** Paginated suppliers with search — for the suppliers list page. */
export function useSuppliersPaginated(params: ListParams) {
    return useQuery({
        queryKey: ["suppliers", "paginated", params],
        queryFn: () => suppliersService.getPaginated(params),
        placeholderData: keepPreviousData,
    });
}

export function useSupplier(id: string) {
    return useQuery({
        queryKey: ["supplier", id],
        queryFn: () => suppliersService.getById(id),
        enabled: !!id,
    });
}
