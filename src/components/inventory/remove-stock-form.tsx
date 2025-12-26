"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import type { RemoveStockDTO } from "@/types/api";

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
    const [formData, setFormData] = useState<RemoveStockDTO>({
        productId: preselectedProductId || "",
        warehouseId: "",
        quantity: 0,
        reason: "",
        reference: "",
    });

    const selectedProduct = products?.find((p) => p._id === formData.productId);
    const maxQuantity = selectedProduct?.stockQuantity || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity <= 0 || formData.quantity > maxQuantity || !formData.warehouseId || !formData.reason || !formData.reference) {
            return;
        }
        onSubmit(formData);
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
                    <Input
                        id="reference"
                        name="reference"
                        value={formData.reference}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, reference: e.target.value }))
                        }
                        required
                        placeholder="e.g. SO-12345"
                    />
                </div>
            </div>

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
                    placeholder="e.g. Damaged goods, customer return, stock correction..."
                />
            </div>

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
