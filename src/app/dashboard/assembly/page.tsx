"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useBuildable, useAssemble } from "@/hooks/use-assembly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Hammer, Package, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Product } from "@/types/api";

export default function AssemblyPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor"]}>
            <AssemblyPageContent />
        </ProtectedRoute>
    );
}

function AssemblyPageContent() {
    const { data: products } = useProducts();
    const { data: warehouses } = useWarehouses();
    const [kitId, setKitId] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [quantity, setQuantity] = useState(1);

    const kits = (products ?? []).filter(
        (p: Product) => p.productType === "kit" || p.productType === "bundle"
    );

    const { data: buildable, isLoading: buildableLoading } = useBuildable(kitId || undefined, warehouseId || undefined);
    const assemble = useAssemble();

    const canBuild = !!kitId && !!warehouseId && quantity > 0;
    const overCapacity = !!buildable && quantity > buildable.buildableQuantity;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Hammer className="w-7 h-7 text-blue-600" />
                    Kit Assembly
                </h1>
                <p className="text-gray-600 mt-1">
                    Build kits from their components (or break them back down). Assembly
                    consumes component stock and produces finished kit stock.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Kit &amp; Warehouse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kit / Bundle</label>
                            <select
                                value={kitId}
                                onChange={(e) => setKitId(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a kit…</option>
                                {kits.map((k) => (
                                    <option key={k._id} value={k._id}>
                                        {k.productName} ({k.sku})
                                    </option>
                                ))}
                            </select>
                            {kits.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No kit/bundle products yet — set a product&apos;s type to Kit on the Products page.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Warehouse</label>
                            <select
                                value={warehouseId}
                                onChange={(e) => setWarehouseId(e.target.value)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a warehouse…</option>
                                {warehouses?.map((w) => (
                                    <option key={w._id} value={w._id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quantity</label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {kitId && warehouseId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Component Availability</span>
                            {buildable && (
                                <Badge variant={buildable.buildableQuantity > 0 ? "success" : "danger"}>
                                    {buildable.buildableQuantity} buildable
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {buildableLoading ? (
                            <p className="text-gray-500 py-4">Loading…</p>
                        ) : buildable && buildable.components.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-left text-gray-500">
                                            <th className="py-2 px-3">Component</th>
                                            <th className="py-2 px-3 text-right">Required / kit</th>
                                            <th className="py-2 px-3 text-right">On hand</th>
                                            <th className="py-2 px-3 text-right">Builds</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {buildable.components.map((c) => (
                                            <tr key={c.componentProductId} className="border-b border-gray-100">
                                                <td className="py-2 px-3">
                                                    <span className="font-medium text-gray-900">{c.productName ?? "Component"}</span>
                                                    {c.sku && <span className="text-xs text-gray-500 ml-2">{c.sku}</span>}
                                                </td>
                                                <td className="py-2 px-3 text-right">{c.required}</td>
                                                <td className="py-2 px-3 text-right">{c.available}</td>
                                                <td className={`py-2 px-3 text-right font-semibold ${c.buildableFromThis < quantity ? "text-red-600" : "text-green-600"}`}>
                                                    {c.buildableFromThis}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 py-4 flex items-center gap-2">
                                <Package className="w-5 h-5" /> No component data.
                            </p>
                        )}

                        {overCapacity && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
                                <AlertTriangle className="w-4 h-4" />
                                Only {buildable?.buildableQuantity} unit(s) can be built with current stock.
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => assemble.mutate({ kitProductId: kitId, warehouseId, quantity })}
                                disabled={!canBuild || overCapacity || assemble.isPending}
                            >
                                <Hammer className="w-4 h-4 mr-2" />
                                Assemble {quantity}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => assemble.mutate({ kitProductId: kitId, warehouseId, quantity, disassemble: true })}
                                disabled={!canBuild || assemble.isPending}
                            >
                                Disassemble {quantity}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
