"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product, CreateProductDTO } from "@/types/api";

interface ProductFormProps {
    product?: Product;
    onSubmit: (data: CreateProductDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ProductForm({
    product,
    onSubmit,
    onCancel,
    isLoading,
}: ProductFormProps) {
    const [formData, setFormData] = useState<CreateProductDTO>({
        productName: "",
        description: "",
        category: "",
        sku: "",
        minStockLevel: 10,
        maxStockLevel: 1000,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                productName: product.productName,
                description: product.description,
                category: product.category,
                sku: product.sku,
                minStockLevel: product.minStockLevel,
                maxStockLevel: product.maxStockLevel,
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                        id="productName"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        required
                        placeholder="Enter product name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                        placeholder="e.g., PROD-001"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Enter product description"
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Electronics"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="minStockLevel">Min Stock Level (Alert)</Label>
                    <Input
                        id="minStockLevel"
                        name="minStockLevel"
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={handleChange}
                        placeholder="10"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maxStockLevel">Max Stock Level (Overstock)</Label>
                    <Input
                        id="maxStockLevel"
                        name="maxStockLevel"
                        type="number"
                        min="0"
                        value={formData.maxStockLevel}
                        onChange={handleChange}
                        placeholder="1000"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
                </Button>
            </div>
        </form>
    );
}
