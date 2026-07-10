"use client";

import { useState } from "react";
import { useReturns, useCreateReturn, useReturnAction } from "@/hooks/use-returns";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { RotateCcw, Plus, Check, X, PackageCheck, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type {
    ReturnRMA,
    ReturnStatus,
    ReturnType,
    ReturnDisposition,
    CreateReturnDTO,
    Product,
} from "@/types/api";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ReturnsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "sales_rep", "procurement_officer", "auditor", "executive"]}>
            <ReturnsPageContent />
        </ProtectedRoute>
    );
}

const STATUS_VARIANT: Record<ReturnStatus, "default" | "warning" | "success" | "danger" | "outline"> = {
    requested: "warning",
    approved: "default",
    received: "default",
    completed: "success",
    rejected: "danger",
    cancelled: "outline",
};

function ReturnsPageContent() {
    const { canManageReturns, canReceiveReturns } = usePermissions();
    const [statusFilter, setStatusFilter] = useState<ReturnStatus | "all">("all");
    const { data: returns, isLoading } = useReturns(
        statusFilter === "all" ? undefined : { status: statusFilter }
    );
    const createReturn = useCreateReturn();
    const action = useReturnAction();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<ReturnRMA | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const productName = (p: string | Product) => (typeof p === "object" ? p.productName : "Product");
    const partyName = (rma: ReturnRMA) => {
        if (rma.returnType === "customer" && rma.customerId && typeof rma.customerId === "object") {
            return `${rma.customerId.firstName} ${rma.customerId.lastName}`;
        }
        if (rma.returnType === "supplier" && rma.supplierId && typeof rma.supplierId === "object") {
            return rma.supplierId.companyName;
        }
        return "—";
    };

    const handleReject = () => {
        if (!rejectTarget || !rejectReason.trim()) return;
        action.mutate(
            { id: rejectTarget._id, action: "reject", reason: rejectReason.trim() },
            {
                onSuccess: () => {
                    setRejectTarget(null);
                    setRejectReason("");
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <RotateCcw className="w-7 h-7 text-blue-600" />
                        Returns &amp; RMA
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Authorize, receive, and restock customer &amp; supplier returns.
                    </p>
                </div>
                {canManageReturns && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Return
                    </Button>
                )}
            </div>

            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="max-w-xs">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | "all")}
                        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
            ) : returns && returns.length > 0 ? (
                <div className="space-y-4">
                    {returns.map((rma) => (
                        <Card key={rma._id} className="border-gray-200">
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900">{rma.rmaNumber}</h3>
                                            <Badge variant={STATUS_VARIANT[rma.status]}>{rma.status.toUpperCase()}</Badge>
                                            <Badge variant="outline" className="capitalize">{rma.returnType}</Badge>
                                            {rma.restocked && (
                                                <Badge variant="success" className="flex items-center gap-1">
                                                    <PackageCheck className="w-3 h-3" /> Restocked
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium text-gray-700">Party:</span> {partyName(rma)}</p>
                                            <p><span className="font-medium text-gray-700">Reason:</span> {rma.reason}</p>
                                            <p><span className="font-medium text-gray-700">Created:</span> {formatDate(rma.createdAt)}</p>
                                            {rma.rejectionReason && (
                                                <p className="text-red-600"><span className="font-medium">Rejected:</span> {rma.rejectionReason}</p>
                                            )}
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            {rma.items.map((it, i) => (
                                                <div key={i} className="text-sm flex items-center gap-2 text-gray-700">
                                                    <span className="font-medium">{it.quantity}×</span>
                                                    <span>{productName(it.productId)}</span>
                                                    <Badge variant="outline" className="capitalize text-xs">{it.disposition}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap md:flex-col gap-2 min-w-[150px]">
                                        {rma.status === "requested" && canManageReturns && (
                                            <>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full justify-start"
                                                    onClick={() => action.mutate({ id: rma._id, action: "approve" })}
                                                    disabled={action.isPending}>
                                                    <Check className="w-4 h-4 mr-2" /> Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" className="w-full justify-start"
                                                    onClick={() => setRejectTarget(rma)}
                                                    disabled={action.isPending}>
                                                    <X className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {rma.status === "approved" && canReceiveReturns && (
                                            <Button size="sm" className="w-full justify-start"
                                                onClick={() => action.mutate({ id: rma._id, action: "receive" })}
                                                disabled={action.isPending}>
                                                <PackageCheck className="w-4 h-4 mr-2" /> Receive
                                            </Button>
                                        )}
                                        {rma.status === "received" && canManageReturns && (
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full justify-start"
                                                onClick={() => action.mutate({ id: rma._id, action: "complete" })}
                                                disabled={action.isPending}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                                            </Button>
                                        )}
                                        {(rma.status === "requested" || rma.status === "approved") && canManageReturns && (
                                            <Button size="sm" variant="outline" className="w-full justify-start"
                                                onClick={() => action.mutate({ id: rma._id, action: "cancel" })}
                                                disabled={action.isPending}>
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <RotateCcw className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No returns found</h3>
                    <p className="text-gray-500">Create an RMA when a customer or supplier return comes in.</p>
                </div>
            )}

            <CreateReturnDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={(data) => createReturn.mutate(data, { onSuccess: () => setIsCreateOpen(false) })}
                isSubmitting={createReturn.isPending}
            />

            {/* Reject reason dialog */}
            <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Return {rejectTarget?.rmaNumber}</DialogTitle>
                        <DialogDescription>Provide a reason for rejecting this return.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-2">
                        <Label htmlFor="rejectReason">Reason</Label>
                        <Input
                            id="rejectReason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Outside return window, item not as described..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || action.isPending}>
                            Reject Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CreateReturnDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSubmit: (data: CreateReturnDTO) => void;
    isSubmitting: boolean;
}) {
    const { data: products } = useProducts();
    const { data: warehouses } = useWarehouses();

    const [returnType, setReturnType] = useState<ReturnType>("customer");
    const [warehouseId, setWarehouseId] = useState("");
    const [reason, setReason] = useState("");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [disposition, setDisposition] = useState<ReturnDisposition>("restock");

    const reset = () => {
        setReturnType("customer");
        setWarehouseId("");
        setReason("");
        setProductId("");
        setQuantity(1);
        setDisposition("restock");
    };

    const valid = warehouseId && reason.trim() && productId && quantity > 0;

    const submit = () => {
        if (!valid) return;
        onSubmit({
            returnType,
            warehouseId,
            reason: reason.trim(),
            items: [{ productId, quantity, disposition }],
        });
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>New Return (RMA)</DialogTitle>
                    <DialogDescription>Create a return authorization for an incoming return.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Return Type</Label>
                            <select value={returnType} onChange={(e) => setReturnType(e.target.value as ReturnType)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                <option value="customer">Customer</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Warehouse *</Label>
                            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                <option value="">Select…</option>
                                {warehouses?.map((w) => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Reason *</Label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Defective on arrival" />
                    </div>

                    <div className="border-t pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Return item</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 col-span-2">
                                <Label>Product *</Label>
                                <select value={productId} onChange={(e) => setProductId(e.target.value)}
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                    <option value="">Select…</option>
                                    {products?.map((p) => (
                                        <option key={p._id} value={p._id}>{p.productName} ({p.sku})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Quantity *</Label>
                                <Input type="number" min={1} value={quantity || ""}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Disposition</Label>
                                <select value={disposition} onChange={(e) => setDisposition(e.target.value as ReturnDisposition)}
                                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                    <option value="restock">Restock</option>
                                    <option value="quarantine">Quarantine</option>
                                    <option value="scrap">Scrap</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Restock adds the item back to inventory when the return is received.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={!valid || isSubmitting}>
                        {isSubmitting ? "Creating…" : "Create RMA"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
