import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Compact tag — counts, categories, non-severity status. For risk
 *   severity use `RiskBadge`, not this. For workflow status use `StatusPill`.
 * @example <Badge variant="neutral">12 active</Badge>
 * @antipattern Don't use Badge to communicate risk severity — it carries no
 *   score/label invariant. Reach for `RiskBadge`.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium font-sans whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-slate-100 text-slate-700",
        brand: "bg-brand-100 text-brand-700",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";

export { badgeVariants };
