import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exchangeRatesService } from "@/services/exchange-rates.service";
import type { CurrencyCode } from "@/types/api";
import { toast } from "sonner";
import type { ApiErrorLike } from "@/lib/utils";

export function useExchangeRates(base?: CurrencyCode, quote?: CurrencyCode) {
    return useQuery({
        queryKey: ["exchange-rates", base, quote],
        queryFn: () => exchangeRatesService.getHistory(base, quote),
    });
}

export function useUpsertExchangeRate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: exchangeRatesService.upsert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
            toast.success("Exchange rate saved");
        },
        onError: (e: ApiErrorLike) => toast.error(e?.error?.message || "Failed to save rate"),
    });
}
