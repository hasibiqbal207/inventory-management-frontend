/**
 * Client-side CSV export for report tables — no backend endpoint required,
 * since the data is already fetched on the page rendering it.
 */

function toCsvValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

export function exportRowsToCsv(
    filename: string,
    columns: Array<{ key: string; label: string }>,
    rows: Array<Record<string, unknown>>
): void {
    const header = columns.map((c) => toCsvValue(c.label)).join(",");
    const lines = rows.map((row) =>
        columns.map((c) => toCsvValue(row[c.key])).join(",")
    );
    const csv = [header, ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
