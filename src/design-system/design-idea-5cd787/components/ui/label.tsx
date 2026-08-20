import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Caption a form control and wire it to its input via `htmlFor`/`id`.
 * @example <Label htmlFor="q">Search alerts</Label>
 * @antipattern Don't use a plain `<span>` — a `<label>` is focusable-by-proxy
 *   and announces the field to assistive tech.
 */
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium font-sans text-foreground select-none",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
});
Label.displayName = "Label";
