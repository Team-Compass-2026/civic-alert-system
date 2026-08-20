import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Primary action surface — submit, confirm, navigate to a primary
 *   destination. Use `destructive` for irreversible actions (delete, revoke).
 * @example <Button variant="primary" size="md">Acknowledge alert</Button>
 * @antipattern Don't use a destructive button where a secondary/outline action
 *   suffices — reserve red for genuine data loss.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium font-sans transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:focus-ring [&_svg]:size-[1.125em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted active:bg-slate-200",
        ghost: "bg-transparent text-foreground hover:bg-muted active:bg-slate-200",
        destructive:
          "bg-risk-high text-white shadow-sm hover:bg-risk-high/90 active:bg-risk-high",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner
            className="size-[1.125em]"
            aria-hidden
          />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

// Local spinner to avoid a circular import through the barrel.
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
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
}

export { buttonVariants };
