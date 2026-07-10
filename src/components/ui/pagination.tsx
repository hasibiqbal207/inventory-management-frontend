"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/types/api";

interface PaginationProps {
    pagination?: PaginationMeta;
    onPageChange: (page: number) => void;
    /** Hide entirely when there is only one page (default true). */
    hideWhenSinglePage?: boolean;
}

/**
 * Shared pager for server-driven list pages. Renders "Showing X–Y of Z" plus
 * prev/next controls; kept deliberately minimal so every list page looks the
 * same.
 */
export function Pagination({ pagination, onPageChange, hideWhenSinglePage = true }: PaginationProps) {
    if (!pagination) return null;
    const { total, page, limit, totalPages } = pagination;
    if (hideWhenSinglePage && totalPages <= 1) return null;

    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{" "}
                <span className="font-medium">{total}</span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
