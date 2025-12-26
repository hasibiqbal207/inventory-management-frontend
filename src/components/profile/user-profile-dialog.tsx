"use client";

import { useAuth } from "@/contexts/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRole, formatDate } from "@/lib/format";
import { User, Mail, Calendar, Shield, CheckCircle, XCircle } from "lucide-react";

interface UserProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
    const { user } = useAuth();

    if (!user) return null;

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "admin":
                return "destructive";
            case "inventory_manager":
            case "warehouse_supervisor":
                return "default";
            default:
                return "secondary";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">User Profile</DialogTitle>
                    <DialogDescription>
                        View your account information and details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* User Avatar and Name */}
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground">
                                {user.firstName} {user.lastName}
                            </h3>
                            <Badge
                                variant={getRoleBadgeVariant(user.role)}
                                className="mt-1"
                            >
                                {formatRole(user.role)}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* User Details */}
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Email Address
                                </p>
                                <p className="text-sm text-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    User ID
                                </p>
                                <p className="text-sm text-foreground font-mono">{user._id}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Account Status
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    {user.isActive ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                Inactive
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Member Since
                                </p>
                                <p className="text-sm text-foreground">
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Last Updated
                                </p>
                                <p className="text-sm text-foreground">
                                    {formatDate(user.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
