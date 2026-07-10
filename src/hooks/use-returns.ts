import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { returnsService } from "@/services/returns.service";
import type { CreateReturnDTO, ReturnStatus, ReturnType } from "@/types/api";
import { toast } from "sonner";

export function useReturns(filters?: { status?: ReturnStatus; returnType?: ReturnType }) {
    return useQuery({
        queryKey: ["returns", filters?.status, filters?.returnType],
        queryFn: () => returnsService.getAll(filters),
    });
}

export function useCreateReturn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReturnDTO) => returnsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["returns"] });
            toast.success("Return (RMA) created.");
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || error?.message || "Failed to create return");
        },
    });
}

/**
 * One mutation covering every workflow transition. The action determines which
 * endpoint is called; inventory is invalidated too since "receive" restocks.
 */
export function useReturnAction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            action,
            reason,
        }: {
            id: string;
            action: "approve" | "reject" | "cancel" | "receive" | "complete";
            reason?: string;
        }) => {
            switch (action) {
                case "approve":
                    return returnsService.approve(id);
                case "reject":
                    return returnsService.reject(id, reason || "");
                case "cancel":
                    return returnsService.cancel(id);
                case "receive":
                    return returnsService.receive(id);
                case "complete":
                    return returnsService.complete(id);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["returns"] });
            if (variables.action === "receive") {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
            }
            toast.success(`Return ${variables.action}d.`);
        },
        onError: (error: any) => {
            toast.error(error?.error?.message || error?.message || "Action failed");
        },
    });
}
