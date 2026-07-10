"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface BulkActionBarProps {
    count: number;
    onClear: () => void;
    children: ReactNode;
}

/**
 * Sticky bar that surfaces when one or more rows are selected on a list page.
 * Shows the selection count, a clear button, and whatever bulk-action buttons
 * the caller passes as children — kept generic so every list page's bulk UI
 * looks and behaves the same.
 */
export function BulkActionBar({ count, onClear, children }: BulkActionBarProps) {
    if (count === 0) return null;

    return (
        <div className="sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
            <span className="text-sm font-medium text-blue-900">
                {count} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
            <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-blue-900">
                <X className="w-4 h-4 mr-1" />
                Clear
            </Button>
        </div>
    );
}
