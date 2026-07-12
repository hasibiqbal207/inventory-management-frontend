import { http } from "@/lib/api-client";
import { User, UserRole } from "@/types/api";

export const usersService = {
    getAll: async (): Promise<User[]> => {
        const response = await http.get<{ data: User[] }>("/users");
        return response.data;
    },

    updateRole: async (id: string, role: UserRole): Promise<User> => {
        const response = await http.patch<{ data: User }>(`/users/${id}/role`, { role });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await http.delete(`/users/${id}`);
    },
};
