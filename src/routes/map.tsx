import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { useWaterwatchRealtime } from "@/hooks/useWaterwatchRealtime";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";

import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import {
  REPORT_TYPES,
  REPORT_TYPE_CSS_VAR,
  REPORT_TYPE_ORDER,
  RISK_STYLES,
  TREND_ARROW,
  TREND_TEXT,
  OG_IMAGE_URL,
  trendDirection,
} from "@/lib/waterwatch";


const TITLE = "Current data — Yangon WASH risk map | WaterWatch";
const DESC =
  "A live overview of water, sewage and flooding reports across Yangon neighborhoods, with color-coded and labelled risk zones.";

const RISK_LEGEND = [
  { level: "CRITICAL", range: "85–100" },
  { level: "HIGH", range: "67–84" },
  { level: "MODERATE", range: "34–66" },
  { level: "LOW", range: "0–33" },
] as const;

export const Route = createFileRoute("/map")({
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

  component: MapPage,
});

function MapPage() {
  useWaterwatchRealtime();
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);

  const areaList = areas.data ?? [];

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Sidebar />

      <main className="flex w-full flex-1 flex-col gap-6 pb-8">
        <div className="mx-auto w-full max-w-6xl px-5 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Current Data
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                A live overview of Yangon. Tap an area to see why its risk score
                changed. Tap a marker to see the report.
              </p>
            </div>
            <Link
              to="/report"
              className={buttonVariants({ size: "md" })}
            >
              + Report a Problem
            </Link>

          </div>
        </div>

        <NeighborhoodMap
          areas={areaList}
          reports={feed.data ?? []}
          showAreaDetails
          className="h-64 w-full border border-border sm:h-80 md:h-[32rem]"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Recent updates
                </h2>
                <p className="text-sm text-muted-foreground">
                  Latest trends across Yangon townships
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-5">
              <ul className="flex flex-col divide-y divide-border">
                {areaList.map((area) => {
                  const dir = trendDirection(area.trend_pct);
                  return (
                    <li
                      key={area.area_id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {area.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {area.township} ·{" "}
                          <span className="font-mono">
                            {area.reports_this_week}
                          </span>{" "}
                          reports this week
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn("font-mono text-sm", TREND_TEXT[dir])}
                        >
                          {TREND_ARROW[dir]}
                          {Math.abs(area.trend_pct)}%
                        </span>
                        <RiskBadge level={area.level} score={area.score} size="sm" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-semibold text-foreground">
                Legend
              </h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-5 p-5">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-foreground">Risk levels</h3>
                <ul className="flex flex-wrap gap-2">
                  {RISK_LEGEND.map((item) => (
                    <li key={item.level} className="flex items-center gap-2">
                      <RiskBadge
                        level={item.level}
                        score={Number(item.range.split("–")[1])}
                        size="sm"
                        className={RISK_STYLES[item.level].tint}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.range}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-foreground">
                  Report types
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {REPORT_TYPE_ORDER.map((type) => (
                    <li
                      key={type}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="size-2.5 rounded-pill"
                        style={{
                          backgroundColor: `var(${REPORT_TYPE_CSS_VAR[type]})`,
                        }}
                      />
                      <span aria-hidden="true">{REPORT_TYPES[type].icon}</span>
                      <span>{REPORT_TYPES[type].label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>

      <Link
        to="/report"
        className={cn(
          buttonVariants({ size: "lg" }),
          "fixed bottom-8 right-5 z-20",
        )}
      >
        Report a Problem
      </Link>

      <Footer />
    </div>
  );
}

