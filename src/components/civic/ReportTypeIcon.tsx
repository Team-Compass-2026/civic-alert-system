import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { REPORT_TYPES, type ReportType } from "@/lib/waterwatch";

export interface ReportTypeIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: ReportType;
  showLabel?: boolean;
}

/** Icon is always paired with its label. */
export const ReportTypeIcon = React.forwardRef<HTMLSpanElement, ReportTypeIconProps>(
  ({ type, showLabel = true, className, ...props }, ref) => {
    const meta = REPORT_TYPES[type] ?? REPORT_TYPES.other;
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-2 text-sm text-foreground", className)}
        {...props}
      >
        <span aria-hidden="true">{meta.icon}</span>
        <span className={showLabel ? undefined : "sr-only"}>{meta.label}</span>
      </span>
    );
  },
);
ReportTypeIcon.displayName = "ReportTypeIcon";
