import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Boolean toggle for a single option — subscribe to a region, confirm a
 *   checklist item, accept terms. Built on a real checkbox (keyboard + a11y).
 * @example <Checkbox id="sub" label="Notify me for Hlaing catchment" />
 * @antipattern Don't use Checkbox to pick one option from many — use a Select
 *   or radio group. Don't render the check with a bare div click handler.
 */
export const checkboxVariants =
  "peer appearance-none size-[1.125rem] shrink-0 rounded-xs border border-input bg-background transition-colors duration-150 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-brand-600 checked:border-brand-600 indeterminate:bg-brand-600 indeterminate:border-brand-600";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <label
        htmlFor={inputId}
        className="inline-flex items-start gap-2.5 cursor-pointer select-none"
      >
        <span className="relative inline-flex shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(checkboxVariants, className)}
            {...props}
          />
          <CheckIcon className="pointer-events-none absolute opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="flex flex-col">
          {label ? (
            <span className="text-sm font-medium text-foreground">{label}</span>
          ) : null}
          {description ? (
            <span className="text-xs text-muted-foreground">{description}</span>
          ) : null}
        </span>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

/** The check icon — rendered via CSS background when checked. Kept for custom
 *  layouts that need to draw the mark themselves. */
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-3.5 text-white", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
