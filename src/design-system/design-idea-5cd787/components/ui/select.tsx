import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Single-choice dropdown from a known set — severity filter, status
 *   filter, region selector. Native select keeps accessibility and mobile UX.
 * @example <Select defaultValue="all"><option value="all">All severities</option></Select>
 * @antipattern Don't build a custom dropdown here for a simple enum — native
 *   select is keyboard- and screen-reader-correct out of the box.
 */
export const selectVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 text-sm font-sans text-foreground transition-colors duration-150 focus-visible:focus-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-9",
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
      state: {
        default: "",
        error: "border-risk-high text-risk-high focus-visible:border-risk-high",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, state, invalid, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            selectVariants({ size, state: invalid ? "error" : state }),
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    );
  },
);
Select.displayName = "Select";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
