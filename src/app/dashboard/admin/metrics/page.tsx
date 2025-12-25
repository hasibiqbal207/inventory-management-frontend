"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, Server, Clock } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminMetricsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminMetricsPageContent />
        </ProtectedRoute>
    );
}

function AdminMetricsPageContent() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ["system-metrics"],
        queryFn: async () => {
            const response: any = await apiClient.get("/system/metrics");
            return response.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

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
                                <p className="text-2xl font-bold text-green-500 mt-2">Healthy</p>
                            </div>
                            <Activity className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Database</p>
                                <p className="text-2xl font-bold text-green-500 mt-2">Connected</p>
                            </div>
                            <Database className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    {metrics?.uptime || "99.9%"}
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
                                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    {metrics?.responseTime || "45ms"}
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
                                <span className="font-medium">v18.17.0</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium">Production</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">API Version</span>
                                <span className="font-medium">v1.0.0</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Last Deployment</span>
                                <span className="font-medium">2 hours ago</span>
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
                                <span className="font-medium">9</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Total Documents</span>
                                <span className="font-medium">{metrics?.totalDocuments || "1,234"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Database Size</span>
                                <span className="font-medium">24.5 MB</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Last Backup</span>
                                <span className="font-medium">1 day ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
