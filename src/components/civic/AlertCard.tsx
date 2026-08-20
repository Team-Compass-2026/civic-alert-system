import * as React from "react";
import { Alert, Card, CardBody } from "@/design-system/design-idea-5cd787";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { StatusPill } from "@/components/civic/StatusPill";
import { timeAgo, type AlertItem, type AreaRisk } from "@/lib/waterwatch";

export interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  alert: AlertItem;
  area?: AreaRisk | undefined;
  actions?: React.ReactNode;
}

/** Alert summary: title, area, risk badge with score, mono timestamp, status. */
export const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  ({ alert, area, actions, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardBody className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RiskBadge level={alert.level} score={area?.score ?? scoreFloor(alert.level)} />
            <div className="flex items-center gap-2">
              <StatusPill status={alert.status} />
              <span className="font-mono text-xs text-muted-foreground">
                {timeAgo(alert.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-semibold text-foreground">
              {alert.title}
            </h3>
            <p className="text-sm text-muted-foreground">{alert.body}</p>
          </div>

          {area ? (
            <p className="text-xs text-muted-foreground">
              {area.name} · {area.township}
            </p>
          ) : null}

          {alert.advice ? (
            <Alert variant="info" title="Safe-water advice">
              {alert.advice}
            </Alert>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
        </CardBody>
      </Card>
    );
  },
);
AlertCard.displayName = "AlertCard";

function scoreFloor(level: AlertItem["level"]): number {
  return level === "CRITICAL" ? 85 : level === "HIGH" ? 67 : level === "MODERATE" ? 34 : 0;
}
