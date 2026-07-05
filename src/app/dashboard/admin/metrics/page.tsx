"use client";

import { useQuery } from "@tanstack/react-query";
import { systemService } from "@/services/system.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Server, Clock } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";

function formatBytes(bytes: number): string {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function formatUptime(seconds: number): string {
    if (!seconds) return "0m";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export default function AdminMetricsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "it_support"]}>
            <AdminMetricsPageContent />
        </ProtectedRoute>
    );
}

function AdminMetricsPageContent() {
    const { data: health, isLoading: healthLoading } = useQuery({
        queryKey: ["system-health"],
        queryFn: () => systemService.getHealth(),
        refetchInterval: 30000,
    });

    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ["system-metrics"],
        queryFn: () => systemService.getMetrics(),
        refetchInterval: 30000,
    });

    const isLoading = healthLoading || metricsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isHealthy = health?.status === "healthy";
    const dbConnected = metrics?.database.status === "connected";

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">System Metrics</h1>
                <p className="text-muted-foreground mt-1">Monitor system performance and health</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">API Status</p>
                                <p className={`text-2xl font-bold mt-2 ${isHealthy ? "text-green-500" : "text-red-500"}`}>
                                    {health?.status ? health.status.charAt(0).toUpperCase() + health.status.slice(1) : "Unknown"}
                                </p>
                            </div>
                            <Activity className={`w-8 h-8 ${isHealthy ? "text-green-500" : "text-red-500"}`} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Database</p>
                                <p className={`text-2xl font-bold mt-2 ${dbConnected ? "text-green-500" : "text-red-500"}`}>
                                    {dbConnected ? "Connected" : "Disconnected"}
                                </p>
                            </div>
                            <Database className={`w-8 h-8 ${dbConnected ? "text-green-500" : "text-red-500"}`} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    {formatUptime(metrics?.uptimeSeconds || 0)}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">DB Response Time</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    {metrics?.database.responseTimeMs ?? 0}ms
                                </p>
                            </div>
                            <Server className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Node Version</span>
                                <span className="font-medium">{metrics?.nodeVersion || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium capitalize">{metrics?.environment || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">API Version</span>
                                <span className="font-medium">{metrics?.apiVersion || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Memory Usage</span>
                                <span className="font-medium">
                                    {metrics ? `${formatBytes(metrics.memory.usedBytes)} / ${formatBytes(metrics.memory.totalBytes)}` : "—"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Database Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Collections</span>
                                <span className="font-medium">{metrics?.database.collections ?? "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Documents</span>
                                <span className="font-medium">{metrics?.database.documents?.toLocaleString() ?? "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Database Size</span>
                                <span className="font-medium">{metrics ? formatBytes(metrics.database.dataSizeBytes) : "—"}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Low Stock Items</span>
                                <span className="font-medium">{metrics?.lowStockItems ?? "—"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
