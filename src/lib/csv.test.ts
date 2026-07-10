import { describe, it, expect } from "vitest";
import { parseCsv, parseCsvToObjects } from "./csv";

describe("parseCsv", () => {
    it("parses a simple header + rows", () => {
        expect(parseCsv("a,b,c\n1,2,3\n4,5,6")).toEqual([
            ["a", "b", "c"],
            ["1", "2", "3"],
            ["4", "5", "6"],
        ]);
    });

    it("handles quoted fields with embedded commas", () => {
        expect(parseCsv('name,note\n"Widget, deluxe",ok')).toEqual([
            ["name", "note"],
            ["Widget, deluxe", "ok"],
        ]);
    });

    it("handles doubled-quote escapes inside quoted fields", () => {
        expect(parseCsv('q\n"She said ""hi"""')).toEqual([
            ["q"],
            ['She said "hi"'],
        ]);
    });

    it("handles newlines inside quoted fields", () => {
        expect(parseCsv('desc\n"line one\nline two"')).toEqual([
            ["desc"],
            ["line one\nline two"],
        ]);
    });

    it("normalises CRLF and CR line endings", () => {
        expect(parseCsv("a,b\r\n1,2\r3,4")).toEqual([
            ["a", "b"],
            ["1", "2"],
            ["3", "4"],
        ]);
    });

    it("drops fully-empty lines (e.g. trailing blank)", () => {
        expect(parseCsv("a\n1\n\n")).toEqual([["a"], ["1"]]);
    });
});

describe("parseCsvToObjects", () => {
    it("keys cells by trimmed header names", () => {
        expect(parseCsvToObjects(" sku , name \nS1, Widget ")).toEqual([
            { sku: "S1", name: "Widget" },
        ]);
    });

    it("returns [] when there is only a header (no data rows)", () => {
        expect(parseCsvToObjects("sku,name")).toEqual([]);
    });

    it("fills missing trailing cells with empty strings", () => {
        expect(parseCsvToObjects("a,b,c\n1,2")).toEqual([{ a: "1", b: "2", c: "" }]);
    });
});
