import { http } from "@/lib/api-client";
import type {
    Order,
    CreateOrderDTO,
    OrderStatus,
    ListParams,
    PaginatedResponse,
    PaginationMeta,
} from "@/types/api";

const ALL_ITEMS_LIMIT = 1000;

interface OrderListFilters {
    status?: OrderStatus;
    orderType?: "purchase" | "sales";
}

/**
 * Orders Service
 * Handles all order-related API calls
 */
export const ordersService = {
    /**
     * Get all orders with optional filters (unpaginated).
     */
    async getAll(filters?: OrderListFilters): Promise<Order[]> {
        const params = new URLSearchParams();
        params.append("limit", String(ALL_ITEMS_LIMIT));
        if (filters?.status) params.append("status", filters.status);
        if (filters?.orderType) params.append("orderType", filters.orderType);

        const response = await http.get<{ data: { orders: Order[] } }>(`/orders?${params.toString()}`);
        return response.data.orders;
    },

    /**
     * Get a page of orders with filters + search — for the orders list page.
     */
    async getPaginated(params: ListParams & OrderListFilters = {}): Promise<PaginatedResponse<Order>> {
        const qs = new URLSearchParams();
        qs.append("page", String(params.page ?? 1));
        qs.append("limit", String(params.limit ?? 20));
        if (params.search) qs.append("search", params.search);
        if (params.status) qs.append("status", params.status);
        if (params.orderType) qs.append("orderType", params.orderType);

        const response = await http.get<{ data: { orders: Order[]; pagination: PaginationMeta } }>(`/orders?${qs.toString()}`);
        return { data: response.data.orders, pagination: response.data.pagination };
    },

    /**
     * Get order by ID
     */
    async getById(id: string): Promise<Order> {
        const response = await http.get<{ data: { order: Order } }>(`/orders/${id}`);
        return response.data.order;
    },

    /**
     * Create new order
     */
    async create(data: CreateOrderDTO): Promise<Order> {
        const response = await http.post<{ data: { order: Order } }>("/orders", data);
        return response.data.order;
    },

    /**
     * Update order
     */
    async update(id: string, data: Partial<CreateOrderDTO>): Promise<Order> {
        const response = await http.put<{ data: { order: Order } }>(`/orders/${id}`, data);
        return response.data.order;
    },

    /**
     * Update order status
     */
    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const response = await http.put<{ data: { order: Order } }>(`/orders/${id}`, { status });
        return response.data.order;
    },

    /**
     * Delete/Cancel order (Admin only)
     */
    async delete(id: string): Promise<void> {
        await http.delete(`/orders/${id}`);
    },
};
