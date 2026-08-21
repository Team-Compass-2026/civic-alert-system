import { useEffect, useMemo } from "react";
import { Button, IconButton, Separator } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { StatusPill } from "@/components/civic/StatusPill";
import {
  RECOMMENDED_ACTIONS,
  REPORT_TYPES,
  RISK_STYLES,
  distanceKm,
  formatCoords,
  timeAgo,
  type AlertItem,
  type AreaRisk,
  type ReportFeedItem,
} from "@/lib/waterwatch";

export interface AlertDetailsDrawerProps {
  alert: AlertItem;
  area?: AreaRisk | undefined;
  reports: ReportFeedItem[];
  onClose: () => void;
  onVerify?: ((reportId: string, value: "confirm" | "dispute") => void) | undefined;
  verifying?: boolean;
}

const RADIUS_KM = 2.5;

/**
 * Slide-over panel with the full context behind an alert: where it is, its
 * workflow status, which community reports contributed to it, how neighbors
 * verified those reports, and what to do next.
 */
export function AlertDetailsDrawer({
  alert,
  area,
  reports,
  onClose,
  onVerify,
  verifying = false,
}: AlertDetailsDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const center: [number, number] | null =
    alert.lat !== null && alert.lng !== null
      ? [alert.lat, alert.lng]
      : area
        ? [area.lat, area.lng]
        : null;

  const contributing = useMemo(() => {
    const scoped = reports.filter((r) =>
      center
        ? distanceKm(center, [r.lat, r.lng]) <= RADIUS_KM
        : r.area_id === alert.area_id,
    );
    return scoped
      .slice()
      .sort(
        (a, b) =>
          b.confirms - a.confirms ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 6);
  }, [reports, center, alert.area_id]);

  const confirms = contributing.reduce((n, r) => n + r.confirms, 0);
  const disputes = contributing.reduce((n, r) => n + r.disputes, 0);
  const total = confirms + disputes;
  const agreement = total > 0 ? Math.round((confirms / total) * 100) : 0;

  const actions =
    alert.advice && alert.advice.trim().length > 0
      ? [alert.advice, ...RECOMMENDED_ACTIONS[alert.level].slice(0, 2)]
      : RECOMMENDED_ACTIONS[alert.level];

  const s = RISK_STYLES[alert.level];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close alert details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Alert details: ${alert.title}`}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge level={alert.level} score={area?.score ?? 0} />
              <StatusPill status={alert.status} />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {alert.title}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              {timeAgo(alert.created_at)}
            </p>
          </div>
          <IconButton label="Close alert details" variant="ghost" onClick={onClose}>
            <span aria-hidden="true">✕</span>
          </IconButton>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <p className="text-sm text-muted-foreground">{alert.body}</p>

          <div className={cn("rounded-md px-4 py-3", s.tint)}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </p>
            <p className="text-sm text-foreground">
              {alert.area_name ?? area?.name ?? "Yangon"}
              {alert.township ?? area?.township
                ? ` · ${alert.township ?? area?.township}`
                : ""}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {center ? formatCoords(center[0], center[1]) : "Coordinates unavailable"}
            </p>
          </div>

          <Separator />

          <section className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Contributing reports
            </h3>
            {contributing.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No community reports within {RADIUS_KM} km yet. This alert comes
                from area-level monitoring.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {contributing.map((r) => {
                  const meta = REPORT_TYPES[r.type];
                  const away = center
                    ? `${distanceKm(center, [r.lat, r.lng]).toFixed(1)} km away`
                    : (r.area_name ?? "nearby");
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col gap-2 rounded-md bg-muted px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          <span aria-hidden="true">{meta.icon}</span> {meta.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {timeAgo(r.created_at)} · {away}
                        </span>
                      </div>
                      {r.description ? (
                        <p className="text-sm text-muted-foreground">
                          {r.description}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          ✓ {r.confirms} · ✗ {r.disputes}
                        </span>
                        {onVerify ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-pill"
                              disabled={verifying}
                              onClick={() => onVerify(r.id, "confirm")}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-pill"
                              disabled={verifying}
                              onClick={() => onVerify(r.id, "dispute")}
                            >
                              Dispute
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <Separator />

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Nearby verification activity
            </h3>
            <p className="font-mono text-sm text-foreground">
              {confirms} confirmed · {disputes} disputed · {agreement}% agreement
            </p>
            <p className="text-sm text-muted-foreground">
              Based on {contributing.length} report
              {contributing.length === 1 ? "" : "s"} within {RADIUS_KM} km of this
              alert.
            </p>
          </section>

          <Separator />

          <section className="flex flex-col gap-2">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Recommended actions
            </h3>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              {actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
