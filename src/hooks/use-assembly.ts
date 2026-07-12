import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assemblyService } from "@/services/assembly.service";
import { toast } from "sonner";
import type { ApiErrorLike } from "@/lib/utils";

/** Buildable-quantity for a kit in a warehouse. Disabled until both are set. */
export function useBuildable(kitProductId?: string, warehouseId?: string) {
    return useQuery({
        queryKey: ["assembly", "buildable", kitProductId, warehouseId],
        queryFn: () => assemblyService.getBuildable(kitProductId!, warehouseId!),
        enabled: !!kitProductId && !!warehouseId,
    });
}

/** Assemble or disassemble kits, invalidating inventory/assembly on success. */
export function useAssemble() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { kitProductId: string; warehouseId: string; quantity: number; disassemble?: boolean }) =>
            assemblyService.assemble(vars.kitProductId, vars.warehouseId, vars.quantity, vars.disassemble),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["assembly"] });
            toast.success(
                `${result.assembled ? "Assembled" : "Disassembled"} ${result.quantity} unit${result.quantity !== 1 ? "s" : ""}`
            );
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Assembly failed"),
    });
}
