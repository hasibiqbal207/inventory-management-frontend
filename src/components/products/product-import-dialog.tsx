"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { parseCsvToObjects, readFileAsText } from "@/lib/csv";
import { exportRowsToCsv } from "@/lib/export";
import { productsService } from "@/services/products.service";
import type { ImportResult } from "@/types/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface ProductImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TEMPLATE_COLUMNS = [
    "sku",
    "productName",
    "description",
    "category",
    "price",
    "minStockLevel",
    "maxStockLevel",
    "isActive",
];

export function ProductImportDialog({ open, onOpenChange }: ProductImportDialogProps) {
    const queryClient = useQueryClient();
    const [fileName, setFileName] = useState("");
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [parseError, setParseError] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);

    const reset = () => {
        setFileName("");
        setRows([]);
        setParseError("");
        setResult(null);
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleFile = async (file: File) => {
        reset();
        setFileName(file.name);
        try {
            const text = await readFileAsText(file);
            const parsed = parseCsvToObjects(text);
            if (parsed.length === 0) {
                setParseError("No data rows found. The file needs a header row and at least one record.");
                return;
            }
            if (!("sku" in parsed[0])) {
                setParseError('Missing required "sku" column. Download the template for the expected header.');
                return;
            }
            setRows(parsed);
        } catch {
            setParseError("Could not read the file. Make sure it is a valid CSV.");
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const res = await productsService.bulkImport(rows);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: ["products"] });
            if (res.failed === 0) {
                toast.success(`Imported ${res.created + res.updated} product(s).`);
            } else {
                toast.warning(`Imported with ${res.failed} error(s). See details below.`);
            }
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Import failed"));
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        exportRowsToCsv(
            "product-import-template",
            TEMPLATE_COLUMNS.map((c) => ({ key: c, label: c })),
            [
                {
                    sku: "SKU-001",
                    productName: "Example Widget",
                    description: "Sample row — replace or delete",
                    category: "Hardware",
                    price: "9.99",
                    minStockLevel: "10",
                    maxStockLevel: "500",
                    isActive: "true",
                },
            ]
        );
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Import Products</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file. Rows are matched by SKU — existing SKUs are
                        updated, new ones are created.
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                <Download className="w-4 h-4 mr-2" />
                                Download template
                            </Button>
                            <span className="text-xs text-gray-500">
                                Required columns: sku, productName, category
                            </span>
                        </div>

                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {fileName || "Click to choose a CSV file"}
                            </span>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                        </label>

                        {parseError && (
                            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{parseError}</span>
                            </div>
                        )}

                        {rows.length > 0 && (
                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 border-b">
                                    <FileText className="w-4 h-4" />
                                    {rows.length} row{rows.length !== 1 ? "s" : ""} ready — preview (first 5)
                                </div>
                                <div className="overflow-x-auto max-h-56">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b">
                                                {Object.keys(rows[0]).slice(0, 6).map((h) => (
                                                    <th key={h} className="py-1.5 px-3 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.slice(0, 5).map((r, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    {Object.keys(rows[0]).slice(0, 6).map((h) => (
                                                        <td key={h} className="py-1.5 px-3 whitespace-nowrap">{r[h]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleImport} disabled={rows.length === 0 || isImporting}>
                                {isImporting ? "Importing…" : `Import ${rows.length || ""} row${rows.length !== 1 ? "s" : ""}`}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-green-50 border border-green-100 rounded-md p-3 text-center">
                                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                                <p className="text-xs text-green-700">Created</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-center">
                                <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                                <p className="text-xs text-blue-700">Updated</p>
                            </div>
                            <div className={`rounded-md p-3 text-center border ${result.failed > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                                <p className={`text-2xl font-bold ${result.failed > 0 ? "text-red-700" : "text-gray-500"}`}>{result.failed}</p>
                                <p className={`text-xs ${result.failed > 0 ? "text-red-700" : "text-gray-500"}`}>Failed</p>
                            </div>
                        </div>

                        {result.errors.length > 0 ? (
                            <div className="border border-red-100 rounded-md overflow-hidden">
                                <div className="flex items-center gap-2 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 border-b border-red-100">
                                    <AlertTriangle className="w-4 h-4" />
                                    {result.errors.length} row error{result.errors.length !== 1 ? "s" : ""}
                                </div>
                                <div className="overflow-x-auto max-h-56">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b">
                                                <th className="py-1.5 px-3">Row</th>
                                                <th className="py-1.5 px-3">SKU</th>
                                                <th className="py-1.5 px-3">Error</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.errors.map((e, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-1.5 px-3">{e.row}</td>
                                                    <td className="py-1.5 px-3 font-mono">{e.sku || "—"}</td>
                                                    <td className="py-1.5 px-3 text-red-600">{e.message}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-md p-3">
                                <CheckCircle2 className="w-4 h-4" />
                                All {result.total} rows imported cleanly.
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={reset}>Import another file</Button>
                            <Button onClick={handleClose}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
