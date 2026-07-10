/**
 * Dependency-free CSV parsing for bulk import. Handles quoted fields with
 * embedded commas, newlines, and doubled-quote ("") escapes — the subset Excel
 * and Google Sheets emit. The first row is treated as the header.
 */

/** Parse raw CSV text into an array of string cell arrays (including header). */
export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let field = "";
    let row: string[] = [];
    let inQuotes = false;

    // Normalise line endings so \r\n and \r behave like \n.
    const src = text.replace(/\r\n?/g, "\n");

    for (let i = 0; i < src.length; i++) {
        const char = src[i];

        if (inQuotes) {
            if (char === '"') {
                if (src[i + 1] === '"') {
                    field += '"';
                    i++; // skip the escaped quote
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    // Flush the trailing field/row if the file doesn't end in a newline.
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    // Drop fully-empty rows (e.g. a trailing blank line).
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/**
 * Parse CSV text into an array of objects keyed by the header row. Header names
 * are trimmed; missing trailing cells become empty strings.
 */
export function parseCsvToObjects(text: string): Record<string, string>[] {
    const rows = parseCsv(text);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim());
    return rows.slice(1).map((cells) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
            obj[h] = (cells[idx] ?? "").trim();
        });
        return obj;
    });
}

/** Read a File as UTF-8 text (browser FileReader wrapped in a promise). */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
