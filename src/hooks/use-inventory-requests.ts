import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryRequestService } from "@/services/inventory-request.service";
import { RequestStatus, RequestType, CreateInventoryRequestDTO } from "@/types/api";
import { toast } from "sonner";

export function useInventoryRequests(params?: { status?: RequestStatus; type?: RequestType }) {
    return useQuery({
        queryKey: ["inventory-requests", params],
        queryFn: () => inventoryRequestService.getAllRequests(params),
    });
}

export function useInventoryRequest(id: string) {
    return useQuery({
        queryKey: ["inventory-request", id],
        queryFn: () => inventoryRequestService.getRequestById(id),
        enabled: !!id,
    });
}

export function useCreateInventoryRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInventoryRequestDTO) => inventoryRequestService.createRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-requests"] });
            toast.success("Inventory request submitted for approval");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to submit request");
        },
    });
}

export function useApproveInventoryRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => inventoryRequestService.approveRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-requests"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Request approved and inventory updated");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to approve request");
        },
    });
}

export function useRejectInventoryRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            inventoryRequestService.rejectRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory-requests"] });
            toast.success("Request rejected");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to reject request");
        },
    });
}
