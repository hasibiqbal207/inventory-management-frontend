"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductsPaginated, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ProductImportDialog } from "@/components/products/product-import-dialog";
import { Plus, Search, Edit, Trash2, Package, Upload, Download, Power, PowerOff } from "lucide-react";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { exportRowsToCsv } from "@/lib/export";
import { productsService } from "@/services/products.service";
import { toast } from "sonner";
import type { Product, CreateProductDTO } from "@/types/api";
import { usePermissions } from "@/hooks/use-permissions";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProductsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "procurement_officer", "sales_rep", "auditor", "executive"]}>
            <ProductsPageContent />
        </ProtectedRoute>
    );
}

function ProductsPageContent() {
    const { canManageProducts } = usePermissions();
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchTerm);

    // Reset to page 1 whenever the (debounced) search changes so results aren't
    // requested for a page that no longer exists in the filtered set.
    const searchKey = debouncedSearch;
    const [lastSearch, setLastSearch] = useState(searchKey);
    if (searchKey !== lastSearch) {
        setLastSearch(searchKey);
        setPage(1);
    }

    const { data: productsPage, isLoading, error } = useProductsPaginated({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
    });
    const products = productsPage?.data;
    const pagination = productsPage?.pagination;
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();
    const queryClient = useQueryClient();

    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const clearSelection = () => setSelectedIds(new Set());
    const allOnPageSelected = !!products && products.length > 0 && products.every((p) => selectedIds.has(p._id));
    const toggleSelectAllOnPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) products?.forEach((p) => next.delete(p._id));
            else products?.forEach((p) => next.add(p._id));
            return next;
        });
    };

    const bulkAction = useMutation({
        mutationFn: ({ ids, action }: { ids: string[]; action: "activate" | "deactivate" | "delete" }) =>
            productsService.bulkAction(ids, action),
        onSuccess: (count, { action }) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            clearSelection();
            const verb = action === "delete" ? "deleted" : action === "activate" ? "activated" : "deactivated";
            toast.success(`${count} product${count !== 1 ? "s" : ""} ${verb}`);
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e, "Bulk action failed")),
    });

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { columns, rows } = await productsService.exportRows();
            if (rows.length === 0) {
                toast.info("No products to export.");
                return;
            }
            exportRowsToCsv(
                "products-export",
                columns.map((c) => ({ key: c, label: c })),
                rows
            );
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Export failed"));
        } finally {
            setIsExporting(false);
        }
    };

    // Search is handled server-side (see useProductsPaginated); the returned
    // page is already filtered.
    const filteredProducts = products;

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive">Failed to load products</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {getErrorMessage(error, "Please try again later")}
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
                    <h1 className="text-3xl font-bold text-foreground">Products</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your product catalog
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? "Exporting…" : "Export CSV"}
                    </Button>
                    {canManageProducts && (
                        <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    )}
                    {canManageProducts && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    )}
                </div>
            </div>

            <ProductImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search products by name, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Bulk action bar */}
            {canManageProducts && (
                <BulkActionBar count={selectedIds.size} onClear={clearSelection}>
                    <Button size="sm" variant="outline" onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "activate" })} disabled={bulkAction.isPending}>
                        <Power className="w-4 h-4 mr-1" /> Activate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "deactivate" })} disabled={bulkAction.isPending}>
                        <PowerOff className="w-4 h-4 mr-1" /> Deactivate
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "delete" })} disabled={bulkAction.isPending}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                </BulkActionBar>
            )}

            {/* Select all on page */}
            {canManageProducts && filteredProducts && filteredProducts.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-3 px-1">
                    <Checkbox checked={allOnPageSelected} onCheckedChange={toggleSelectAllOnPage} />
                    Select all on this page
                </label>
            )}

            {/* Products Grid */}
            {filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product._id} className={`hover:shadow-lg transition-shadow ${selectedIds.has(product._id) ? 'ring-2 ring-blue-400' : ''}`}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1">
                                        {canManageProducts && (
                                            <Checkbox
                                                checked={selectedIds.has(product._id)}
                                                onCheckedChange={() => toggleSelected(product._id)}
                                                className="mt-1"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{product.productName}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                    <Badge variant={product.isActive ? "success" : "default"}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="font-medium">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Unit Price:</span>
                                        <span className="font-medium">{formatCurrency(product.price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Stock:</span>
                                        <Link href="/dashboard/inventory" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Stock →
                                        </Link>
                                    </div>
                                </div>

                                <div className="text-xs text-muted-foreground mb-4">
                                    Updated: {formatDate(product.updatedAt)}
                                </div>

                                {canManageProducts && (
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
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? "No products found" : "No products yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {searchTerm
                            ? "Try adjusting your search terms"
                            : "Get started by adding your first product"}
                    </p>
                    {canManageProducts && !searchTerm && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    )}
                </div>
            )}

            <Pagination pagination={pagination} onPageChange={setPage} />

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
                            <div className="bg-muted p-4 rounded-md">
                                <p className="font-medium">{selectedProduct.productName}</p>
                                <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
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
