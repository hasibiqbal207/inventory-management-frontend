"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useProductBatches, useExpiringBatches } from "@/hooks/use-batches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, AlertTriangle, Package, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Batch, BatchStatus, Product, Warehouse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function BatchesPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "auditor", "executive"]}>
            <BatchesPageContent />
        </ProtectedRoute>
    );
}

function statusBadge(status: BatchStatus) {
    switch (status) {
        case "active":
            return <Badge variant="success">Active</Badge>;
        case "depleted":
            return <Badge variant="outline">Depleted</Badge>;
        case "expired":
            return <Badge variant="danger">Expired</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
}

/** Days until (negative = past) a given ISO date, or null when no date. */
function daysUntil(iso?: string): number | null {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - Date.now();
    return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function expiryLabel(iso?: string) {
    const d = daysUntil(iso);
    if (d === null) return <span className="text-gray-400">No expiry</span>;
    if (d < 0) return <span className="text-red-600 font-semibold">Expired {Math.abs(d)}d ago</span>;
    if (d <= 7) return <span className="text-red-600 font-semibold">In {d}d</span>;
    if (d <= 30) return <span className="text-yellow-600 font-medium">In {d}d</span>;
    return <span className="text-gray-600">In {d}d</span>;
}

function BatchesPageContent() {
    const { data: products } = useProducts();
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [includeDepleted, setIncludeDepleted] = useState(false);

    const { data: expiring, isLoading: expiringLoading } = useExpiringBatches(30);
    const { data: batches, isLoading: batchesLoading } = useProductBatches(
        selectedProduct || undefined,
        undefined,
        includeDepleted
    );

    const productName = (p: string | Product | undefined) =>
        p && typeof p === "object" ? p.productName : "Product";
    const warehouseName = (w: string | Warehouse | undefined) =>
        w && typeof w === "object" ? w.name : "—";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-7 h-7 text-blue-600" />
                    Batch &amp; Lot Tracking
                </h1>
                <p className="text-gray-600 mt-1">
                    Lot-level stock with FEFO (first-expired-first-out) allocation.
                </p>
            </div>

            {/* Expiring soon */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Expiring Within 30 Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {expiringLoading ? (
                        <p className="text-gray-500 py-4">Loading…</p>
                    ) : expiring && expiring.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500">
                                        <th className="py-2 px-3">Product</th>
                                        <th className="py-2 px-3">Lot</th>
                                        <th className="py-2 px-3">Warehouse</th>
                                        <th className="py-2 px-3 text-right">Remaining</th>
                                        <th className="py-2 px-3">Expires</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expiring.map((b: Batch) => (
                                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-3 font-medium text-gray-900">{productName(b.productId)}</td>
                                            <td className="py-2 px-3 font-mono text-xs">{b.lotNumber}</td>
                                            <td className="py-2 px-3">{warehouseName(b.warehouseId)}</td>
                                            <td className="py-2 px-3 text-right font-semibold">{b.quantityRemaining}</td>
                                            <td className="py-2 px-3">
                                                {b.expiryDate ? formatDate(b.expiryDate) : "—"}{" "}
                                                <span className="ml-1 text-xs">({expiryLabel(b.expiryDate)})</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 py-6">
                            <Clock className="w-5 h-5" />
                            No lots expiring in the next 30 days.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Per-product lot lookup */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Lots by Product
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[240px]">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Product</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a product…</option>
                                {products?.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.productName} ({p.sku})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 h-10">
                            <input
                                type="checkbox"
                                checked={includeDepleted}
                                onChange={(e) => setIncludeDepleted(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Show depleted / expired
                        </label>
                    </div>

                    {!selectedProduct ? (
                        <p className="text-gray-500 py-6 text-center">Pick a product to see its lots.</p>
                    ) : batchesLoading ? (
                        <p className="text-gray-500 py-4">Loading…</p>
                    ) : batches && batches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500">
                                        <th className="py-2 px-3">Lot</th>
                                        <th className="py-2 px-3">Warehouse</th>
                                        <th className="py-2 px-3 text-right">Received</th>
                                        <th className="py-2 px-3 text-right">Remaining</th>
                                        <th className="py-2 px-3">Expiry</th>
                                        <th className="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.map((b: Batch) => (
                                        <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-3 font-mono text-xs">{b.lotNumber}</td>
                                            <td className="py-2 px-3">{warehouseName(b.warehouseId)}</td>
                                            <td className="py-2 px-3 text-right">{b.quantityReceived}</td>
                                            <td className="py-2 px-3 text-right font-semibold">{b.quantityRemaining}</td>
                                            <td className="py-2 px-3">
                                                {b.expiryDate ? formatDate(b.expiryDate) : "—"}
                                                {b.expiryDate && <span className="ml-2 text-xs">({expiryLabel(b.expiryDate)})</span>}
                                            </td>
                                            <td className="py-2 px-3">{statusBadge(b.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 py-6 text-center">No lots found for this product.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
