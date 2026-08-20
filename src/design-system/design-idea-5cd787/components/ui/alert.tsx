import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Inline contextual message within a form or card — success confirm,
 *   validation summary, an inline warning. For escalating alerts use the civic
 *   AlertCard; this is a small inline surface.
 * @example <Alert variant="warning">Levels rising — acknowledge to confirm.</Alert>
 * @antipattern Don't use Alert for destructive confirmations — use a Dialog.
 */
const alertVariants = cva(
  "flex items-start gap-3 rounded-md border p-4 text-sm font-sans",
  {
    variants: {
      variant: {
        info: "border-brand-200 bg-brand-50 text-brand-900",
        success: "border-risk-low/30 bg-risk-low-tint text-slate-900",
        warning: "border-risk-moderate/30 bg-risk-moderate-tint text-slate-900",
        danger: "border-risk-high/30 bg-risk-high-tint text-slate-900",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

const iconColor: Record<string, string> = {
  info: "text-brand-600",
  success: "text-risk-low",
  warning: "text-risk-moderate",
  danger: "text-risk-high",
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <span className={cn("mt-0.5 shrink-0", iconColor[variant ?? "info"])} aria-hidden="true">
          {variant === "success" ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          ) : variant === "danger" || variant === "warning" ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          )}
        </span>
        <div className="flex flex-col gap-0.5">
          {title ? <p className="font-semibold text-foreground">{title}</p> : null}
          {children ? <div className="text-foreground/90">{children}</div> : null}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

export { alertVariants };
