"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Plus, ShoppingCart, Eye, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus, OrderType } from "@/types/api";
import { useAuth } from "@/contexts/auth-context";

export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
    const [typeFilter, setTypeFilter] = useState<OrderType | "all">("all");

    const filters = {
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { orderType: typeFilter }),
    };

    const { data: orders, isLoading, error } = useOrders(filters);
    const updateStatus = useUpdateOrderStatus();
    const deleteOrder = useDeleteOrder();

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isAdmin = user?.role === "admin";

    const getStatusBadge = (status: OrderStatus) => {
        const variants: Record<OrderStatus, "default" | "warning" | "success" | "danger"> = {
            pending: "warning",
            processing: "default",
            completed: "success",
            cancelled: "danger",
        };
        return variants[status] || "default";
    };

    const getTypeBadge = (type: OrderType) => {
        return type === "sales" ? "success" : "default";
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateStatus.mutateAsync({ id: orderId, status: newStatus });
    };

    const handleDeleteClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedOrder) {
            await deleteOrder.mutateAsync(selectedOrder._id);
            setIsDeleteDialogOpen(false);
            setSelectedOrder(null);
        }
    };

    // Calculate statistics
    const stats = {
        total: orders?.length || 0,
        pending: orders?.filter((o) => o.status === "pending").length || 0,
        processing: orders?.filter((o) => o.status === "processing").length || 0,
        completed: orders?.filter((o) => o.status === "completed").length || 0,
        totalRevenue: orders
            ?.filter((o) => o.orderType === "sales" && o.status === "completed")
            .reduce((sum, o) => sum + o.totalAmount, 0) || 0,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Failed to load orders</p>
                    <p className="text-sm text-gray-600 mt-2">
                        {(error as any)?.error?.message || "Please try again later"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">
                        Manage purchase and sales orders
                    </p>
                </div>
                <Button onClick={() => router.push("/dashboard/orders/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Processing</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.processing}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                        className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as OrderType | "all")}
                        className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="sales">Sales</option>
                        <option value="purchase">Purchase</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <Badge variant={getTypeBadge(order.orderType)}>
                                                {order.orderType === "sales" ? "Sales" : "Purchase"}
                                            </Badge>
                                            <Badge variant={getStatusBadge(order.status)}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatCurrency(order.totalAmount)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-600">Items</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-600">Payment Status</p>
                                                <p className="text-sm font-medium text-gray-900 capitalize">
                                                    {order.paymentStatus}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-600">Created</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>

                                        {order.status !== "completed" && order.status !== "cancelled" && (
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                                                className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}

                                        {isAdmin && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteClick(order)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-4">
                        {statusFilter !== "all" || typeFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Create your first order to get started"}
                    </p>
                    <Button onClick={() => router.push("/dashboard/orders/new")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Order
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-medium">Order #{selectedOrder.orderNumber}</p>
                                <p className="text-sm text-gray-600">
                                    {formatCurrency(selectedOrder.totalAmount)} • {selectedOrder.items.length} items
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedOrder(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteOrder.isPending}
                                >
                                    {deleteOrder.isPending ? "Deleting..." : "Delete Order"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
