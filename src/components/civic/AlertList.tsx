import * as React from "react";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";

export interface AlertListProps extends React.HTMLAttributes<HTMLDivElement> {
  filters?: React.ReactNode;
  empty?: React.ReactNode;
}

/** Feed rhythm owner: space-y-6 between items, optional filter slot. */
export const AlertList = React.forwardRef<HTMLDivElement, AlertListProps>(
  ({ filters, empty, children, className, ...props }, ref) => {
    const hasItems = React.Children.count(children) > 0;
    return (
      <div ref={ref} className={cn("flex flex-col gap-6", className)} {...props}>
        {filters ? <div className="flex flex-wrap gap-2">{filters}</div> : null}
        {hasItems ? (
          <div className="space-y-6">{children}</div>
        ) : (
          <div className="rounded-lg border border-border bg-muted p-8 text-center text-sm text-muted-foreground">
            {empty ?? "Nothing to show yet."}
          </div>
        )}
      </div>
    );
  },
);
AlertList.displayName = "AlertList";
