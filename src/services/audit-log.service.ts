import { http } from "@/lib/api-client";
import type { AuditLogPage } from "@/types/api";

export interface AuditLogFilters {
    entityType?: string;
    action?: string;
    page?: number;
    limit?: number;
}

export const auditLogService = {
    async getAll(filters?: AuditLogFilters): Promise<AuditLogPage> {
        const params = new URLSearchParams();
        if (filters?.entityType) params.append("entityType", filters.entityType);
        if (filters?.action) params.append("action", filters.action);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));

        const response = await http.get<{ data: AuditLogPage }>(`/audit-logs?${params.toString()}`);
        return response.data;
    },
};
