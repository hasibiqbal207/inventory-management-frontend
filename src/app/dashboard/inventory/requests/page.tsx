"use client";

import { useState } from "react";
import { useInventoryRequests, useApproveInventoryRequest, useRejectInventoryRequest } from "@/hooks/use-inventory-requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, X, Eye, Clock, AlertCircle, CheckCircle2, XCircle, Calendar, Truck, Globe, Box } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { InventoryRequest, RequestStatus } from "@/types/api";

export default function InventoryRequestsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"]}>
            <InventoryRequestsContent />
        </ProtectedRoute>
    );
}

function InventoryRequestsContent() {
    const { user } = useAuth();
    const { data: requests, isLoading } = useInventoryRequests();
    const approveMutation = useApproveInventoryRequest();
    const rejectMutation = useRejectInventoryRequest();

    const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const canApprove = user?.role === "admin" || user?.role === "inventory_manager" || user?.role === "warehouse_supervisor";

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
            case "APPROVED":
                return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
            case "REJECTED":
                return <Badge variant="danger" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "add":
                return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Add Stock</Badge>;
            case "remove":
                return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Remove Stock</Badge>;
            case "transfer":
                return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Transfer</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    const handleApprove = async (id: string) => {
        await approveMutation.mutateAsync(id);
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason) return;
        await rejectMutation.mutateAsync({ id: selectedRequest._id, reason: rejectionReason });
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedRequest(null);
    };

    const openDetails = (request: InventoryRequest) => {
        setSelectedRequest(request);
        setIsDetailsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and approve stock adjustment requests from warehouse staff.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending & Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left font-medium text-muted-foreground">
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Product</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Quantity</th>
                                    <th className="py-3 px-4">Requested By</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests?.map((request: InventoryRequest) => (
                                    <tr key={request._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium">
                                                {request.productId && typeof request.productId === 'object' ? request.productId.productName : 'Product'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {request.productId && typeof request.productId === 'object' ? request.productId.sku : ''}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getTypeBadge(request.type)}
                                        </td>
                                        <td className="py-3 px-4 font-semibold">
                                            {request.quantity}
                                        </td>
                                        <td className="py-3 px-4">
                                            {request.requestedBy && typeof request.requestedBy === 'object'
                                                ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`
                                                : 'Staff'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {request.status === "PENDING" && canApprove && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleApprove(request._id)}
                                                            disabled={approveMutation.isPending}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setIsRejectDialogOpen(true);
                                                            }}
                                                            disabled={rejectMutation.isPending}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="outline" onClick={() => openDetails(request)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!requests || requests.length === 0) && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                            No inventory requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>
                            Full information for the inventory adjustment request.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Product</Label>
                                    <p className="font-medium">{selectedRequest.productId && typeof selectedRequest.productId === 'object' ? selectedRequest.productId.productName : 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">{selectedRequest.productId && typeof selectedRequest.productId === 'object' ? selectedRequest.productId.sku : ''}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <div>{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Type</Label>
                                    <div>{getTypeBadge(selectedRequest.type)}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                                    <p className="font-bold text-lg">{selectedRequest.quantity} units</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 border-t pt-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Warehouse</Label>
                                    <p className="font-medium">{selectedRequest.warehouseId && typeof selectedRequest.warehouseId === 'object' ? selectedRequest.warehouseId.name : 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Reference / PO</Label>
                                    <p className="font-medium">{selectedRequest.reference}</p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs text-muted-foreground">Reason</Label>
                                    <p className="text-sm bg-muted p-2 rounded">{selectedRequest.reason}</p>
                                </div>
                            </div>

                            {(selectedRequest.expiryDate || selectedRequest.supplier || selectedRequest.origin || selectedRequest.productMaterial) && (
                                <div className="space-y-4 border-t pt-4">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Box className="w-4 h-4" /> Additional Metadata
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedRequest.expiryDate && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                                                    <p className="font-medium">{new Date(selectedRequest.expiryDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.supplier && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Truck className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Supplier</p>
                                                    <p className="font-medium">{selectedRequest.supplier}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.origin && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Globe className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Origin</p>
                                                    <p className="font-medium">{selectedRequest.origin}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.productMaterial && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Box className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Material</p>
                                                    <p className="font-medium">{selectedRequest.productMaterial}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRequest.status === "REJECTED" && (
                                <div className="bg-red-50 border border-red-100 p-3 rounded-md">
                                    <Label className="text-xs text-red-600 font-bold">Rejection Reason</Label>
                                    <p className="text-sm text-red-800">{selectedRequest.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
                        {selectedRequest?.status === "PENDING" && canApprove && (
                            <Button variant="success" onClick={() => {
                                handleApprove(selectedRequest._id);
                                setIsDetailsDialogOpen(false);
                            }}>
                                Approve Now
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this inventory request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Input
                                id="reason"
                                placeholder="e.g. Incorrect quantity, wrong warehouse..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || rejectMutation.isPending}>
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
