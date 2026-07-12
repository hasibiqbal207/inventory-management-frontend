import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionPolicyService } from "@/services/permission-policy.service";
import type { UserRole } from "@/types/api";
import { toast } from "sonner";
import type { ApiErrorLike } from "@/lib/utils";

export function usePermissionPolicies() {
    return useQuery({
        queryKey: ["permission-policies"],
        queryFn: () => permissionPolicyService.list(),
    });
}

export function useSetPolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ key, allowedRoles }: { key: string; allowedRoles: UserRole[] }) =>
            permissionPolicyService.set(key, allowedRoles),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permission-policies"] });
            toast.success("Policy updated");
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to update policy"),
    });
}

export function useResetPolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (key: string) => permissionPolicyService.reset(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permission-policies"] });
            toast.success("Policy reset to default");
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to reset policy"),
    });
}
