import { describe, it, expect } from "vitest";
import { cn, formatCurrency, truncate, getInitials } from "./utils";

describe("cn", () => {
    it("merges class names and resolves Tailwind conflicts", () => {
        expect(cn("px-2", "px-4")).toBe("px-4");
        expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
    });
});

describe("formatCurrency", () => {
    it("formats a number as USD by default", () => {
        expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });

    it("formats using the given currency code", () => {
        expect(formatCurrency(10, "EUR")).toContain("10");
    });

    it("falls back to a plain string for an unsupported currency code", () => {
        expect(formatCurrency(10, "NOTREAL")).toBe("NOTREAL 10.00");
    });
});

describe("truncate", () => {
    it("leaves short text untouched", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates long text and appends an ellipsis", () => {
        expect(truncate("hello world", 5)).toBe("hello...");
    });
});

describe("getInitials", () => {
    it("uppercases the first letter of each name", () => {
        expect(getInitials("jane", "doe")).toBe("JD");
    });
});
