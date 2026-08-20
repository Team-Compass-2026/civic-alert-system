import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Hover/focus hint for an icon-only control or a truncated label. Pure
 *   CSS positioning on a group; appears on hover and keyboard focus.
 * @example <Tooltip text="River gauge 12"><IconButton label="Gauge 12">…</IconButton></Tooltip>
 * @antipattern Don't put critical information only in a tooltip — touch devices
 *   and screen readers may not surface it. Duplicate in an accessible label.
 */
export interface TooltipProps {
  text: React.ReactNode;
  side?: "top" | "bottom";
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ text, side = "top", children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 font-sans text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {text}
      </span>
    </span>
  );
}
