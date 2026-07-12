import { http } from "@/lib/api-client";
import type { Setting, SystemHealth, SystemMetrics } from "@/types/api";

export interface SettingUpdate {
    key: string;
    value: unknown;
}

export const systemService = {
    async getSettings(category?: string): Promise<Setting[]> {
        const query = category ? `?category=${encodeURIComponent(category)}` : "";
        const response = await http.get<{ data: { settings: Setting[] } }>(`/system/settings${query}`);
        return response.data.settings;
    },

    async updateSettings(updates: SettingUpdate[]): Promise<Setting[]> {
        const response = await http.put<{ data: { settings: Setting[] } }>("/system/settings", { settings: updates });
        return response.data.settings;
    },

    async getHealth(): Promise<SystemHealth> {
        const response = await http.get<{ data: { health: SystemHealth } }>("/system/health-check");
        return response.data.health;
    },

    async getMetrics(): Promise<SystemMetrics> {
        const response = await http.get<{ data: { metrics: SystemMetrics } }>("/system/metrics");
        return response.data.metrics;
    },
};
