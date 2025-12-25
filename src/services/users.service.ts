import { apiClient } from "@/lib/api-client";
import { UserRole } from "@/types/api";

export const usersService = {
    getAll: async () => {
        const response: any = await apiClient.get("/users");
        return response.data;
    },

    updateRole: async (id: string, role: UserRole) => {
        const response: any = await apiClient.patch(`/users/${id}/role`, { role });
        return response.data;
    },

    delete: async (id: string) => {
        const response: any = await apiClient.delete(`/users/${id}`);
        return response.data;
    },
};
