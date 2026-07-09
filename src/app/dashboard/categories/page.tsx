"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tag, Plus, Edit, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from "@/types/api";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CategoriesPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "procurement_officer", "sales_rep", "auditor", "executive"]}>
            <CategoriesPageContent />
        </ProtectedRoute>
    );
}

function CategoriesPageContent() {
    const { canManageCategories: canManage } = usePermissions();
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesService.getAll(),
    });

    const createCategory = useMutation({
        mutationFn: (data: CreateCategoryDTO) => categoriesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category created");
        },
        onError: (error: any) => toast.error(error?.error?.message || "Failed to create category"),
    });

    const updateCategory = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
            categoriesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            // A rename cascades to every product/supplier already using the old
            // name, so those lists may also need refetching.
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            toast.success("Category updated");
        },
        onError: (error: any) => toast.error(error?.error?.message || "Failed to update category"),
    });

    const deleteCategory = useMutation({
        mutationFn: (id: string) => categoriesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category deleted");
        },
        onError: (error: any) => toast.error(error?.error?.message || "Failed to delete category"),
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CreateCategoryDTO>({ name: "", description: "" });

    const openCreate = () => {
        setSelected(null);
        setFormData({ name: "", description: "" });
        setIsFormOpen(true);
    };

    const openEdit = (category: Category) => {
        setSelected(category);
        setFormData({ name: category.name, description: category.description || "" });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selected) {
            await updateCategory.mutateAsync({ id: selected._id, data: formData });
        } else {
            await createCategory.mutateAsync(formData);
        }
        setIsFormOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (selected) {
            await deleteCategory.mutateAsync(selected._id);
            setIsDeleteOpen(false);
            setSelected(null);
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
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600 mt-1">
                        Manage the shared category list used by products and suppliers
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                )}
            </div>

            {categories && categories.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                        {canManage && <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{category.description || "—"}</td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge variant={category.isActive ? "success" : "default"}>
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </td>
                                            {canManage && (
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelected(category);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                    <p className="text-gray-600 mb-4">Add categories to organize products and suppliers</p>
                    {canManage && (
                        <Button onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    )}
                </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selected ? "Edit Category" : "Create Category"}</DialogTitle>
                        <DialogDescription>
                            {selected
                                ? "Renaming a category updates every product and supplier already tagged with it."
                                : "Add a new category to the shared list."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                                placeholder="e.g., Fabrics - Cotton"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                                {selected ? "Save Changes" : "Create Category"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            This removes the category from the managed list. Products and suppliers already
                            tagged with it keep their existing value as free text.
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-medium">{selected.name}</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteCategory.isPending}
                                >
                                    {deleteCategory.isPending ? "Deleting..." : "Delete Category"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
