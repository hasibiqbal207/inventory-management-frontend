"use client";

import { useState } from "react";
import { useInventory, useAddStock, useRemoveStock, useTransferStock } from "@/hooks/use-inventory";
import { useCreateInventoryRequest } from "@/hooks/use-inventory-requests";
import { useProducts } from "@/hooks/use-products";
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
import { AddStockForm } from "@/components/inventory/add-stock-form";
import { RemoveStockForm } from "@/components/inventory/remove-stock-form";
import { TransferStockForm } from "@/components/inventory/transfer-stock-form";
import { Plus, Minus, Search, Warehouse, TrendingUp, TrendingDown, Package } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { AddStockDTO, RemoveStockDTO, Inventory, Product } from "@/types/api";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function InventoryPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "auditor", "executive"]}>
            <InventoryPageContent />
        </ProtectedRoute>
    );
}

function InventoryPageContent() {
    const inventoryQuery = useInventory();
    const productsQuery = useProducts();
    const { data: inventory, isLoading: inventoryLoading } = inventoryQuery;
    const { data: products, isLoading: productsLoading } = productsQuery;
    const addStock = useAddStock();
    const removeStock = useRemoveStock();
    const transferStock = useTransferStock();
    const createRequest = useCreateInventoryRequest();

    const [searchTerm, setSearchTerm] = useState("");
    const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
    const [isRemoveStockDialogOpen, setIsRemoveStockDialogOpen] = useState(false);
    const [isTransferStockDialogOpen, setIsTransferStockDialogOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
    const { user } = useAuth();

    const isStaff = user?.role === "warehouse_staff";
    const canManageStock = user?.role === "admin" || user?.role === "inventory_manager" || user?.role === "warehouse_supervisor" || user?.role === "warehouse_staff";
    const canTransferStock = user?.role === "admin" || user?.role === "inventory_manager" || user?.role === "warehouse_supervisor" || user?.role === "warehouse_staff";

    const isLoading = inventoryLoading || productsLoading;

    // Get product details for inventory items
    const getProductDetails = (productId: string | Product) => {
        if (typeof productId === "string") {
            return products?.find((p) => p._id === productId);
        }
        return productId;
    };

    // Filter products based on search
    const filteredProducts = products?.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stock statistics
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter((p) => p.stockQuantity < 10).length || 0;
    const outOfStockProducts = products?.filter((p) => p.stockQuantity === 0).length || 0;
    const totalStockValue = products?.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0) || 0;

    const handleAddStock = async (data: AddStockDTO) => {
        if (isStaff) {
            await createRequest.mutateAsync({ ...data, type: "add" });
        } else {
            await addStock.mutateAsync(data);
        }
        inventoryQuery.refetch();
        productsQuery.refetch();
        setIsAddStockDialogOpen(false);
        setSelectedProductId(undefined);
    };

    const handleRemoveStock = async (data: RemoveStockDTO) => {
        if (isStaff) {
            await createRequest.mutateAsync({ ...data, type: "remove" });
        } else {
            await removeStock.mutateAsync(data);
        }
        inventoryQuery.refetch();
        productsQuery.refetch();
        setIsRemoveStockDialogOpen(false);
        setSelectedProductId(undefined);
    };

    const handleTransferStock = async (data: any) => {
        if (isStaff) {
            await createRequest.mutateAsync({ ...data, type: "transfer" });
        } else {
            await transferStock.mutateAsync(data);
        }
        inventoryQuery.refetch();
        productsQuery.refetch();
        setIsTransferStockDialogOpen(false);
        setSelectedProductId(undefined);
    };

    const openAddStockDialog = (productId?: string) => {
        setSelectedProductId(productId);
        setIsAddStockDialogOpen(true);
    };

    const openRemoveStockDialog = (productId?: string) => {
        setSelectedProductId(productId);
        setIsRemoveStockDialogOpen(true);
    };

    const getStockStatus = (quantity: number, min?: number, max?: number) => {
        if (quantity === 0) return { label: "Out of Stock", variant: "danger" as const };
        if (min !== undefined && quantity < min) return { label: "Low Stock", variant: "warning" as const };
        if (max !== undefined && quantity > max) return { label: "Overstock", variant: "warning" as const };
        return { label: "In Stock", variant: "success" as const };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-gray-600 mt-1">
                        Track and manage stock levels across your warehouse
                    </p>
                </div>
                <div className="flex gap-2">
                    {canManageStock && (
                        <Button onClick={() => openAddStockDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Stock
                        </Button>
                    )}
                    {canTransferStock && (
                        <Button variant="outline" onClick={() => setIsTransferStockDialogOpen(true)}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Transfer Stock
                        </Button>
                    )}
                    {canManageStock && (
                        <Button variant="outline" onClick={() => openRemoveStockDialog()}>
                            <Minus className="w-4 h-4 mr-2" />
                            Remove Stock
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                            </div>
                            <div className="bg-blue-500 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{lowStockProducts}</p>
                            </div>
                            <div className="bg-yellow-500 p-3 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{outOfStockProducts}</p>
                            </div>
                            <div className="bg-red-500 p-3 rounded-lg">
                                <Warehouse className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    ${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Inventory Table */}
            {filteredProducts && filteredProducts.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Value</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => {
                                        const status = getStockStatus(product.stockQuantity, product.minStockLevel, product.maxStockLevel);
                                        const value = product.price * product.stockQuantity;

                                        return (
                                            <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.productName}</p>
                                                        <p className="text-sm text-gray-500">{product.description.substring(0, 50)}...</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-mono text-sm">{product.sku}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">{product.category}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`font-semibold ${product.stockQuantity === 0 ? 'text-red-600' :
                                                        product.stockQuantity < 10 ? 'text-yellow-600' :
                                                            'text-green-600'
                                                        }`}>
                                                        {product.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="font-medium">
                                                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge variant={status.variant}>{status.label}</Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {canManageStock && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openAddStockDialog(product._id)}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openRemoveStockDialog(product._id)}
                                                                disabled={product.stockQuantity === 0}
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12">
                    <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No products found" : "No inventory items yet"}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm
                            ? "Try adjusting your search terms"
                            : "Add products to start tracking inventory"}
                    </p>
                </div>
            )}

            {/* Add Stock Dialog */}
            <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Stock</DialogTitle>
                        <DialogDescription>
                            Increase inventory quantity for a product
                        </DialogDescription>
                    </DialogHeader>
                    <AddStockForm
                        onSubmit={handleAddStock}
                        onCancel={() => {
                            setIsAddStockDialogOpen(false);
                            setSelectedProductId(undefined);
                        }}
                        isLoading={addStock.isPending || createRequest.isPending}
                        preselectedProductId={selectedProductId}
                    />
                </DialogContent>
            </Dialog>

            {/* Remove Stock Dialog */}
            <Dialog open={isRemoveStockDialogOpen} onOpenChange={setIsRemoveStockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Stock</DialogTitle>
                        <DialogDescription>
                            Decrease inventory quantity for a product
                        </DialogDescription>
                    </DialogHeader>
                    <RemoveStockForm
                        onSubmit={handleRemoveStock}
                        onCancel={() => {
                            setIsRemoveStockDialogOpen(false);
                            setSelectedProductId(undefined);
                        }}
                        isLoading={removeStock.isPending || createRequest.isPending}
                        preselectedProductId={selectedProductId}
                    />
                </DialogContent>
            </Dialog>

            {/* Transfer Stock Dialog */}
            <Dialog open={isTransferStockDialogOpen} onOpenChange={setIsTransferStockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Stock</DialogTitle>
                        <DialogDescription>
                            Move inventory between warehouses
                        </DialogDescription>
                    </DialogHeader>
                    <TransferStockForm
                        onSubmit={handleTransferStock}
                        onCancel={() => {
                            setIsTransferStockDialogOpen(false);
                            setSelectedProductId(undefined);
                        }}
                        isLoading={transferStock.isPending || createRequest.isPending}
                        preselectedProductId={selectedProductId}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
