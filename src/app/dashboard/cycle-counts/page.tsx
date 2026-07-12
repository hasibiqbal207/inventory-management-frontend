"use client";

import { useState } from "react";
import {
    useCycleCounts,
    useCycleCount,
    useCreateCycleCount,
    useRecordCount,
    useCompleteCycleCount,
    useClassification,
} from "@/hooks/use-cycle-count";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Play, CheckCircle2, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { CycleCount, CycleCountItem, Product, Warehouse, SkuClassification } from "@/types/api";

export default function CycleCountsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "auditor", "executive"]}>
            <CycleCountsContent />
        </ProtectedRoute>
    );
}

function statusBadge(status: string) {
    if (status === "open") return <Badge variant="warning">Open</Badge>;
    if (status === "completed") return <Badge variant="success">Completed</Badge>;
    return <Badge variant="default">Cancelled</Badge>;
}

function CycleCountsContent() {
    const { data: warehouses } = useWarehouses();
    const { data: sessions } = useCycleCounts();
    const createCount = useCreateCycleCount();
    const completeCount = useCompleteCycleCount();

    const [newWarehouse, setNewWarehouse] = useState("");
    const [activeId, setActiveId] = useState<string>("");

    const start = () => {
        if (!newWarehouse) return;
        createCount.mutate({ warehouseId: newWarehouse }, { onSuccess: (s) => setActiveId(s._id) });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="w-7 h-7 text-blue-600" />
                    Cycle Counting
                </h1>
                <p className="text-gray-600 mt-1">
                    Reconcile physical stock against the ledger without a full shutdown, and
                    focus effort with ABC/XYZ classification.
                </p>
            </div>

            {/* Start a session */}
            <Card>
                <CardHeader>
                    <CardTitle>Start a Count</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[240px]">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Warehouse</label>
                            <select
                                value={newWarehouse}
                                onChange={(e) => setNewWarehouse(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                            >
                                <option value="">Select a warehouse…</option>
                                {warehouses?.map((w: Warehouse) => (
                                    <option key={w._id} value={w._id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={start} disabled={!newWarehouse || createCount.isPending}>
                            <Play className="w-4 h-4 mr-1" /> Start count
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sessions list */}
            <Card>
                <CardHeader>
                    <CardTitle>Count Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions && sessions.length > 0 ? (
                        <div className="space-y-2">
                            {sessions.map((s: CycleCount) => (
                                <div
                                    key={s._id}
                                    className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${activeId === s._id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                                    onClick={() => setActiveId(s._id)}
                                >
                                    <div>
                                        <span className="font-mono text-sm font-medium">{s.reference}</span>
                                        <span className="text-sm text-gray-500 ml-3">
                                            {typeof s.warehouseId === "object" ? s.warehouseId.name : ""}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-3">{formatDate(s.createdAt)}</span>
                                    </div>
                                    {statusBadge(s.status)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-4 text-center">No count sessions yet.</p>
                    )}
                </CardContent>
            </Card>

            {activeId && <SessionDetail sessionId={activeId} onComplete={() => completeCount.mutate(activeId)} completing={completeCount.isPending} />}

            <ClassificationReport />
        </div>
    );
}

function SessionDetail({ sessionId, onComplete, completing }: { sessionId: string; onComplete: () => void; completing: boolean }) {
    const { data: session } = useCycleCount(sessionId);
    const recordCount = useRecordCount(sessionId);
    const [counts, setCounts] = useState<Record<string, string>>({});

    if (!session) return null;
    const isOpen = session.status === "open";

    const productName = (p: string | Product) => (typeof p === "object" ? p.productName : "Product");
    const productSku = (p: string | Product) => (typeof p === "object" ? p.sku : "");
    const productId = (p: string | Product) => (typeof p === "object" ? p._id : p);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="font-mono">{session.reference}</span>
                    {isOpen && (
                        <Button size="sm" onClick={onComplete} disabled={completing}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete &amp; reconcile
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-gray-500">
                                <th className="py-2 px-3">Product</th>
                                <th className="py-2 px-3 text-right">System</th>
                                <th className="py-2 px-3 text-right">Counted</th>
                                <th className="py-2 px-3 text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {session.items.map((item: CycleCountItem) => {
                                const pid = productId(item.productId);
                                return (
                                    <tr key={pid} className="border-b border-gray-100">
                                        <td className="py-2 px-3">
                                            <span className="font-medium text-gray-900">{productName(item.productId)}</span>
                                            <span className="text-xs text-gray-500 ml-2">{productSku(item.productId)}</span>
                                        </td>
                                        <td className="py-2 px-3 text-right">{item.systemQuantity}</td>
                                        <td className="py-2 px-3 text-right">
                                            {isOpen ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="w-24"
                                                        value={counts[pid] ?? (item.countedQuantity ?? "")}
                                                        onChange={(e) => setCounts({ ...counts, [pid]: e.target.value })}
                                                        onBlur={() => {
                                                            const v = counts[pid];
                                                            if (v !== undefined && v !== "") {
                                                                recordCount.mutate({ productId: pid, countedQuantity: parseInt(v) });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                item.countedQuantity ?? "—"
                                            )}
                                        </td>
                                        <td className={`py-2 px-3 text-right font-semibold ${item.variance ? (item.variance > 0 ? "text-green-600" : "text-red-600") : "text-gray-400"}`}>
                                            {item.counted && item.variance !== undefined ? (item.variance > 0 ? `+${item.variance}` : item.variance) : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

function abcBadge(cls: string) {
    const color = cls === "A" ? "danger" : cls === "B" ? "warning" : "default";
    return <Badge variant={color}>{cls}</Badge>;
}

function ClassificationReport() {
    const { data: rows, isLoading } = useClassification(12);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    ABC / XYZ Classification (last 12 months)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-gray-500 py-4">Loading…</p>
                ) : rows && rows.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-gray-500">
                                    <th className="py-2 px-3">Product</th>
                                    <th className="py-2 px-3 text-right">Units used</th>
                                    <th className="py-2 px-3 text-right">Value</th>
                                    <th className="py-2 px-3 text-right">Value %</th>
                                    <th className="py-2 px-3 text-center">ABC</th>
                                    <th className="py-2 px-3 text-right">CV</th>
                                    <th className="py-2 px-3 text-center">XYZ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r: SkuClassification) => (
                                    <tr key={r.productId} className="border-b border-gray-100">
                                        <td className="py-2 px-3">
                                            <span className="font-medium text-gray-900">{r.productName ?? "Product"}</span>
                                            <span className="text-xs text-gray-500 ml-2">{r.sku}</span>
                                        </td>
                                        <td className="py-2 px-3 text-right">{r.consumptionUnits}</td>
                                        <td className="py-2 px-3 text-right">{r.consumptionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="py-2 px-3 text-right">{(r.valueShare * 100).toFixed(1)}%</td>
                                        <td className="py-2 px-3 text-center">{abcBadge(r.abc)}</td>
                                        <td className="py-2 px-3 text-right">{r.cv.toFixed(2)}</td>
                                        <td className="py-2 px-3 text-center"><Badge variant="outline">{r.xyz}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 py-6 text-center">
                        No consumption history yet — classification needs stock removals to analyse.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
