"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { warehousesService } from "@/services/warehouses.service";

interface TransferStockFormProps {
    onSubmit: (data: {
        productId: string;
        fromWarehouseId: string;
        toWarehouseId: string;
        quantity: number;
        reason: string;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    preselectedProductId?: string;
}

export function TransferStockForm({
    onSubmit,
    onCancel,
    isLoading,
    preselectedProductId,
}: TransferStockFormProps) {
    const { data: products } = useProducts();
    const { data: warehouses } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => warehousesService.getAll(),
    });

    const [formData, setFormData] = useState({
        productId: preselectedProductId || "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: 0,
        reason: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity <= 0 || !formData.fromWarehouseId || !formData.toWarehouseId) {
            return;
        }
        if (formData.fromWarehouseId === formData.toWarehouseId) {
            alert("Source and destination warehouses must be different.");
            return;
        }
        onSubmit(formData);
    };

    const selectedProduct = products?.find(p => p._id === formData.productId);

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
                            {product.productName} (SKU: {product.sku}) - Total Stock: {product.stockQuantity}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fromWarehouseId">From Warehouse *</Label>
                    <select
                        id="fromWarehouseId"
                        value={formData.fromWarehouseId}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fromWarehouseId: e.target.value }))
                        }
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select source</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="toWarehouseId">To Warehouse *</Label>
                    <select
                        id="toWarehouseId"
                        value={formData.toWarehouseId}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, toWarehouseId: e.target.value }))
                        }
                        required
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select destination</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Transfer *</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct?.stockQuantity}
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
                {selectedProduct && (
                    <p className="text-xs text-gray-500">
                        Available total: {selectedProduct.stockQuantity} units
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            reason: e.target.value,
                        }))
                    }
                    required
                    placeholder="e.g., Restocking Branch B"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || formData.quantity <= 0 || !formData.fromWarehouseId || !formData.toWarehouseId}>
                    {isLoading ? "Transferring..." : "Transfer Stock"}
                </Button>
            </div>
        </form>
    );
}
