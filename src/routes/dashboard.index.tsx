import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { StatTile } from "@/components/civic/StatTile";

import { RiskBadge } from "@/components/civic/RiskBadge";
import { ReportTypeIcon } from "@/components/civic/ReportTypeIcon";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import {
  DISCLAIMER,
  OG_IMAGE_URL,
  REPORT_TYPES,
  TREND_ARROW,
  timeAgo,
  trendDirection,
  type AreaRisk,
} from "@/lib/waterwatch";



const TITLE = "Yangon WASH Intelligence Dashboard — WaterWatch";
const DESC =
  "Organization view of water, sanitation and flood signals across Yangon: prioritization, trends and recent reports.";

const INDICATORS = [
  { label: "Water reports", count: 247, delta: 38 },
  { label: "Sanitation reports", count: 84, delta: 61 },
  { label: "Illness signals", count: 129, delta: 72 },
  { label: "Flood-related reports", count: 31, delta: 24 },
];

const overallRisk = { level: "HIGH" as const, score: 71 };

export const Route = createFileRoute("/dashboard/")({
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
  component: DashboardPage,
});


function priorityWhy(area: AreaRisk): string[] {
  const c = Object.values(area.components ?? {});
  if (c.length > 0) {
    return c.slice(0, 3).map(
      (x) => `${x.label} — ${x.score} · ${x.detail}`,
    );
  }
  return [
    `${area.reports_this_week} reports this week`,
    `Trend ${trendDirection(area.trend_pct) === "up" ? "rising" : "stable"}`,
    "Verified by nearby residents",
  ];
}

function DashboardPage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);

  const reports = feed.data ?? [];
  const ranked = [...(areas.data ?? [])].sort((a, b) => b.score - a.score);
  const top3 = ranked.slice(0, 3);
  const recent = reports.slice(0, 6);


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Sidebar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8">

        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            WaterWatch Intelligence
          </span>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Yangon WASH Intelligence Dashboard
              </h1>
            </div>
            <RiskBadge level={overallRisk.level} score={overallRisk.score} size="md" />
          </div>
        </header>

        {areas.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Indicators
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {INDICATORS.map((item) => (
                  <StatTile
                    key={item.label}
                    label={item.label}
                    value={item.count}
                    deltaPct={item.delta}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Where should you investigate first?
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {top3.map((area, index) => (
                  <Link
                    key={area.area_id}
                    to="/dashboard/$slug"
                    params={{ slug: area.slug }}
                    className="group rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-card"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-3xl font-semibold text-foreground">
                          {index + 1}
                        </span>
                        <RiskBadge level={area.level} score={area.score} size="sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-display text-base font-semibold text-foreground">
                          {area.name}
                        </span>
                        <span className="font-mono text-sm text-muted-foreground">
                          {TREND_ARROW[trendDirection(area.trend_pct)]}
                          {Math.abs(area.trend_pct)}% vs last week
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {priorityWhy(area).map((line) => (
                          <li key={line} className="flex items-start gap-2">
                            <span aria-hidden="true">·</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <span
                        className={cn(
                          buttonVariants({ size: "sm", variant: "outline" }),
                          "w-full rounded-pill transition-colors group-hover:bg-brand-50",
                        )}
                      >
                        View area breakdown
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Recent reports
                  </h2>
                </CardHeader>
                <CardBody className="overflow-x-auto p-5">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Area</th>
                        <th className="pb-3 font-medium">Report</th>
                        <th className="pb-3 font-medium">Verification</th>
                        <th className="pb-3 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recent.map((report) => (
                        <tr
                          key={report.id}
                          className="transition-colors hover:bg-muted/60"
                        >
                          <td className="py-3">
                            <ReportTypeIcon type={report.type} />
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {report.area_name ?? "—"}
                          </td>
                          <td className="max-w-xs py-3">
                            <span className="block truncate text-foreground">
                              {report.description ??
                                REPORT_TYPES[report.type].label}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-muted-foreground">
                            ✓ {report.confirms} · ✗ {report.disputes}
                          </td>
                          <td className="py-3 font-mono text-muted-foreground">
                            {timeAgo(report.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-pill border border-border px-3 py-1">
                      Date range
                    </span>
                    <span className="rounded-pill border border-border px-3 py-1">
                      Report type
                    </span>
                    <span className="rounded-pill border border-border px-3 py-1">
                      Township
                    </span>
                    <span className="rounded-pill border border-border px-3 py-1">
                      Verification status
                    </span>
                    <span className="rounded-pill bg-muted px-3 py-1">
                      Filters enabled in live build
                    </span>
                  </div>
                </CardBody>
              </Card>
            </section>

            <section className="flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" disabled>
                  Export CSV (coming soon)
                </Button>
                <Button variant="outline" disabled>
                  Subscribe (coming soon)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {DISCLAIMER} · Team Compass 🧭 · DEEP 2026
              </p>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

