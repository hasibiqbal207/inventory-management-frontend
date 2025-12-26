"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Plus, Trash2 } from "lucide-react";
import type { CreateOrderDTO, OrderItem, Currency } from "@/types/api";

interface OrderFormProps {
    onSubmit: (data: CreateOrderDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CURRENCIES: { label: string; value: Currency; symbol: string }[] = [
    { label: "US Dollar (USD)", value: "USD", symbol: "$" },
    { label: "Euro (EUR)", value: "EUR", symbol: "€" },
    { label: "British Pound (GBP)", value: "GBP", symbol: "£" },
    { label: "Bangladeshi Taka (BDT)", value: "BDT", symbol: "৳" },
];

export function OrderForm({ onSubmit, onCancel, isLoading }: OrderFormProps) {
    const { data: products } = useProducts();
    const { data: suppliers, isLoading: isLoadingSuppliers } = useSuppliers();
    const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();

    const [orderType, setOrderType] = useState<"purchase" | "sales">("sales");
    const [currency, setCurrency] = useState<Currency>("USD");
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

        // Note: Unit price must be entered manually as products no longer have a fixed price
        // Prices vary per purchase order

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const getCurrencySymbol = (val: Currency) => {
        return CURRENCIES.find(c => c.value === val)?.symbol || "$";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const orderData: CreateOrderDTO = {
            orderType,
            currency,
            items: items.filter((item) => item.productId && item.quantity > 0),
            warehouseId: formData.warehouseId,
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
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Type */}
                <div className="space-y-2">
                    <Label>Order Type *</Label>
                    <div className="flex gap-4 p-2 bg-gray-50 rounded-md">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="sales"
                                checked={orderType === "sales"}
                                onChange={(e) => setOrderType(e.target.value as "sales")}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Sales Order</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                value="purchase"
                                checked={orderType === "purchase"}
                                onChange={(e) => setOrderType(e.target.value as "purchase")}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Purchase Order</span>
                        </label>
                    </div>
                </div>

                {/* Currency Selection */}
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label} ({c.symbol})
                            </option>
                        ))}
                    </select>
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
                    <Label htmlFor="supplierId">Supplier *</Label>
                    <select
                        id="supplierId"
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        required={orderType === "purchase"}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"}</option>
                        {suppliers?.map((supplier) => (
                            <option key={supplier._id} value={supplier._id}>
                                {supplier.companyName} ({supplier.contactPerson.firstName} {supplier.contactPerson.lastName})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Order Items *</Label>
                    <Button type="button" size="sm" onClick={addItem} variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                    </Button>
                </div>

                {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900">Item {index + 1}</span>
                            {items.length > 1 && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2 space-y-2">
                                <Label>Product *</Label>
                                <select
                                    value={typeof item.productId === "string" ? item.productId : item.productId._id}
                                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select product</option>
                                    {products?.map((product) => (
                                        <option key={product._id} value={product._id}>
                                            {product.productName} (Stock: {product.stockQuantity})
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Unit Price ({getCurrencySymbol(currency)}) *</Label>
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
                                <Label>Subtotal ({getCurrencySymbol(currency)})</Label>
                                <Input
                                    type="text"
                                    value={`${getCurrencySymbol(currency)}${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    disabled
                                    className="bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-900">Total Amount:</span>
                    <span className="text-3xl font-black text-blue-700">
                        {getCurrencySymbol(currency)}{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Input
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        placeholder="e.g., Credit Card, Cash, Bank Transfer"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="warehouseId">Warehouse *</Label>
                    <select
                        id="warehouseId"
                        value={formData.warehouseId}
                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">{isLoadingWarehouses ? "Loading warehouses..." : "Select warehouse"}</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name} ({warehouse.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="Enter shipping address"
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or instructions"
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white py-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || items.length === 0} className="px-8">
                    {isLoading ? "Creating..." : "Create Order"}
                </Button>
            </div>
        </form>
    );
}
