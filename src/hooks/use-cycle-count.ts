import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cycleCountService } from "@/services/cycle-count.service";
import { toast } from "sonner";
import type { ApiErrorLike } from "@/lib/utils";

export function useCycleCounts(warehouseId?: string, status?: string) {
    return useQuery({
        queryKey: ["cycle-counts", warehouseId, status],
        queryFn: () => cycleCountService.list(warehouseId, status),
    });
}

export function useCycleCount(id?: string) {
    return useQuery({
        queryKey: ["cycle-counts", id],
        queryFn: () => cycleCountService.get(id!),
        enabled: !!id,
    });
}

export function useClassification(months = 12) {
    return useQuery({
        queryKey: ["classification", months],
        queryFn: () => cycleCountService.classification(months),
    });
}

export function useCreateCycleCount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cycleCountService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cycle-counts"] });
            toast.success("Cycle count started");
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to start count"),
    });
}

export function useRecordCount(sessionId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, countedQuantity }: { productId: string; countedQuantity: number }) =>
            cycleCountService.recordCount(sessionId, productId, countedQuantity),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycle-counts", sessionId] }),
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to record count"),
    });
}

export function useCompleteCycleCount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cycleCountService.complete(id),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["cycle-counts"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            toast.success(`Count completed — ${result.adjustments} adjustment(s) posted`);
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to complete count"),
    });
}
