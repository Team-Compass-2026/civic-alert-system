import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

/**
 * @usage Contained surface for grouped content — an alert summary, a stat
 *   tile, a settings panel. Compose Header/Body/Footer; pass nothing for a
 *   borderless inner region.
 * @example <Card><CardHeader title="River gauge" /><CardBody>…</CardBody></Card>
 * @antipattern Don't nest a Card inside a Card to fake sections — use
 *   `Separator` or spacing instead.
 */
export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-card",
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

export interface CardHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1 p-5", className)}
      {...props}
    >
      {title ? (
        <h3 className="text-base font-semibold font-display text-foreground">
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  );
});
CardBody.displayName = "CardBody";

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 p-5 pt-0", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";
