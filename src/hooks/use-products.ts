import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { CreateProductDTO, UpdateProductDTO } from "@/types/api";
import { toast } from "sonner";

/**
 * Get all products
 */
export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: () => productsService.getAll(),
    });
}

/**
 * Get single product by ID
 */
export function useProduct(id: string) {
    return useQuery({
        queryKey: ["products", id],
        queryFn: () => productsService.getById(id),
        enabled: !!id,
    });
}

/**
 * Create new product
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductDTO) => productsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to create product");
        },
    });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductDTO }) =>
            productsService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
            toast.success("Product updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update product");
        },
    });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to delete product");
        },
    });
}
