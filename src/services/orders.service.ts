import { apiClient } from "@/lib/api-client";
import type {
    Order,
    CreateOrderDTO,
    APIResponse,
    OrderStatus,
} from "@/types/api";

/**
 * Orders Service
 * Handles all order-related API calls
 */
export const ordersService = {
    /**
     * Get all orders with optional filters
     */
    async getAll(filters?: { status?: OrderStatus; orderType?: "purchase" | "sales" }): Promise<Order[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.orderType) params.append("orderType", filters.orderType);

        const response: any = await apiClient.get(`/orders?${params.toString()}`);
        return response.data.orders;
    },

    /**
     * Get order by ID
     */
    async getById(id: string): Promise<Order> {
        const response: any = await apiClient.get(`/orders/${id}`);
        return response.data.order;
    },

    /**
     * Create new order
     */
    async create(data: CreateOrderDTO): Promise<Order> {
        const response: any = await apiClient.post("/orders", data);
        return response.data.order;
    },

    /**
     * Update order
     */
    async update(id: string, data: Partial<CreateOrderDTO>): Promise<Order> {
        const response: any = await apiClient.put(`/orders/${id}`, data);
        return response.data.order;
    },

    /**
     * Update order status
     */
    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const response: any = await apiClient.put(`/orders/${id}`, { status });
        return response.data.order;
    },

    /**
     * Delete/Cancel order (Admin only)
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/orders/${id}`);
    },
};
