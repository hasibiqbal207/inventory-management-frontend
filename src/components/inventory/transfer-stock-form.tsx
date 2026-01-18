"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";

interface TransferStockFormProps {
    onSubmit: (data: {
        productId: string;
        fromWarehouseId: string;
        toWarehouseId: string;
        quantity: number;
        reason: string;
        reference: string;
        expiryDate?: string;
        supplier?: string;
        origin?: string;
        productMaterial?: string;
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
    const { data: warehouses } = useWarehouses();

    const [formData, setFormData] = useState({
        productId: preselectedProductId || "",
        fromWarehouseId: "",
        toWarehouseId: "",
        quantity: 0,
        reason: "",
        reference: "",
        expiryDate: "",
        supplier: "",
        origin: "",
        productMaterial: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.quantity <= 0 || !formData.fromWarehouseId || !formData.toWarehouseId || !formData.reason || !formData.reference) {
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
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
                <p className="text-xs text-gray-500">
                    Note: Stock is tracked per warehouse. Ensure sufficient stock in source warehouse.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                    <Label htmlFor="reference">Reference *</Label>
                    <Input
                        id="reference"
                        name="reference"
                        value={formData.reference}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                reference: e.target.value,
                            }))
                        }
                        required
                        placeholder="e.g., TR-12345"
                    />
                </div>
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Additional Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                            id="expiryDate"
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                            id="supplier"
                            name="supplier"
                            value={formData.supplier}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                            }
                            placeholder="e.g. Global Tech Solutions"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="origin">Origin</Label>
                        <Input
                            id="origin"
                            name="origin"
                            value={formData.origin}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, origin: e.target.value }))
                            }
                            placeholder="e.g. Germany, China..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="productMaterial">Product Material</Label>
                        <Input
                            id="productMaterial"
                            name="productMaterial"
                            value={formData.productMaterial}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, productMaterial: e.target.value }))
                            }
                            placeholder="e.g. Stainless Steel, Plastic..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white py-2 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || formData.quantity <= 0 || !formData.fromWarehouseId || !formData.toWarehouseId || !formData.reason || !formData.reference}>
                    {isLoading ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </form>
    );
}
