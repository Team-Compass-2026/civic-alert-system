import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { RISK_STYLES, type RiskLevel } from "@/lib/waterwatch";

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel;
  score: number;
  size?: "sm" | "md";
}

/**
 * Canonical risk surface: tinted background + level label + numeric score.
 * Never renders color alone.
 */
export const RiskBadge = React.forwardRef<HTMLSpanElement, RiskBadgeProps>(
  ({ level, score, size = "md", className, ...props }, ref) => {
    const s = RISK_STYLES[level];
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-pill font-medium",
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
          s.tint,
          s.text,
          className,
        )}
        {...props}
      >
        <span className={cn("size-2 rounded-pill", s.dot)} aria-hidden="true" />
        <span>{level}</span>
        <span className="font-mono">{score}/100</span>
      </span>
    );
  },
);
RiskBadge.displayName = "RiskBadge";
