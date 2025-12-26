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
import { Plus, ShoppingCart, Eye, Trash2, Package, Coins } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus, OrderType, Currency } from "@/types/api";
import { useAuth } from "@/contexts/auth-context";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function OrdersPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"]}>
            <OrdersPageContent />
        </ProtectedRoute>
    );
}

function OrdersPageContent() {
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
    const canCreateOrders = user?.role === "admin" || user?.role === "sales_rep" || user?.role === "procurement_officer";
    const canUpdateStatus = user?.role === "admin" || user?.role === "warehouse_staff" || user?.role === "warehouse_supervisor" || user?.role === "sales_rep" || user?.role === "procurement_officer";
    const canDeleteOrders = user?.role === "admin";

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
        completed: orders?.filter((o) => o.status === "completed").length || 0,
        currencyTotals: {
            USD: orders?.filter(o => o.currency === "USD").reduce((sum, o) => sum + o.totalAmount, 0) || 0,
            EUR: orders?.filter(o => o.currency === "EUR").reduce((sum, o) => sum + o.totalAmount, 0) || 0,
            GBP: orders?.filter(o => o.currency === "GBP").reduce((sum, o) => sum + o.totalAmount, 0) || 0,
            BDT: orders?.filter(o => o.currency === "BDT").reduce((sum, o) => sum + o.totalAmount, 0) || 0,
        }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600 mt-1">
                        Manage purchase and sales orders
                    </p>
                </div>
                {canCreateOrders && (
                    <Button onClick={() => router.push("/dashboard/orders/new")}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Order
                    </Button>
                )}
            </div>

            {/* Currency Wise Totals (The 4 Counts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(stats.currencyTotals) as [Currency, number][]).map(([curr, amount]) => (
                    <Card key={curr} className="bg-white border-l-4 border-l-blue-600 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{curr} Total</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">
                                        {formatCurrency(amount, curr)}
                                    </p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded-full">
                                    <Coins className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* General Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Orders</span>
                        <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Pending</span>
                        <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Completed</span>
                        <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 max-w-xs">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status Filter</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="flex-1 max-w-xs">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type Filter</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as OrderType | "all")}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <Card key={order._id} className="hover:shadow-md transition-shadow border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                #{order.orderNumber}
                                            </h3>
                                            <Badge variant={getTypeBadge(order.orderType)}>
                                                {order.orderType === "sales" ? "Sales" : "Purchase"}
                                            </Badge>
                                            <Badge variant={getStatusBadge(order.status)}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                            <Badge variant="outline" className="font-mono">
                                                {order.currency}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                                                <p className="text-lg font-black text-blue-700">
                                                    {formatCurrency(order.totalAmount, order.currency)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Items</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Payment</p>
                                                <p className="text-sm font-semibold text-gray-900 capitalize">
                                                    {order.paymentStatus}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap md:flex-col gap-2 min-w-[140px]">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                                            className="w-full justify-start"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Details
                                        </Button>

                                        {canUpdateStatus && order.status !== "completed" && order.status !== "cancelled" && (
                                            <Button
                                                size="sm"
                                                className={order.orderType === "purchase" ? "bg-green-600 hover:bg-green-700 w-full justify-start" : "bg-blue-600 hover:bg-blue-700 w-full justify-start"}
                                                onClick={() => handleStatusChange(order._id, "completed")}
                                            >
                                                {order.orderType === "purchase" ? (
                                                    <><Package className="w-4 h-4 mr-2" /> Receive</>
                                                ) : (
                                                    <><ShoppingCart className="w-4 h-4 mr-2" /> Ship</>
                                                )}
                                            </Button>
                                        )}

                                        {canDeleteOrders && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteClick(order)}
                                                className="w-full justify-start"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">
                        {statusFilter !== "all" || typeFilter !== "all"
                            ? "Try adjusting your filters to see more results"
                            : "Start by creating your first purchase or sales order"}
                    </p>
                    {canCreateOrders && (
                        <Button onClick={() => router.push("/dashboard/orders/new")} size="lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Order
                        </Button>
                    )}
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
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <p className="font-bold text-gray-900">Order #{selectedOrder.orderNumber}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)} • {selectedOrder.items.length} items
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
