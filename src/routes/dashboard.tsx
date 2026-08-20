import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Spinner } from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { StatTile } from "@/components/civic/StatTile";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { SeverityBar } from "@/components/civic/SeverityBar";
import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { alertsQuery, areasQuery, reportFeedQuery } from "@/lib/queries";
import { DISCLAIMER, REPORT_TYPES, type ReportType } from "@/lib/waterwatch";

const TITLE = "Organization dashboard — WaterWatch";
const DESC =
  "Aggregate WASH signals across Yangon: active alerts, report volume, verification rate and the highest-risk neighborhoods.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const alerts = useQuery(alertsQuery);

  const reports = feed.data ?? [];
  const activeAlerts = (alerts.data ?? []).filter((a) => a.status === "active");
  const verified = reports.filter((r) => r.confirms > 0).length;
  const verificationRate = reports.length
    ? Math.round((verified / reports.length) * 100)
    : 0;

  const byType = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});
  const maxType = Math.max(1, ...Object.values(byType));

  const ranked = [...(areas.data ?? [])].sort((a, b) => b.score - a.score);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Organization dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggregate community signals across monitored Yangon neighborhoods.
          </p>
        </div>

        {areas.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Active alerts" value={activeAlerts.length} />
              <StatTile label="Reports (recent)" value={reports.length} />
              <StatTile
                label="Verification rate"
                value={`${verificationRate}%`}
                hint="Reports with at least one neighbor confirmation"
              />
              <StatTile label="Areas monitored" value={ranked.length} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardBody className="flex flex-col gap-4 p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Highest-risk areas
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {ranked.map((area) => (
                      <li
                        key={area.area_id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span className="text-sm text-foreground">
                          {area.name} · {area.township}
                        </span>
                        <RiskBadge level={area.level} score={area.score} size="sm" />
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex flex-col gap-4 p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Reports by type
                  </h2>
                  <div className="flex flex-col gap-4">
                    {Object.entries(byType).map(([type, count]) => (
                      <SeverityBar
                        key={type}
                        score={Math.round((count / maxType) * 100)}
                        label={`${REPORT_TYPES[type as ReportType]?.label ?? type} — ${count}`}
                      />
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            <NeighborhoodMap
              areas={areas.data ?? []}
              reports={reports}
              className="h-[32rem] w-full border border-border"
            />

            <p className="text-sm text-muted-foreground">{DISCLAIMER}</p>
          </>
        )}
      </main>

      <TabBar />
    </div>
  );
}
