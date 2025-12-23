"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { Plus, Trash2 } from "lucide-react";
import type { CreateOrderDTO, OrderItem } from "@/types/api";

interface OrderFormProps {
    onSubmit: (data: CreateOrderDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function OrderForm({ onSubmit, onCancel, isLoading }: OrderFormProps) {
    const { data: products } = useProducts();

    const [orderType, setOrderType] = useState<"purchase" | "sales">("sales");
    const [items, setItems] = useState<OrderItem[]>([
        { productId: "", quantity: 1, unitPrice: 0 },
    ]);
    const [formData, setFormData] = useState({
        customerId: "",
        supplierId: "",
        warehouseId: "",
        paymentMethod: "",
        shippingAddress: "",
        billingAddress: "",
        notes: "",
    });

    const addItem = () => {
        setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill unit price when product is selected
        if (field === "productId") {
            const product = products?.find((p) => p._id === value);
            if (product) {
                newItems[index].unitPrice = product.price;
            }
        }

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const orderData: CreateOrderDTO = {
            orderType,
            items: items.filter((item) => item.productId && item.quantity > 0),
            warehouseId: formData.warehouseId || "default-warehouse-id", // TODO: Get from warehouse selector
            ...(orderType === "sales" && formData.customerId && { customerId: formData.customerId }),
            ...(orderType === "purchase" && formData.supplierId && { supplierId: formData.supplierId }),
            ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod }),
            ...(formData.shippingAddress && { shippingAddress: formData.shippingAddress }),
            ...(formData.billingAddress && { billingAddress: formData.billingAddress }),
            ...(formData.notes && { notes: formData.notes }),
        };

        onSubmit(orderData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Type */}
            <div className="space-y-2">
                <Label>Order Type *</Label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="sales"
                            checked={orderType === "sales"}
                            onChange={(e) => setOrderType(e.target.value as "sales")}
                            className="mr-2"
                        />
                        Sales Order
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="purchase"
                            checked={orderType === "purchase"}
                            onChange={(e) => setOrderType(e.target.value as "purchase")}
                            className="mr-2"
                        />
                        Purchase Order
                    </label>
                </div>
            </div>

            {/* Customer/Supplier ID */}
            {orderType === "sales" ? (
                <div className="space-y-2">
                    <Label htmlFor="customerId">Customer ID</Label>
                    <Input
                        id="customerId"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        placeholder="Enter customer ID (optional)"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="supplierId">Supplier ID</Label>
                    <Input
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        placeholder="Enter supplier ID (optional)"
                    />
                </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Order Items *</Label>
                    <Button type="button" size="sm" onClick={addItem}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                    </Button>
                </div>

                {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                            {items.length > 1 && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-2">
                                <Label>Product *</Label>
                                <select
                                    value={item.productId}
                                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select product</option>
                                    {products?.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.productName} - ${product.price} (Stock: {product.stockQuantity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Quantity *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Unit Price *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Subtotal</Label>
                                <Input
                                    type="text"
                                    value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                        ${calculateTotal().toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Input
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        placeholder="e.g., Credit Card, Cash"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="warehouseId">Warehouse ID</Label>
                    <Input
                        id="warehouseId"
                        value={formData.warehouseId}
                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        placeholder="Enter warehouse ID"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="Enter shipping address"
                    className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or instructions"
                    className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || items.length === 0}>
                    {isLoading ? "Creating..." : "Create Order"}
                </Button>
            </div>
        </form>
    );
}
