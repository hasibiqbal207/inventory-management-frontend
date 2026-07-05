"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "@/services/audit-log.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

import { ProtectedRoute } from "@/components/auth/protected-route";

const ENTITY_TYPES = ["Product", "Category", "Warehouse", "Supplier", "Order", "Settings", "User"];
const ACTIONS = ["create", "update", "delete"] as const;

export default function AuditLogPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "auditor", "it_support"]}>
            <AuditLogPageContent />
        </ProtectedRoute>
    );
}

function AuditLogPageContent() {
    const [entityType, setEntityType] = useState<string>("");
    const [action, setAction] = useState<string>("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs", { entityType, action, page }],
        queryFn: () =>
            auditLogService.getAll({
                entityType: entityType || undefined,
                action: action || undefined,
                page,
                limit: 25,
            }),
    });

    const actionVariant = (a: string) =>
        a === "create" ? "success" : a === "delete" ? "destructive" : "default";

    const performedByLabel = (performedBy: any) => {
        if (!performedBy) return "System";
        if (typeof performedBy === "string") return performedBy;
        return `${performedBy.firstName} ${performedBy.lastName}`;
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
                <p className="text-gray-600 mt-1">
                    Who changed what, across every entity — not just stock movements (see the Inventory
                    module for the dedicated stock ledger).
                </p>
            </div>

            <div className="flex gap-3 mb-6">
                <select
                    value={entityType}
                    onChange={(e) => {
                        setEntityType(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All entity types</option>
                    {ENTITY_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
                <select
                    value={action}
                    onChange={(e) => {
                        setAction(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                    <option value="">All actions</option>
                    {ACTIONS.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">When</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Entity</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Performed By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.logs.map((log) => (
                                        <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-600">{formatDateTime(log.createdAt)}</td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{log.entityType}</p>
                                                <p className="text-xs text-gray-500">{log.entityId}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {performedByLabel(log.performedBy)}
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.logs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                No audit log entries found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {data && data.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                        Page {data.page} of {data.totalPages} ({data.total} entries)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= data.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
