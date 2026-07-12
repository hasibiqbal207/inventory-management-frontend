"use client";

import { useState, useRef, useEffect } from "react";
import { inventoryService } from "@/services/inventory.service";
import { useAddStock, useRemoveStock } from "@/hooks/use-inventory";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Plus, Minus, Package, X } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Warehouse } from "@/types/api";

export default function ScanPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"]}>
            <ScanContent />
        </ProtectedRoute>
    );
}

interface ScannedProduct {
    _id: string;
    productName: string;
    sku: string;
    category: string;
    quantity: number | null;
}

function ScanContent() {
    const { data: warehouses } = useWarehouses();
    const [warehouseId, setWarehouseId] = useState("");
    const [code, setCode] = useState("");
    const [scanned, setScanned] = useState<ScannedProduct | null>(null);
    const [qty, setQty] = useState(1);
    const [looking, setLooking] = useState(false);
    const codeRef = useRef<HTMLInputElement>(null);

    const addStock = useAddStock();
    const removeStock = useRemoveStock();

    // Keep focus on the code box so a physical scanner (which types + Enter)
    // works without tapping.
    useEffect(() => {
        codeRef.current?.focus();
    }, [scanned]);

    const lookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        if (!warehouseId) {
            toast.error("Select a warehouse first");
            return;
        }
        setLooking(true);
        try {
            const result = await inventoryService.scan(code.trim(), warehouseId);
            setScanned({ ...result.product, quantity: result.quantity });
            setQty(1);
            setCode("");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Product not found"));
            setScanned(null);
            setCode("");
        } finally {
            setLooking(false);
        }
    };

    const adjust = async (direction: "add" | "remove") => {
        if (!scanned || !warehouseId) return;
        const common = {
            productId: scanned._id,
            warehouseId,
            quantity: qty,
            reason: `Scan ${direction}`,
            reference: `SCAN-${scanned.sku}`,
        };
        try {
            if (direction === "add") {
                await addStock.mutateAsync(common);
            } else {
                await removeStock.mutateAsync(common);
            }
            // Refresh the on-hand shown after the adjustment.
            const refreshed = await inventoryService.scan(scanned.sku, warehouseId);
            setScanned({ ...refreshed.product, quantity: refreshed.quantity });
            setQty(1);
        } catch {
            // mutation hooks surface their own toast
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <ScanLine className="w-6 h-6 text-blue-600" />
                    Scan &amp; Adjust
                </h1>
                <p className="text-gray-600 text-sm mt-1">Scan or type a barcode/SKU to adjust stock.</p>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Warehouse</label>
                <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-base"
                >
                    <option value="">Select a warehouse…</option>
                    {warehouses?.map((w: Warehouse) => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                </select>
            </div>

            <form onSubmit={lookup}>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Barcode / SKU</label>
                <div className="flex gap-2">
                    <Input
                        ref={codeRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Scan or type…"
                        className="h-12 text-base"
                        inputMode="text"
                        autoComplete="off"
                    />
                    <Button type="submit" className="h-12 px-6" disabled={looking || !code.trim()}>
                        Go
                    </Button>
                </div>
            </form>

            {scanned && (
                <Card className="border-blue-200">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <Package className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{scanned.productName}</p>
                                    <p className="text-sm text-gray-500">{scanned.sku} · {scanned.category}</p>
                                </div>
                            </div>
                            <button onClick={() => setScanned(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center bg-gray-50 rounded-lg py-4">
                            <p className="text-xs uppercase text-gray-500 font-bold">On hand</p>
                            <p className="text-4xl font-black text-gray-900">
                                {scanned.quantity ?? 0}
                            </p>
                        </div>

                        {/* Big quantity stepper for touch. */}
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" className="h-14 w-14 text-2xl" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
                            <Input
                                type="number"
                                min="1"
                                value={qty}
                                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                className="h-14 w-24 text-center text-2xl font-bold"
                            />
                            <Button variant="outline" className="h-14 w-14 text-2xl" onClick={() => setQty((q) => q + 1)}>+</Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                className="h-14 text-lg bg-green-600 hover:bg-green-700"
                                onClick={() => adjust("add")}
                                disabled={addStock.isPending}
                            >
                                <Plus className="w-5 h-5 mr-1" /> Add {qty}
                            </Button>
                            <Button
                                className="h-14 text-lg bg-red-600 hover:bg-red-700"
                                onClick={() => adjust("remove")}
                                disabled={removeStock.isPending || (scanned.quantity ?? 0) < qty}
                            >
                                <Minus className="w-5 h-5 mr-1" /> Remove {qty}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
