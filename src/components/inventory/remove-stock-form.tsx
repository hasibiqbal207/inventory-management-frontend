"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
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
    const [formData, setFormData] = useState<RemoveStockDTO>({
        productId: preselectedProductId || "",
        quantity: 0,
    });

    const selectedProduct = products?.find((p) => p._id === formData.productId);
    const maxQuantity = selectedProduct?.stockQuantity || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity <= 0 || formData.quantity > maxQuantity) {
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                            {product.productName} (SKU: {product.sku}) - Available: {product.stockQuantity}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                        Available stock: <strong>{selectedProduct.stockQuantity}</strong> units
                    </p>
                </div>
            )}

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
                {formData.quantity > maxQuantity && (
                    <p className="text-sm text-red-600">
                        Cannot remove more than available stock ({maxQuantity} units)
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading || formData.quantity <= 0 || formData.quantity > maxQuantity}
                >
                    {isLoading ? "Removing..." : "Remove Stock"}
                </Button>
            </div>
        </form>
    );
}
