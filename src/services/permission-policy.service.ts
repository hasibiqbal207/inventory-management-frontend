import { apiClient } from "@/lib/api-client";
import type { PermissionPolicy, UserRole } from "@/types/api";

export const permissionPolicyService = {
    async list(): Promise<PermissionPolicy[]> {
        const response: any = await apiClient.get(`/permission-policies`);
        return response.data.policies;
    },

    async set(key: string, allowedRoles: UserRole[]): Promise<PermissionPolicy> {
        const response: any = await apiClient.put(`/permission-policies/${encodeURIComponent(key)}`, { allowedRoles });
        return response.data.policy;
    },

    async reset(key: string): Promise<void> {
        await apiClient.delete(`/permission-policies/${encodeURIComponent(key)}`);
    },
};
