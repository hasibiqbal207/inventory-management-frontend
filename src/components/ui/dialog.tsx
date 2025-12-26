import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange?.(false)}
            />
            {/* Content */}
            <div className="relative z-50">{children}</div>
        </div>
    );
}

export interface DialogContentProps
    extends React.HTMLAttributes<HTMLDivElement> { }

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    DialogContentProps
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps
    extends React.HTMLAttributes<HTMLDivElement> { }

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}
            {...props}
        />
    )
);
DialogHeader.displayName = "DialogHeader";

export interface DialogTitleProps
    extends React.HTMLAttributes<HTMLHeadingElement> { }

export const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    DialogTitleProps
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> { }

export const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    DialogDescriptionProps
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-600", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogFooterProps
    extends React.HTMLAttributes<HTMLDivElement> { }

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
                className
            )}
            {...props}
        />
    )
);
DialogFooter.displayName = "DialogFooter";
