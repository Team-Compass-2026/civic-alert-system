import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

export type CivicStatus = "active" | "resolved" | "monitoring" | "draft" | "open";

const STATUS_STYLES: Record<CivicStatus, string> = {
  active: "bg-brand-100 text-brand-700",
  open: "bg-brand-100 text-brand-700",
  resolved: "bg-slate-100 text-slate-600",
  monitoring: "bg-slate-100 text-slate-700",
  draft: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<CivicStatus, string> = {
  active: "Active",
  open: "Open",
  resolved: "Resolved",
  monitoring: "Monitoring",
  draft: "Draft",
};

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: CivicStatus | string;
}

/** Workflow status — a separate axis from risk severity. */
export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ status, className, ...props }, ref) => {
    const key = (status in STATUS_STYLES ? status : "monitoring") as CivicStatus;
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-medium",
          STATUS_STYLES[key],
          className,
        )}
        {...props}
      >
        {STATUS_LABEL[key]}
      </span>
    );
  },
);
StatusPill.displayName = "StatusPill";
