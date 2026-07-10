"use client";

import { useState } from "react";
import { useExchangeRates, useUpsertExchangeRate } from "@/hooks/use-exchange-rates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { CurrencyCode, ExchangeRate } from "@/types/api";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "BDT"];

export default function ExchangeRatesPage() {
    return (
        <ProtectedRoute allowedRoles={["admin", "finance_officer"]}>
            <ExchangeRatesContent />
        </ProtectedRoute>
    );
}

function ExchangeRatesContent() {
    const { data: rates, isLoading } = useExchangeRates();
    const upsert = useUpsertExchangeRate();

    const [base, setBase] = useState<CurrencyCode>("USD");
    const [quote, setQuote] = useState<CurrencyCode>("EUR");
    const [rate, setRate] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [source, setSource] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(rate);
        if (!parsed || parsed <= 0 || base === quote) return;
        upsert.mutate(
            {
                baseCurrency: base,
                quoteCurrency: quote,
                rate: parsed,
                effectiveDate: effectiveDate || undefined,
                source: source || undefined,
            },
            {
                onSuccess: () => {
                    setRate("");
                    setSource("");
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Coins className="w-7 h-7 text-blue-600" />
                    Exchange Rates
                </h1>
                <p className="text-gray-600 mt-1">
                    Record FX rates over time so historical orders value correctly across currencies.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Record a Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <Label>Base</Label>
                            <select
                                value={base}
                                onChange={(e) => setBase(e.target.value as CurrencyCode)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                            >
                                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Quote</Label>
                            <select
                                value={quote}
                                onChange={(e) => setQuote(e.target.value as CurrencyCode)}
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                            >
                                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Rate (1 base = ? quote)</Label>
                            <Input type="number" step="0.0001" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="1.0850" />
                        </div>
                        <div>
                            <Label>Effective date</Label>
                            <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={upsert.isPending || base === quote || !rate}>
                            <Plus className="w-4 h-4 mr-1" /> Save
                        </Button>
                    </form>
                    {base === quote && (
                        <p className="text-sm text-red-600 mt-2">Base and quote currencies must differ.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rate History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-gray-500 py-4">Loading…</p>
                    ) : rates && rates.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500">
                                        <th className="py-2 px-3">Pair</th>
                                        <th className="py-2 px-3 text-right">Rate</th>
                                        <th className="py-2 px-3">Effective</th>
                                        <th className="py-2 px-3">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rates.map((r: ExchangeRate) => (
                                        <tr key={r._id} className="border-b border-gray-100">
                                            <td className="py-2 px-3 font-mono">{r.baseCurrency}/{r.quoteCurrency}</td>
                                            <td className="py-2 px-3 text-right font-semibold">{r.rate}</td>
                                            <td className="py-2 px-3">{formatDate(r.effectiveDate)}</td>
                                            <td className="py-2 px-3 text-gray-500">{r.source || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 py-6 text-center">No rates recorded yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
