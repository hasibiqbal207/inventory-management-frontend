import { describe, it, expect } from "vitest";
import { rowsToCsv, toCsvValue } from "./export";

describe("toCsvValue", () => {
    it("returns an empty string for null/undefined", () => {
        expect(toCsvValue(null)).toBe("");
        expect(toCsvValue(undefined)).toBe("");
    });

    it("passes plain values through untouched", () => {
        expect(toCsvValue("Widget")).toBe("Widget");
        expect(toCsvValue(42)).toBe("42");
    });

    it("quotes and escapes values containing commas, quotes, or newlines", () => {
        expect(toCsvValue("Acme, Inc.")).toBe('"Acme, Inc."');
        expect(toCsvValue('Say "hi"')).toBe('"Say ""hi"""');
        expect(toCsvValue("line1\nline2")).toBe('"line1\nline2"');
    });
});

describe("rowsToCsv", () => {
    const columns = [
        { key: "name", label: "Name" },
        { key: "value", label: "Value" },
    ];

    it("builds a header row from column labels", () => {
        const csv = rowsToCsv(columns, []);
        expect(csv).toBe("Name,Value");
    });

    it("builds one line per row, in column order", () => {
        const csv = rowsToCsv(columns, [
            { name: "Widgets", value: 100 },
            { name: "Gadgets", value: 250 },
        ]);
        expect(csv).toBe("Name,Value\nWidgets,100\nGadgets,250");
    });

    it("escapes fields that need it without breaking column alignment", () => {
        const csv = rowsToCsv(columns, [{ name: "Acme, Inc.", value: 10 }]);
        expect(csv).toBe('Name,Value\n"Acme, Inc.",10');
    });

    it("fills missing keys with an empty field rather than throwing", () => {
        const csv = rowsToCsv(columns, [{ name: "Widgets" }]);
        expect(csv).toBe("Name,Value\nWidgets,");
    });
});
