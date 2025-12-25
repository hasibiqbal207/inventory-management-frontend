"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersService } from "@/services/suppliers.service";
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
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { Users, Mail, Phone, MapPin, Star, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import type { Supplier, CreateSupplierDTO } from "@/types/api";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SuppliersPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "procurement_officer", "auditor", "executive"]}>
            <SuppliersPageContent />
        </ProtectedRoute>
    );
}

function SuppliersPageContent() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: () => suppliersService.getAll(),
    });

    const createSupplier = useMutation({
        mutationFn: (data: CreateSupplierDTO) => suppliersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast.success("Supplier created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to create supplier");
        },
    });

    const updateSupplier = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateSupplierDTO> }) =>
            suppliersService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast.success("Supplier updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update supplier");
        },
    });

    const deleteSupplier = useMutation({
        mutationFn: (id: string) => suppliersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast.success("Supplier deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to delete supplier");
        },
    });

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const canManageSuppliers = user?.role === "admin" || user?.role === "procurement_officer";

    const handleCreate = async (data: CreateSupplierDTO) => {
        await createSupplier.mutateAsync(data);
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (data: CreateSupplierDTO) => {
        if (selectedSupplier) {
            await updateSupplier.mutateAsync({ id: selectedSupplier._id, data });
            setIsEditDialogOpen(false);
            setSelectedSupplier(null);
        }
    };

    const handleDeleteClick = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedSupplier) {
            await deleteSupplier.mutateAsync(selectedSupplier._id);
            setIsDeleteDialogOpen(false);
            setSelectedSupplier(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                    <p className="text-gray-600 mt-1">Manage supplier relationships and contacts</p>
                </div>
                {canManageSuppliers && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </Button>
                )}
            </div>

            {suppliers && suppliers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier) => (
                        <Card key={supplier._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {supplier.contactPerson.firstName} {supplier.contactPerson.lastName}
                                        </p>
                                    </div>
                                    <Badge variant={supplier.isActive ? "success" : "default"}>
                                        {supplier.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{supplier.email}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{supplier.phone}</span>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900">{supplier.address.city}, {supplier.address.state}</p>
                                        <p className="text-gray-600">{supplier.address.country}</p>
                                    </div>
                                </div>

                                {supplier.rating && (
                                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-semibold">{supplier.rating.toFixed(1)}</span>
                                        <span className="text-gray-600">/ 5.0</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <p className="text-xs text-gray-600 mb-2">Categories</p>
                                    <div className="flex flex-wrap gap-1">
                                        {supplier.categories.slice(0, 3).map((cat, idx) => (
                                            <Badge key={idx} variant="default" className="text-xs">
                                                {cat}
                                            </Badge>
                                        ))}
                                        {supplier.categories.length > 3 && (
                                            <Badge variant="default" className="text-xs">
                                                +{supplier.categories.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {canManageSuppliers && (
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(supplier)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(supplier)}
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
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
                    <p className="text-gray-600 mb-4">Add suppliers to manage your supply chain</p>
                    {canManageSuppliers && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Supplier
                        </Button>
                    )}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Supplier</DialogTitle>
                        <DialogDescription>
                            Add a new supplier to your network
                        </DialogDescription>
                    </DialogHeader>
                    <SupplierForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateDialogOpen(false)}
                        isLoading={createSupplier.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Update supplier information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSupplier && (
                        <SupplierForm
                            supplier={selectedSupplier}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedSupplier(null);
                            }}
                            isLoading={updateSupplier.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Supplier</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this supplier? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSupplier && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-medium">{selectedSupplier.companyName}</p>
                                <p className="text-sm text-gray-600">
                                    {selectedSupplier.contactPerson.firstName} {selectedSupplier.contactPerson.lastName}
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedSupplier(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteSupplier.isPending}
                                >
                                    {deleteSupplier.isPending ? "Deleting..." : "Delete Supplier"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
