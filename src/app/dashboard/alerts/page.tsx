"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { alertsService } from "@/services/alerts.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Check, Search, CheckCheck, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AlertsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"]}>
            <AlertsPageContent />
        </ProtectedRoute>
    );
}

function AlertsPageContent() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchTerm);

    const filterKey = `${filter}|${debouncedSearch}`;
    const [lastFilterKey, setLastFilterKey] = useState(filterKey);
    if (filterKey !== lastFilterKey) {
        setLastFilterKey(filterKey);
        setPage(1);
    }

    const { data: alertsPage, isLoading } = useQuery({
        queryKey: ["alerts", "paginated", filter, debouncedSearch, page],
        queryFn: () =>
            alertsService.getPaginated({
                page,
                limit: 20,
                search: debouncedSearch || undefined,
                ...(filter === "unread" ? { status: "active" } : {}),
            }),
        placeholderData: keepPreviousData,
    });
    const alerts = alertsPage?.data;
    const pagination = alertsPage?.pagination;

    const acknowledgeAlert = useMutation({
        mutationFn: (id: string) => alertsService.acknowledge(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alert acknowledged");
        },
    });

    const resolveAlert = useMutation({
        mutationFn: (id: string) => alertsService.resolve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alert resolved");
        },
    });

    const deleteAlert = useMutation({
        mutationFn: (id: string) => alertsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alert deleted");
        },
    });

    // --- Bulk selection ---
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const clearSelection = () => setSelectedIds(new Set());

    const allOnPageSelected = !!alerts && alerts.length > 0 && alerts.every((a) => selectedIds.has(a._id));
    const toggleSelectAllOnPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) {
                alerts?.forEach((a) => next.delete(a._id));
            } else {
                alerts?.forEach((a) => next.add(a._id));
            }
            return next;
        });
    };

    const acknowledgeAll = useMutation({
        mutationFn: () => alertsService.acknowledgeAll(),
        onSuccess: (count) => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success(`Marked ${count} alert${count !== 1 ? "s" : ""} as read`);
        },
        onError: (e: any) => toast.error(e?.error?.message || "Failed to mark all as read"),
    });

    const bulkAction = useMutation({
        mutationFn: ({ ids, action }: { ids: string[]; action: "acknowledge" | "resolve" | "delete" }) =>
            alertsService.bulkAction(ids, action),
        onSuccess: (count, { action }) => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            clearSelection();
            const verb = action === "acknowledge" ? "acknowledged" : action === "resolve" ? "resolved" : "deleted";
            toast.success(`${count} alert${count !== 1 ? "s" : ""} ${verb}`);
        },
        onError: (e: any) => toast.error(e?.error?.message || "Bulk action failed"),
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

    // Total unread across all alerts (not just the visible page): a cheap count
    // query that reads pagination.total for status=active.
    const { data: unreadPage } = useQuery({
        queryKey: ["alerts", "unread-count"],
        queryFn: () => alertsService.getPaginated({ status: "active", limit: 1 }),
    });
    const unreadCount = unreadPage?.pagination.total ?? 0;

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
                    <Button
                        variant="outline"
                        onClick={() => acknowledgeAll.mutate()}
                        disabled={unreadCount === 0 || acknowledgeAll.isPending}
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>
            </div>

            {/* Filter Tabs + Search */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
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
                <div className="relative flex-1 min-w-[220px] max-w-md ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search alerts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Bulk action bar */}
            <BulkActionBar count={selectedIds.size} onClear={clearSelection}>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "acknowledge" })}
                    disabled={bulkAction.isPending}
                >
                    <Check className="w-4 h-4 mr-1" />
                    Acknowledge
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "resolve" })}
                    disabled={bulkAction.isPending}
                >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => bulkAction.mutate({ ids: [...selectedIds], action: "delete" })}
                    disabled={bulkAction.isPending}
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                </Button>
            </BulkActionBar>

            {/* Alerts List */}
            {alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 px-1">
                        <Checkbox checked={allOnPageSelected} onCheckedChange={toggleSelectAllOnPage} />
                        Select all on this page
                    </label>
                    {alerts.map((alert) => (
                        <Card
                            key={alert._id}
                            className={`${alert.status === 'active' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''} ${selectedIds.has(alert._id) ? 'ring-2 ring-blue-400' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={selectedIds.has(alert._id)}
                                        onCheckedChange={() => toggleSelected(alert._id)}
                                        className="mt-1"
                                    />
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
                                                {alert.status === 'active' && (
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
                                                {alert.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => acknowledgeAlert.mutate(alert._id)}
                                                    >
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                {alert.status === 'acknowledged' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => resolveAlert.mutate(alert._id)}
                                                    >
                                                        Resolve
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

            <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
    );
}
