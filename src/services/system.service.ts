import { apiClient } from "@/lib/api-client";
import type { Setting, SystemHealth, SystemMetrics } from "@/types/api";

export interface SettingUpdate {
    key: string;
    value: any;
}

export const systemService = {
    async getSettings(category?: string): Promise<Setting[]> {
        const query = category ? `?category=${encodeURIComponent(category)}` : "";
        const response: any = await apiClient.get(`/system/settings${query}`);
        return response.data.settings;
    },

    async updateSettings(updates: SettingUpdate[]): Promise<Setting[]> {
        const response: any = await apiClient.put("/system/settings", { settings: updates });
        return response.data.settings;
    },

    async getHealth(): Promise<SystemHealth> {
        const response: any = await apiClient.get("/system/health-check");
        return response.data.health;
    },

    async getMetrics(): Promise<SystemMetrics> {
        const response: any = await apiClient.get("/system/metrics");
        return response.data.metrics;
    },
};
