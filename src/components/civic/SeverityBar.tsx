import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { RISK_STYLES, riskLevelFromScore, type RiskLevel } from "@/lib/waterwatch";

export interface SeverityBarProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  level?: RiskLevel;
  label?: string;
  detail?: string;
}

/** Magnitude on a fixed 0-100 scale. Always paired with a readable score. */
export const SeverityBar = React.forwardRef<HTMLDivElement, SeverityBarProps>(
  ({ score, level, label, detail, className, ...props }, ref) => {
    const lvl = level ?? riskLevelFromScore(score);
    const s = RISK_STYLES[lvl];
    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        {label ? (
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className={cn("font-mono text-sm", s.text)}>{score}/100</span>
          </div>
        ) : null}
        <div
          className="h-2 w-full overflow-hidden rounded-pill bg-muted"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ? `${label}: ${lvl} ${score} of 100` : `${lvl} ${score} of 100`}
        >
          <div
            className={cn("h-full rounded-pill", s.bg)}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        {detail ? (
          <p className="text-sm text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    );
  },
);
SeverityBar.displayName = "SeverityBar";
