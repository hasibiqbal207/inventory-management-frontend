import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhooksService } from "@/services/webhooks.service";
import { toast } from "sonner";

export function useWebhooks() {
    return useQuery({
        queryKey: ["webhooks"],
        queryFn: () => webhooksService.list(),
    });
}

export function useCreateWebhook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: webhooksService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook created");
        },
        onError: (e: any) => toast.error(e?.error?.message || "Failed to create webhook"),
    });
}

export function useDeleteWebhook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => webhooksService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook deleted");
        },
        onError: (e: any) => toast.error(e?.error?.message || "Failed to delete webhook"),
    });
}
