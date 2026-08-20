import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Multi-line text entry — report descriptions, notes, escalation reasons.
 * @example <Label htmlFor="desc">Description</Label><Textarea id="desc" rows={4} />
 * @antipattern Don't use a Textarea for single-line fields — use Input.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:focus-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-risk-high text-risk-high placeholder:text-risk-high/60",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
