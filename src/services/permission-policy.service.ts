import { http } from "@/lib/api-client";
import type { PermissionPolicy, UserRole } from "@/types/api";

export const permissionPolicyService = {
    async list(): Promise<PermissionPolicy[]> {
        const response = await http.get<{ data: { policies: PermissionPolicy[] } }>(`/permission-policies`);
        return response.data.policies;
    },

    async set(key: string, allowedRoles: UserRole[]): Promise<PermissionPolicy> {
        const response = await http.put<{ data: { policy: PermissionPolicy } }>(`/permission-policies/${encodeURIComponent(key)}`, { allowedRoles });
        return response.data.policy;
    },

    async reset(key: string): Promise<void> {
        await http.delete(`/permission-policies/${encodeURIComponent(key)}`);
    },
};
