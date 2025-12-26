import { useQuery } from "@tanstack/react-query";
import { suppliersService } from "@/services/suppliers.service";

export function useSuppliers() {
    return useQuery({
        queryKey: ["suppliers"],
        queryFn: () => suppliersService.getAll(),
    });
}

export function useSupplier(id: string) {
    return useQuery({
        queryKey: ["supplier", id],
        queryFn: () => suppliersService.getById(id),
        enabled: !!id,
    });
}
