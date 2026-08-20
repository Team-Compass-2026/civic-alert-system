import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Single-line text entry in forms — search, names, filter queries. Pair
 *   with `Label` and a `hint`/error message.
 * @example <Label htmlFor="loc">Location</Label><Input id="loc" placeholder="Yangon" />
 * @antipattern Don't replicate this for multi-line content — use `Textarea`.
 */
const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:focus-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
      state: {
        default: "",
        error:
          "border-risk-high text-risk-high placeholder:text-risk-high/60 focus-visible:border-risk-high",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Marks the field as invalid and applies the error style. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          inputVariants({ size, state: invalid ? "error" : state }),
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
