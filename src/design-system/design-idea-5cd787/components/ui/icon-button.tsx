import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Square action control holding a single icon — toolbar toggles, row
 *   menu triggers, icon-only navigation. Must carry an accessible name.
 * @example <IconButton label="Map layers" onClick={...}><LayersIcon /></IconButton>
 * @antipattern Never omit `label` — an icon-only button with no accessible name
 *   is invisible to screen readers and keyboard users.
 */
const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors duration-150 select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:focus-ring [&_svg]:size-[1.125em]",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        destructive: "bg-risk-high text-white hover:bg-risk-high/90",
      },
      size: {
        sm: "size-9",
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Required accessible name for the icon-only control. */
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        aria-label={label}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
