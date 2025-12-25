"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Users, Shield, Trash2, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { UserRole } from "@/types/api";

const ROLES: UserRole[] = [
    "admin",
    "inventory_manager",
    "warehouse_supervisor",
    "warehouse_staff",
    "procurement_officer",
    "sales_rep",
    "finance_officer",
    "auditor",
    "it_support",
    "executive",
];

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UserManagementPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagementPageContent />
        </ProtectedRoute>
    );
}

function UserManagementPageContent() {
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => usersService.getAll(),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
            usersService.updateRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User role updated successfully!");
            setIsRoleDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to update role");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => usersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User deleted successfully!");
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || "Failed to delete user");
        },
    });

    const handleRoleUpdate = (user: any) => {
        setSelectedUser(user);
        setIsRoleDialogOpen(true);
    };

    const handleDeleteClick = (user: any) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const getRoleBadge = (role: UserRole) => {
        const variants: Record<UserRole, "default" | "secondary" | "outline" | "destructive" | "success" | "warning"> = {
            admin: "destructive",
            inventory_manager: "success",
            warehouse_supervisor: "warning",
            warehouse_staff: "secondary",
            procurement_officer: "default",
            sales_rep: "default",
            finance_officer: "default",
            auditor: "outline",
            it_support: "destructive",
            executive: "success",
        };
        return variants[role] || "default";
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage system users and their access roles</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        System Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((user: any) => (
                                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={getRoleBadge(user.role)}>
                                                {user.role.replace("_", " ").toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={user.isActive ? "success" : "default"}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRoleUpdate(user)}
                                                >
                                                    <Shield className="w-4 h-4 mr-1" />
                                                    Role
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Role Update Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update User Role</DialogTitle>
                        <DialogDescription>
                            Assign a new role to {selectedUser?.firstName} {selectedUser?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-2">
                            {ROLES.map((role) => (
                                <Button
                                    key={role}
                                    variant={selectedUser?.role === role ? "default" : "outline"}
                                    className="justify-start"
                                    onClick={() => updateRoleMutation.mutate({ id: selectedUser._id, role })}
                                    disabled={updateRoleMutation.isPending}
                                >
                                    {role.replace("_", " ").toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                            <p className="text-sm text-gray-600">{selectedUser?.email}</p>
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
                                onClick={() => deleteUserMutation.mutate(selectedUser._id)}
                                disabled={deleteUserMutation.isPending}
                            >
                                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
