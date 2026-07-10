"use client";

import { usePermissionPolicies, useSetPolicy, useResetPolicy } from "@/hooks/use-permission-policies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RotateCcw } from "lucide-react";
import { formatRole } from "@/lib/format";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { PermissionPolicy, UserRole } from "@/types/api";

const ALL_ROLES: UserRole[] = [
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

export default function PermissionsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <PermissionsContent />
        </ProtectedRoute>
    );
}

function PermissionsContent() {
    const { data: policies, isLoading } = usePermissionPolicies();
    const setPolicy = useSetPolicy();
    const resetPolicy = useResetPolicy();

    const toggle = (policy: PermissionPolicy, role: UserRole) => {
        const has = policy.allowedRoles.includes(role);
        const next = has
            ? policy.allowedRoles.filter((r) => r !== role)
            : [...policy.allowedRoles, role];
        setPolicy.mutate({ key: policy.key, allowedRoles: next });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                    Access Policy
                </h1>
                <p className="text-gray-600 mt-1">
                    Configure which roles may perform each action — no code deploy required.
                    Unmodified rows use their built-in default.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Permission Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-gray-500 py-4">Loading…</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 sticky left-0 bg-white">Permission</th>
                                        {ALL_ROLES.map((r) => (
                                            <th key={r} className="py-2 px-2 text-center text-xs font-medium text-gray-600 whitespace-nowrap">
                                                {formatRole(r)}
                                            </th>
                                        ))}
                                        <th className="py-2 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {policies?.map((policy: PermissionPolicy) => (
                                        <tr key={policy.key} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2 px-3 sticky left-0 bg-white">
                                                <span className="font-mono text-xs">{policy.key}</span>
                                                {!policy.isDefault && <Badge variant="warning" className="ml-2 text-xs">custom</Badge>}
                                            </td>
                                            {ALL_ROLES.map((role) => (
                                                <td key={role} className="py-2 px-2 text-center">
                                                    <Checkbox
                                                        checked={policy.allowedRoles.includes(role)}
                                                        onCheckedChange={() => toggle(policy, role)}
                                                        disabled={setPolicy.isPending}
                                                    />
                                                </td>
                                            ))}
                                            <td className="py-2 px-2 text-right">
                                                {!policy.isDefault && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => resetPolicy.mutate(policy.key)}
                                                        title="Reset to default"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
