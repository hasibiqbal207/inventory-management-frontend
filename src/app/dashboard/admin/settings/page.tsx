"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Database, Bell, ShieldCheck } from "lucide-react";
import { systemService } from "@/services/system.service";
import type { Setting } from "@/types/api";

import { ProtectedRoute } from "@/components/auth/protected-route";

const CATEGORY_META: Record<string, { title: string; icon: ElementType }> = {
    general: { title: "General Settings", icon: SettingsIcon },
    backup: { title: "Database & Backup", icon: Database },
    security: { title: "Security", icon: ShieldCheck },
    notifications: { title: "Notifications", icon: Bell },
};

const SELECT_OPTIONS: Record<string, string[]> = {
    "general.timezone": ["UTC", "America/New_York", "Europe/London", "Asia/Dhaka"],
    "general.currency": ["USD", "EUR", "GBP", "BDT"],
    "backup.schedule": ["daily", "weekly", "monthly"],
};

export default function AdminSettingsPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "it_support"]}>
            <AdminSettingsPageContent />
        </ProtectedRoute>
    );
}

function AdminSettingsPageContent() {
    const queryClient = useQueryClient();
    const { data: settings, isLoading, error } = useQuery({
        queryKey: ["settings"],
        queryFn: () => systemService.getSettings(),
    });

    const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

    const updateSettings = useMutation({
        mutationFn: (updates: Array<{ key: string; value: any }>) =>
            systemService.updateSettings(updates),
        onSuccess: () => {
            toast.success("Settings saved");
            setPendingChanges({});
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (err: any) => {
            toast.error(err?.error?.message || "Failed to save settings");
        },
    });

    const byCategory = useMemo(() => {
        const groups: Record<string, Setting[]> = {};
        for (const setting of settings || []) {
            if (!groups[setting.category]) groups[setting.category] = [];
            groups[setting.category].push(setting);
        }
        return groups;
    }, [settings]);

    const currentValue = (setting: Setting) =>
        setting.key in pendingChanges ? pendingChanges[setting.key] : setting.value;

    const handleChange = (key: string, value: any) => {
        setPendingChanges((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const updates = Object.entries(pendingChanges).map(([key, value]) => ({ key, value }));
        if (updates.length === 0) return;
        updateSettings.mutate(updates);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">Failed to load settings</p>
            </div>
        );
    }

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
                </div>
                <Button onClick={handleSave} disabled={!hasPendingChanges || updateSettings.isPending}>
                    {updateSettings.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(byCategory).map(([category, categorySettings]) => {
                    const meta = CATEGORY_META[category] || { title: category, icon: SettingsIcon };
                    const Icon = meta.icon;
                    return (
                        <Card key={category}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon className="w-5 h-5" />
                                    {meta.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {categorySettings.map((setting) => (
                                        <SettingControl
                                            key={setting.key}
                                            setting={setting}
                                            value={currentValue(setting)}
                                            onChange={(value) => handleChange(setting.key, value)}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {(!settings || settings.length === 0) && (
                    <Card className="md:col-span-2">
                        <CardContent className="pt-6 text-center text-gray-500">
                            No settings found.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function SettingControl({
    setting,
    value,
    onChange,
}: {
    setting: Setting;
    value: any;
    onChange: (value: any) => void;
}) {
    const label = setting.description || setting.key;

    if (setting.dataType === "boolean") {
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <input
                    type="checkbox"
                    checked={!!value}
                    disabled={setting.isSystem}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4"
                />
            </div>
        );
    }

    const options = SELECT_OPTIONS[setting.key];
    if (options) {
        return (
            <div>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <select
                    value={value}
                    disabled={setting.isSystem}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                type={setting.dataType === "number" ? "number" : "text"}
                value={value}
                disabled={setting.isSystem}
                onChange={(e) =>
                    onChange(setting.dataType === "number" ? Number(e.target.value) : e.target.value)
                }
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
        </div>
    );
}
