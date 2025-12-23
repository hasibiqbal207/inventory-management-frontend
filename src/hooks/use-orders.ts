import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import type { CreateOrderDTO, OrderStatus } from "@/types/api";
import { toast } from "sonner";

/**
 * Get all orders with optional filters
 */
export function useOrders(filters?: { status?: OrderStatus; orderType?: "purchase" | "sales" }) {
    return useQuery({
        queryKey: ["orders", filters],
        queryFn: () => ordersService.getAll(filters),
    });
}

/**
 * Get single order by ID
 */
export function useOrder(id: string) {
    return useQuery({
        queryKey: ["orders", id],
        queryFn: () => ordersService.getById(id),
        enabled: !!id,
    });
}

/**
 * Create new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderDTO) => ordersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Order created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to create order");
        },
    });
}

/**
 * Update existing order
 */
export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateOrderDTO> }) =>
            ordersService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
            toast.success("Order updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update order");
        },
    });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            ordersService.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
            toast.success("Order status updated!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update status");
        },
    });
}

/**
 * Delete order
 */
export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ordersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to delete order");
        },
    });
}
