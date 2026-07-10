"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoriesService } from "@/services/categories.service";
import { useProducts } from "@/hooks/use-products";
import { Plus, Trash2 } from "lucide-react";
import type { Product, CreateProductDTO, ProductType, BOMComponent } from "@/types/api";

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
        barcode: "",
        price: 0,
        minStockLevel: 10,
        maxStockLevel: 1000,
        productType: "standard",
        components: [],
    });

    const { data: categories } = useQuery({
        queryKey: ["categories", { isActive: true }],
        queryFn: () => categoriesService.getAll(true),
    });
    const { data: allProducts } = useProducts();

    useEffect(() => {
        if (product) {
            setFormData({
                productName: product.productName,
                description: product.description,
                category: product.category,
                sku: product.sku,
                barcode: product.barcode ?? "",
                price: product.price,
                minStockLevel: product.minStockLevel,
                maxStockLevel: product.maxStockLevel,
                productType: product.productType ?? "standard",
                components: product.components ?? [],
            });
        }
    }, [product]);

    const isAssembled = formData.productType === "kit" || formData.productType === "bundle";
    const components = formData.components ?? [];

    const addComponent = () =>
        setFormData((prev) => ({
            ...prev,
            components: [...(prev.components ?? []), { componentProductId: "", quantity: 1 }],
        }));

    const updateComponent = (idx: number, patch: Partial<BOMComponent>) =>
        setFormData((prev) => ({
            ...prev,
            components: (prev.components ?? []).map((c, i) => (i === idx ? { ...c, ...patch } : c)),
        }));

    const removeComponent = (idx: number) =>
        setFormData((prev) => ({
            ...prev,
            components: (prev.components ?? []).filter((_, i) => i !== idx),
        }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Only send components for assembled products, and drop incomplete rows.
        const payload: CreateProductDTO = {
            ...formData,
            components: isAssembled
                ? components.filter((c) => c.componentProductId && c.quantity > 0)
                : [],
        };
        onSubmit(payload);
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
                <Label htmlFor="barcode">Barcode / QR value</Label>
                <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Scannable code (optional; falls back to SKU)"
                />
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
                    <Select
                        value={formData.category || undefined}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories?.map((cat) => (
                                <SelectItem key={cat._id} value={cat.name}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="price">Unit Price</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
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

            {/* Product type + BOM */}
            <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Select
                    value={formData.productType}
                    onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, productType: value as ProductType }))
                    }
                >
                    <SelectTrigger id="productType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="standard">Standard (atomic)</SelectItem>
                        <SelectItem value="kit">Kit (assembled from components)</SelectItem>
                        <SelectItem value="bundle">Bundle (sold as a group)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isAssembled && (
                <div className="space-y-3 rounded-md border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <Label>Components (Bill of Materials)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                            <Plus className="w-4 h-4 mr-1" /> Add component
                        </Button>
                    </div>
                    {components.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Add at least one component product and its per-unit quantity.
                        </p>
                    )}
                    {components.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <select
                                value={comp.componentProductId}
                                onChange={(e) => updateComponent(idx, { componentProductId: e.target.value })}
                                className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select component…</option>
                                {allProducts
                                    ?.filter((p) => p._id !== product?._id && (p.productType ?? "standard") === "standard")
                                    .map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.productName} ({p.sku})
                                        </option>
                                    ))}
                            </select>
                            <Input
                                type="number"
                                min="1"
                                value={comp.quantity}
                                onChange={(e) => updateComponent(idx, { quantity: parseInt(e.target.value) || 1 })}
                                className="w-24"
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeComponent(idx)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

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
