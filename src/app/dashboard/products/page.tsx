"use client";

import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, CreateProductDTO } from "@/types/api";
import { useAuth } from "@/contexts/auth-context";

export default function ProductsPage() {
    const { user } = useAuth();
    const { data: products, isLoading, error } = useProducts();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const isAdmin = user?.role === "admin";

    // Filter products based on search
    const filteredProducts = products?.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (data: CreateProductDTO) => {
        await createProduct.mutateAsync(data);
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (data: CreateProductDTO) => {
        if (selectedProduct) {
            await updateProduct.mutateAsync({ id: selectedProduct._id, data });
            setIsEditDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedProduct) {
            await deleteProduct.mutateAsync(selectedProduct._id);
            setIsDeleteDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Failed to load products</p>
                    <p className="text-sm text-gray-600 mt-2">
                        {(error as any)?.error?.message || "Please try again later"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your product catalog
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search products by name, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{product.productName}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                                    </div>
                                    <Badge variant={product.isActive ? "success" : "default"}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Stock:</span>
                                        <span className={`font-medium ${product.stockQuantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                            {product.stockQuantity} units
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 mb-4">
                                    Updated: {formatDate(product.updatedAt)}
                                </div>

                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(product)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(product)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No products found" : "No products yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm
                            ? "Try adjusting your search terms"
                            : "Get started by adding your first product"}
                    </p>
                    {isAdmin && !searchTerm && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    )}
                </div>
            )}

            {/* Create Product Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                            Add a new product to your inventory catalog
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateDialogOpen(false)}
                        isLoading={createProduct.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProduct && (
                        <ProductForm
                            product={selectedProduct}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedProduct(null);
                            }}
                            isLoading={updateProduct.isPending}
                        />
                    )}
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
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-medium">{selectedProduct.productName}</p>
                                <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedProduct(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteProduct.isPending}
                                >
                                    {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
