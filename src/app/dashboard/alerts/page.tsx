"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsService } from "@/services/alerts.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AlertsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const { data: alerts, isLoading } = useQuery({
        queryKey: ["alerts", filter],
        queryFn: () => alertsService.getAll(filter === "unread" ? { isRead: false } : undefined),
    });

    const markAsRead = useMutation({
        mutationFn: (id: string) => alertsService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alert marked as read");
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: () => alertsService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("All alerts marked as read");
        },
    });

    const deleteAlert = useMutation({
        mutationFn: (id: string) => alertsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alert deleted");
        },
    });

    const getAlertIcon = (type: string, severity: string) => {
        if (severity === "critical") return <XCircle className="w-5 h-5 text-red-600" />;
        if (severity === "high") return <AlertTriangle className="w-5 h-5 text-orange-600" />;
        if (severity === "medium") return <Info className="w-5 h-5 text-yellow-600" />;
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    };

    const getSeverityBadge = (severity: string) => {
        const variants: Record<string, "danger" | "warning" | "default"> = {
            critical: "danger",
            high: "danger",
            medium: "warning",
            low: "default",
        };
        return variants[severity] || "default";
    };

    const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
                            <Check className="w-4 h-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                >
                    All Alerts
                </Button>
                <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    onClick={() => setFilter("unread")}
                >
                    Unread ({unreadCount})
                </Button>
            </div>

            {/* Alerts List */}
            {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <Card
                            key={alert._id}
                            className={`${!alert.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {getAlertIcon(alert.type, alert.severity)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getSeverityBadge(alert.severity)}>
                                                    {alert.severity}
                                                </Badge>
                                                {!alert.isRead && (
                                                    <Badge variant="default">New</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <span>{formatDate(alert.createdAt)}</span>
                                            </div>

                                            <div className="flex gap-2">
                                                {!alert.isRead && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => markAsRead.mutate(alert._id)}
                                                    >
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteAlert.mutate(alert._id)}
                                                >
                                                    Dismiss
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filter === "unread" ? "No unread alerts" : "No alerts"}
                    </h3>
                    <p className="text-gray-600">
                        {filter === "unread"
                            ? "You're all caught up!"
                            : "Alerts will appear here when there are important updates"}
                    </p>
                </div>
            )}
        </div>
    );
}
