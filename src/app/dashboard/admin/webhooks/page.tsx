"use client";

import { useState } from "react";
import { useWebhooks, useCreateWebhook, useDeleteWebhook } from "@/hooks/use-webhooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Webhook as WebhookIcon, Trash2, Plus, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Webhook, WebhookEvent, CreatedWebhook } from "@/types/api";

export default function WebhooksPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "it_support"]}>
            <WebhooksContent />
        </ProtectedRoute>
    );
}

function WebhooksContent() {
    const { data, isLoading } = useWebhooks();
    const createWebhook = useCreateWebhook();
    const deleteWebhook = useDeleteWebhook();

    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [newSecret, setNewSecret] = useState<CreatedWebhook | null>(null);

    const availableEvents = data?.availableEvents ?? [];

    const toggleEvent = (ev: WebhookEvent) =>
        setEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || events.length === 0) return;
        createWebhook.mutate(
            { url, events, description: description || undefined },
            {
                onSuccess: (created) => {
                    setNewSecret(created);
                    setUrl("");
                    setDescription("");
                    setEvents([]);
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <WebhookIcon className="w-7 h-7 text-blue-600" />
                    Webhooks
                </h1>
                <p className="text-gray-600 mt-1">
                    Push domain events (orders, stock changes) to external systems like
                    Shopify, Amazon, or an EDI bridge. Payloads are signed with HMAC-SHA256.
                </p>
            </div>

            {newSecret && (
                <Card className="border-green-300 bg-green-50">
                    <CardContent className="pt-6">
                        <p className="font-medium text-green-900 mb-2">Webhook created — copy the signing secret now (shown once):</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono break-all">{newSecret.secret}</code>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(newSecret.secret);
                                    toast.success("Secret copied");
                                }}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setNewSecret(null)}>Dismiss</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Add a Webhook</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="url">Endpoint URL</Label>
                            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/inventory" />
                        </div>
                        <div>
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Shopify order sync" />
                        </div>
                        <div>
                            <Label>Events</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                {availableEvents.map((ev) => (
                                    <label key={ev} className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={events.includes(ev)} onCheckedChange={() => toggleEvent(ev)} />
                                        <span className="font-mono text-xs">{ev}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={!url || events.length === 0 || createWebhook.isPending}>
                            <Plus className="w-4 h-4 mr-1" /> Create webhook
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Webhooks</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-gray-500 py-4">Loading…</p>
                    ) : data && data.webhooks.length > 0 ? (
                        <div className="space-y-3">
                            {data.webhooks.map((w: Webhook) => (
                                <div key={w._id} className="flex items-start justify-between p-3 rounded-md border border-gray-200">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm break-all">{w.url}</span>
                                            {w.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Disabled</Badge>}
                                        </div>
                                        {w.description && <p className="text-sm text-gray-500 mt-1">{w.description}</p>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {w.events.map((ev) => (
                                                <Badge key={ev} variant="outline" className="text-xs font-mono">{ev}</Badge>
                                            ))}
                                        </div>
                                        {w.lastTriggeredAt && (
                                            <p className="text-xs text-gray-400 mt-1">Last delivered: {formatDate(w.lastTriggeredAt)}</p>
                                        )}
                                        {w.failureCount > 0 && (
                                            <p className="text-xs text-red-500 mt-1">{w.failureCount} recent failure(s)</p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => deleteWebhook.mutate(w._id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-6 text-center">No webhooks registered.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
