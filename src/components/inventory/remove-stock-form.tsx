"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useOrders } from "@/hooks/use-orders";
import type { RemoveStockDTO } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";

interface RemoveStockFormProps {
    onSubmit: (data: RemoveStockDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
    preselectedProductId?: string;
}

export function RemoveStockForm({
    onSubmit,
    onCancel,
    isLoading,
    preselectedProductId,
}: RemoveStockFormProps) {
    const { data: products } = useProducts();
    const { data: warehouses } = useWarehouses();
    const { data: orders } = useOrders({ status: "pending" }); // Fetch pending orders

    const [formData, setFormData] = useState<RemoveStockDTO>({
        productId: preselectedProductId || "",
        warehouseId: "",
        quantity: 0,
        reason: "",
        reference: "",
        isDamage: false,
    });
    const [manualReference, setManualReference] = useState("");

    const selectedProduct = products?.find((p) => p._id === formData.productId);
    const maxQuantity = selectedProduct?.stockQuantity || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalData = { ...formData };
        if (formData.isDamage) {
            finalData.reason = "Damage";
            finalData.reference = `DAMAGE-${new Date().toISOString().split('T')[0]}`;
        } else if (formData.reference === "OTHER") {
            finalData.reference = manualReference;
        }

        if (finalData.quantity <= 0 || finalData.quantity > maxQuantity || !finalData.warehouseId || !finalData.reason || !finalData.reference) {
            return;
        }
        onSubmit(finalData);
    };

    const handleDamageChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isDamage: checked,
            reason: checked ? "Damage" : "",
            reference: checked ? `DAMAGE-${new Date().toISOString().split('T')[0]}` : ""
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="productId">Product *</Label>
                    <select
                        id="productId"
                        value={formData.productId}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, productId: e.target.value }))
                        }
                        required
                        disabled={!!preselectedProductId}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select a product</option>
                        {products?.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.productName} (SKU: {product.sku})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="warehouseId">Warehouse *</Label>
                    <select
                        id="warehouseId"
                        value={formData.warehouseId}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, warehouseId: e.target.value }))
                        }
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select a warehouse</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                        Available stock: <strong>{selectedProduct.stockQuantity}</strong> units
                    </p>
                </div>
            )}

            <div className="flex items-center space-x-2 py-2">
                <Checkbox
                    id="isDamage"
                    checked={formData.isDamage}
                    onCheckedChange={(checked) => handleDamageChange(checked as boolean)}
                />
                <Label htmlFor="isDamage" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    This is damaged stock
                </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Remove *</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={formData.quantity || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                quantity: parseInt(e.target.value) || 0,
                            }))
                        }
                        required
                        placeholder="Enter quantity"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reference">Reference / Order Number *</Label>
                    {formData.isDamage ? (
                        <Input
                            id="reference"
                            value={formData.reference}
                            disabled
                            className="bg-gray-50"
                        />
                    ) : (
                        <select
                            id="reference"
                            value={formData.reference}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, reference: e.target.value }))
                            }
                            required
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select an order</option>
                            {orders?.filter(o => o.orderType === "sales").map((order) => (
                                <option key={order._id} value={order.orderNumber}>
                                    {order.orderNumber} ({order.customerId && typeof order.customerId === 'object' ? (order.customerId as any).firstName : 'Customer'})
                                </option>
                            ))}
                            <option value="OTHER">Other / Manual Entry</option>
                        </select>
                    )}
                    {!formData.isDamage && formData.reference === "OTHER" && (
                        <Input
                            className="mt-2"
                            placeholder="Enter manual reference"
                            value={manualReference}
                            onChange={(e) => setManualReference(e.target.value)}
                            required
                        />
                    )}
                </div>
            </div>

            {!formData.isDamage && (
                <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Adjustment *</Label>
                    <Input
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, reason: e.target.value }))
                        }
                        required
                        placeholder="e.g. Customer return, stock correction..."
                    />
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading || formData.quantity <= 0 || formData.quantity > maxQuantity || !formData.warehouseId || !formData.reason || !formData.reference}
                >
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </form>
    );
}
