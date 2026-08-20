import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { useWaterwatchRealtime } from "@/hooks/useWaterwatchRealtime";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { alertsQuery, areasQuery, reportFeedQuery } from "@/lib/queries";
import { verifyReport } from "@/lib/actions";
import { getPrefs, DEFAULT_PREFS } from "@/lib/device";
import {
  DISCLAIMER,
  OG_IMAGE_URL,
  REPORT_TYPES,
  RISK_STYLES,
  timeAgo,
  type AlertItem,
  type AreaRisk,
  type ReportFeedItem,
} from "@/lib/waterwatch";


const TITLE = "Alerts for your neighborhood — WaterWatch";
const DESC =
  "Localized WASH warnings with practical safe-water advice, plus nearby reports waiting for a neighbor to confirm or dispute.";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
  }),

  component: AlertsPage,
});

function AlertGlyph({ level }: { level: AlertItem["level"] }) {
  const s = RISK_STYLES[level];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-20 w-full items-center justify-center rounded-md",
        s.tint,
      )}
    >
      <svg
        viewBox="0 0 120 40"
        className={cn("h-10 w-full", s.text)}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M0 26c10-8 20 8 30 0s20-8 30 0 20 8 30 0 20-8 30 0" />
        <path d="M0 34c10-8 20 8 30 0s20-8 30 0 20 8 30 0 20-8 30 0" opacity="0.5" />
        <path d="M60 4c4 6 8 9 8 13a8 8 0 0 1-16 0c0-4 4-7 8-13Z" />
      </svg>
    </div>
  );
}

function AlertFeedCard({
  alert,
  area,
}: {
  alert: AlertItem;
  area?: AreaRisk | undefined;
}) {
  const s = RISK_STYLES[alert.level];
  return (
    <Card className={cn("border-l-4", s.border)}>
      <CardBody className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <RiskBadge level={alert.level} score={area?.score ?? floorScore(alert.level)} />
          <span className="font-mono text-xs text-muted-foreground">
            {timeAgo(alert.created_at)}
          </span>
        </div>

        <AlertGlyph level={alert.level} />

        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold text-foreground">
            {alert.title}
          </h3>
          <p className="text-sm text-muted-foreground">{alert.body}</p>
          {alert.advice ? (
            <p className="text-sm text-foreground">{alert.advice}</p>
          ) : null}
          {area ? (
            <p className="text-xs text-muted-foreground">
              {area.name} · {area.township}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/map"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-pill")}
          >
            View map
          </Link>
          <Link
            to="/report"
            className={cn(buttonVariants({ size: "sm" }), "rounded-pill")}
          >
            Report a problem
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function VerifyCard({
  report,
  answered,
  pending,
  onAnswer,
}: {
  report: ReportFeedItem;
  answered: string | undefined;
  pending: boolean;
  onAnswer: (value: "confirm" | "dispute" | "unsure") => void;
}) {
  const meta = REPORT_TYPES[report.type];
  return (
    <Card className={cn("border-l-4", RISK_STYLES.MODERATE.border)}>
      <CardBody className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <RiskBadge level="MODERATE" score={50} />
          <span className="font-mono text-xs text-muted-foreground">
            {timeAgo(report.created_at)}
          </span>
        </div>

        <AlertGlyph level="MODERATE" />

        <div className="flex flex-col gap-1">
          <h3 className="font-display text-base font-semibold text-foreground">
            Verify this report
          </h3>
          <p className="text-sm text-muted-foreground">
            {meta.icon} {report.description ?? meta.label} — reported in{" "}
            {report.area_name ?? "your area"}. Confirm or dispute to help your
            neighbors.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            ✓ {report.confirms} · ✗ {report.disputes}
          </p>
        </div>

        {answered ? (
          <p className="text-sm font-medium text-risk-low">
            Thanks — your feedback helps.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-pill"
              disabled={pending}
              onClick={() => onAnswer("confirm")}
            >
              ✓ Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-pill"
              disabled={pending}
              onClick={() => onAnswer("dispute")}
            >
              ✗ Dispute
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-pill"
              disabled={pending}
              onClick={() => onAnswer("unsure")}
            >
              Not sure
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function AlertsPage() {
  useWaterwatchRealtime();
  const alerts = useQuery(alertsQuery);
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const queryClient = useQueryClient();

  const [homeSlug, setHomeSlug] = useState(DEFAULT_PREFS.areaSlug);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setHomeSlug(getPrefs().areaSlug);
  }, []);

  const vote = useMutation({
    mutationFn: ({ id, value }: { id: string; value: "confirm" | "dispute" }) =>
      verifyReport(id, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["report-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  const areaList = areas.data ?? [];
  const homeArea = areaList.find((a) => a.slug === homeSlug);
  const areaOf = (id: string | null) => areaList.find((a) => a.area_id === id);

  const allAlerts = alerts.data ?? [];
  const homeAlerts = homeArea
    ? allAlerts.filter((a) => a.area_id === homeArea.area_id)
    : [];
  const otherAlerts = homeArea
    ? allAlerts.filter((a) => a.area_id !== homeArea.area_id)
    : allAlerts;

  const verifyTarget = (feed.data ?? []).find(
    (r) => r.status !== "resolved" && r.confirms + r.disputes < 5,
  );

  function answer(id: string, value: "confirm" | "dispute" | "unsure") {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (value !== "unsure") vote.mutate({ id, value });
  }

  const loading = alerts.isLoading || areas.isLoading || feed.isLoading;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Sidebar />

      <main className="mx-auto w-full max-w-[30rem] flex-1 px-5 py-8 md:pl-64">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Localized warnings for your neighborhood, Yangon.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Your area
                </h2>
                <span className="text-xs text-muted-foreground">
                  {homeArea ? homeArea.name : "Set your home area in Profile"}
                </span>
              </div>
              {homeAlerts.length > 0 ? (
                homeAlerts.map((alert) => (
                  <AlertFeedCard
                    key={alert.id}
                    alert={alert}
                    area={areaOf(alert.area_id)}
                  />
                ))
              ) : (
                <Card>
                  <CardBody className="flex flex-col gap-3 p-5">
                    <p className="text-sm text-muted-foreground">
                      No alerts for your home area right now. Set your home area
                      in Profile to see localized alerts first.
                    </p>
                    <Link
                      to="/profile"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "self-start rounded-pill",
                      )}
                    >
                      Set home area
                    </Link>
                  </CardBody>
                </Card>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-base font-semibold text-foreground">
                Across Yangon
              </h2>

              {verifyTarget ? (
                <VerifyCard
                  report={verifyTarget}
                  answered={answers[verifyTarget.id]}
                  pending={vote.isPending}
                  onAnswer={(value) => answer(verifyTarget.id, value)}
                />
              ) : null}

              {otherAlerts.map((alert) => (
                <AlertFeedCard
                  key={alert.id}
                  alert={alert}
                  area={areaOf(alert.area_id)}
                />
              ))}
            </section>
          </div>
        )}

        <p className="mt-10 text-xs text-muted-foreground">{DISCLAIMER}</p>
      </main>

    </div>
  );
}

function floorScore(level: AlertItem["level"]): number {
  return level === "CRITICAL" ? 85 : level === "HIGH" ? 67 : level === "MODERATE" ? 34 : 0;
}
