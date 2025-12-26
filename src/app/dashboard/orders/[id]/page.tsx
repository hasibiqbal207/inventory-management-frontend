"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, ShoppingCart, Calendar, User, MapPin, CreditCard, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, OrderType, Product, User as UserType } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"]}>
            <OrderDetailsContent id={id} />
        </ProtectedRoute>
    );
}

function OrderDetailsContent({ id }: { id: string }) {
    const router = useRouter();
    const { data: order, isLoading, error } = useOrder(id);
    const updateStatus = useUpdateOrderStatus();

    const getStatusBadge = (status: OrderStatus) => {
        const variants: Record<OrderStatus, "default" | "warning" | "success" | "danger"> = {
            pending: "warning",
            processing: "default",
            completed: "success",
            cancelled: "danger",
        };
        return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
    };

    const getTypeBadge = (type: OrderType) => {
        return <Badge variant={type === "sales" ? "success" : "default"}>{type.toUpperCase()}</Badge>;
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
        await updateStatus.mutateAsync({ id, status: newStatus });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 font-bold">Order not found or error loading order.</p>
                <Button variant="ghost" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
                </div>
                <div className="flex gap-2">
                    {order.status !== "completed" && order.status !== "cancelled" && (
                        <>
                            <Button variant="outline" onClick={() => handleStatusChange("cancelled")} className="text-red-600 border-red-200 hover:bg-red-50">
                                Cancel Order
                            </Button>
                            <Button onClick={() => handleStatusChange("completed")} className="bg-green-600 hover:bg-green-700">
                                {order.orderType === "purchase" ? "Mark as Received" : "Mark as Shipped"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left font-medium text-muted-foreground">
                                            <th className="py-3 px-2">Product</th>
                                            <th className="py-3 px-2 text-right">Quantity</th>
                                            <th className="py-3 px-2 text-right">Unit Price</th>
                                            <th className="py-3 px-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-3 px-2">
                                                    <div className="font-medium">
                                                        {typeof item.productId === 'object' ? (item.productId as Product).productName : 'Product'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {typeof item.productId === 'object' ? (item.productId as Product).sku : ''}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-right">{item.quantity}</td>
                                                <td className="py-3 px-2 text-right">{formatCurrency(item.unitPrice, order.currency)}</td>
                                                <td className="py-3 px-2 text-right font-semibold">
                                                    {formatCurrency(item.quantity * item.unitPrice, order.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="py-4 text-right font-bold text-lg">Total Amount:</td>
                                            <td className="py-4 text-right font-black text-xl text-blue-700">
                                                {formatCurrency(order.totalAmount, order.currency)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                                {order.notes || "No additional notes for this order."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Type</span>
                                {getTypeBadge(order.orderType)}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Currency</span>
                                <Badge variant="outline">{order.currency}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{formatDate(order.createdAt, "long")}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stakeholder Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">
                                        {order.orderType === "sales" ? "Customer" : "Supplier"}
                                    </p>
                                    <p className="font-medium">
                                        {order.orderType === "sales"
                                            ? (order.customerId && typeof order.customerId === 'object' ? `${(order.customerId as UserType).firstName} ${(order.customerId as UserType).lastName}` : 'Customer')
                                            : (order.supplierId && typeof order.supplierId === 'object' ? (order.supplierId as any).companyName : 'Supplier')
                                        }
                                    </p>
                                    {order.orderType === "purchase" && order.supplierId && typeof order.supplierId === 'object' && (
                                        <p className="text-xs text-muted-foreground">
                                            Contact: {(order.supplierId as any).contactPerson.firstName} {(order.supplierId as any).contactPerson.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-4 h-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Payment Method</p>
                                    <p className="font-medium capitalize">{order.paymentMethod || "Not specified"}</p>
                                    <p className="text-xs text-muted-foreground">Status: {order.paymentStatus}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Shipping Address</p>
                                    <p className="text-sm">{order.shippingAddress || "Not specified"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
