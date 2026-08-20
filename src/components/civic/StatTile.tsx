import * as React from "react";
import { Card, CardBody } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  deltaPct?: number;
  hint?: string;
}

/** Metric tile: label, big mono value, optional trend delta. */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ label, value, deltaPct, hint, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardBody className="flex flex-col gap-2 p-5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-mono text-3xl font-semibold text-foreground">
            {value}
          </span>
          {deltaPct !== undefined ? (
            <span
              className={cn(
                "font-mono text-sm",
                deltaPct > 0 ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {deltaPct > 0 ? "↑" : deltaPct < 0 ? "↓" : "→"}
              {Math.abs(deltaPct)}% vs last week
            </span>
          ) : null}
          {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
        </CardBody>
      </Card>
    );
  },
);
StatTile.displayName = "StatTile";
