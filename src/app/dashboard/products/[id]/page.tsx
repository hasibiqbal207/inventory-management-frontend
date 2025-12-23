"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/product-form";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import type { CreateProductDTO } from "@/types/api";
import { useAuth } from "@/contexts/auth-context";

export default function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const { data: product, isLoading, error } = useProduct(resolvedParams.id);
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const isAdmin = user?.role === "admin";

    const handleUpdate = async (data: CreateProductDTO) => {
        await updateProduct.mutateAsync({ id: resolvedParams.id, data });
        setIsEditDialogOpen(false);
    };

    const handleDelete = async () => {
        await deleteProduct.mutateAsync(resolvedParams.id);
        router.push("/dashboard/products");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">Product not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/products")}
                        className="mt-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/products")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>
                        <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={product.isActive ? "success" : "default"}>
                            {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {isAdmin && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(true)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="mt-1 text-gray-900">{product.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Category</label>
                                    <p className="mt-1 text-gray-900">{product.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">SKU</label>
                                    <p className="mt-1 text-gray-900 font-mono">{product.sku}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Price</label>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Stock Quantity</label>
                                    <p className={`mt-1 text-2xl font-bold ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {product.stockQuantity} units
                                    </p>
                                </div>
                            </div>

                            {product.stockQuantity < 10 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Low stock alert: Only {product.stockQuantity} units remaining
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Active Status</label>
                                <p className="mt-1">
                                    <Badge variant={product.isActive ? "success" : "default"}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created</label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(product.createdAt, "long")}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(product.updatedAt, "long")}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Value</span>
                                <span className="text-sm font-semibold">
                                    {formatCurrency(product.price * product.stockQuantity)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Unit Price</span>
                                <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Available Stock</span>
                                <span className="text-sm font-semibold">{product.stockQuantity}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        product={product}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditDialogOpen(false)}
                        isLoading={updateProduct.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteProduct.isPending}
                            >
                                {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
