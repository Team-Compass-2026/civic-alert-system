import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Inline loading indicator — button spinners, refreshing lists, pending
 *   states. For skeleton loading of structured content use `Skeleton`.
 * @example <Spinner aria-label="Loading alerts" />
 * @antipattern Don't animate a full-screen overlay with a bare Spinner and no
 *   text — pair with a label so screen readers announce the wait.
 */
const spinnerVariants = cva("animate-spin text-current", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-8",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SpinnerProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="4"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  },
);
Spinner.displayName = "Spinner";

export { spinnerVariants };
