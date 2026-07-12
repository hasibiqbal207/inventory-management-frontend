import { http } from "@/lib/api-client";
import type { ExchangeRate, CurrencyCode } from "@/types/api";

export const exchangeRatesService = {
    async getHistory(base?: CurrencyCode, quote?: CurrencyCode): Promise<ExchangeRate[]> {
        const qs = new URLSearchParams();
        if (base) qs.append("base", base);
        if (quote) qs.append("quote", quote);
        const response = await http.get<{ data: { rates: ExchangeRate[] } }>(`/exchange-rates?${qs.toString()}`);
        return response.data.rates;
    },

    async getRate(from: CurrencyCode, to: CurrencyCode, asOf?: string): Promise<number> {
        const qs = new URLSearchParams({ from, to });
        if (asOf) qs.append("asOf", asOf);
        const response = await http.get<{ data: { rate: number } }>(`/exchange-rates/rate?${qs.toString()}`);
        return response.data.rate;
    },

    async upsert(input: {
        baseCurrency: CurrencyCode;
        quoteCurrency: CurrencyCode;
        rate: number;
        effectiveDate?: string;
        source?: string;
    }): Promise<ExchangeRate> {
        const response = await http.post<{ data: { rate: ExchangeRate } }>(`/exchange-rates`, input);
        return response.data.rate;
    },
};
