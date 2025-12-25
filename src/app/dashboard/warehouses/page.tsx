"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehousesService } from "@/services/warehouses.service";
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
import { WarehouseForm } from "@/components/warehouses/warehouse-form";
import { Warehouse, MapPin, Phone, Mail, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import type { Warehouse as WarehouseType, CreateWarehouseDTO } from "@/types/api";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function WarehousesPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "auditor", "executive"]}>
            <WarehousesPageContent />
        </ProtectedRoute>
    );
}

function WarehousesPageContent() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: warehouses, isLoading } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => warehousesService.getAll(),
    });

    const createWarehouse = useMutation({
        mutationFn: (data: CreateWarehouseDTO) => warehousesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast.success("Warehouse created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to create warehouse");
        },
    });

    const updateWarehouse = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateWarehouseDTO> }) =>
            warehousesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast.success("Warehouse updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update warehouse");
        },
    });

    const deleteWarehouse = useMutation({
        mutationFn: (id: string) => warehousesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            toast.success("Warehouse deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to delete warehouse");
        },
    });

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);

    const canManageWarehouses = user?.role === "admin" || user?.role === "inventory_manager" || user?.role === "warehouse_supervisor";

    const handleCreate = async (data: CreateWarehouseDTO) => {
        await createWarehouse.mutateAsync(data);
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (warehouse: WarehouseType) => {
        setSelectedWarehouse(warehouse);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (data: CreateWarehouseDTO) => {
        if (selectedWarehouse) {
            await updateWarehouse.mutateAsync({ id: selectedWarehouse._id, data });
            setIsEditDialogOpen(false);
            setSelectedWarehouse(null);
        }
    };

    const handleDeleteClick = (warehouse: WarehouseType) => {
        setSelectedWarehouse(warehouse);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedWarehouse) {
            await deleteWarehouse.mutateAsync(selectedWarehouse._id);
            setIsDeleteDialogOpen(false);
            setSelectedWarehouse(null);
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
                    <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
                    <p className="text-gray-600 mt-1">Manage warehouse locations and capacity</p>
                </div>
                {canManageWarehouses && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Warehouse
                    </Button>
                )}
            </div>

            {warehouses && warehouses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <Card key={warehouse._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Code: {warehouse.code}</p>
                                    </div>
                                    <Badge variant={warehouse.isActive ? "success" : "default"}>
                                        {warehouse.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900">{warehouse.address.street}</p>
                                        <p className="text-gray-600">
                                            {warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{warehouse.contactPerson.phone}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{warehouse.contactPerson.email}</span>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-xs text-gray-600 mb-2">Capacity</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Area</p>
                                            <p className="font-semibold">{warehouse.capacity.totalArea} m²</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Volume</p>
                                            <p className="font-semibold">{warehouse.capacity.totalCapacity} m³</p>
                                        </div>
                                    </div>
                                </div>

                                {canManageWarehouses && (
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(warehouse)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteClick(warehouse)}
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
                    <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses yet</h3>
                    <p className="text-gray-600 mb-4">Add warehouses to track inventory locations</p>
                    {canManageWarehouses && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Warehouse
                        </Button>
                    )}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Warehouse</DialogTitle>
                        <DialogDescription>
                            Add a new warehouse location to your inventory system
                        </DialogDescription>
                    </DialogHeader>
                    <WarehouseForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateDialogOpen(false)}
                        isLoading={createWarehouse.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Warehouse</DialogTitle>
                        <DialogDescription>
                            Update warehouse information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedWarehouse && (
                        <WarehouseForm
                            warehouse={selectedWarehouse}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setIsEditDialogOpen(false);
                                setSelectedWarehouse(null);
                            }}
                            isLoading={updateWarehouse.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Warehouse</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this warehouse? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedWarehouse && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-medium">{selectedWarehouse.name}</p>
                                <p className="text-sm text-gray-600">Code: {selectedWarehouse.code}</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedWarehouse(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteWarehouse.isPending}
                                >
                                    {deleteWarehouse.isPending ? "Deleting..." : "Delete Warehouse"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
