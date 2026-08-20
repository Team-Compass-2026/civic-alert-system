import * as React from "react";
import { Button, Card, CardBody } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { ReportTypeIcon } from "@/components/civic/ReportTypeIcon";
import { StatusPill } from "@/components/civic/StatusPill";
import { timeAgo, type ReportFeedItem } from "@/lib/waterwatch";

export interface ReportCardProps extends React.HTMLAttributes<HTMLDivElement> {
  report: ReportFeedItem;
  onConfirm?: (id: string) => void;
  onDispute?: (id: string) => void;
  voted?: boolean;
  pending?: boolean;
}

/** Citizen report feed item. */
export const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(
  ({ report, onConfirm, onDispute, voted, pending, className, ...props }, ref) => {
    const showActions = Boolean(onConfirm || onDispute);
    return (
      <Card ref={ref} className={className} {...props}>
        <CardBody className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ReportTypeIcon type={report.type} className="font-medium" />
            <div className="flex items-center gap-2">
              <StatusPill status={report.status} />
              <span className="font-mono text-xs text-muted-foreground">
                {timeAgo(report.created_at)}
              </span>
            </div>
          </div>

          {report.description ? (
            <p className="text-sm text-foreground">{report.description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{report.area_name ?? "Unmapped area"}</span>
            {report.when_happened ? <span>{report.when_happened}</span> : null}
            <span className="font-mono">
              {report.confirms} confirmed · {report.disputes} disputed
            </span>
            {report.is_anonymous ? <span>Anonymous</span> : null}
          </div>

          {showActions ? (
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                disabled={voted || pending}
                onClick={() => onConfirm?.(report.id)}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={voted || pending}
                onClick={() => onDispute?.(report.id)}
              >
                Dispute
              </Button>
              {voted ? (
                <span className={cn("text-xs text-muted-foreground")}>
                  Thanks — your response was recorded.
                </span>
              ) : null}
            </div>
          ) : null}
        </CardBody>
      </Card>
    );
  },
);
ReportCard.displayName = "ReportCard";
