import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  buttonVariants,
  Card,
  CardBody,
  Select,
  Spinner,
} from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { SeverityBar } from "@/components/civic/SeverityBar";
import { ReportCard } from "@/components/civic/ReportCard";
import { AlertList } from "@/components/civic/AlertList";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import { DEFAULT_PREFS, getPrefs, savePrefs } from "@/lib/device";
import { trendLabel, type RiskComponent } from "@/lib/waterwatch";

const TITLE = "Your area's water risk — WaterWatch";
const DESC =
  "Live WASH risk score, contributing signals and recent neighbor reports for your Yangon neighborhood.";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const [slug, setSlug] = useState(DEFAULT_PREFS.areaSlug);

  useEffect(() => {
    setSlug(getPrefs().areaSlug);
  }, []);

  const area = areas.data?.find((a) => a.slug === slug) ?? areas.data?.[0];
  const areaReports =
    feed.data?.filter((r) => !area || r.area_id === area.area_id).slice(0, 8) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="area-select"
              className="text-sm font-medium text-foreground"
            >
              Your neighborhood
            </label>
            <Select
              id="area-select"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                savePrefs({ ...getPrefs(), areaSlug: e.target.value });
              }}
            >
              {(areas.data ?? []).map((a) => (
                <option key={a.area_id} value={a.slug}>
                  {a.name} — {a.township}
                </option>
              ))}
            </Select>
          </div>

          {areas.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : area ? (
            <Card>
              <CardBody className="flex flex-col gap-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      {area.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {area.township} · {area.reports_this_week} reports this week ·{" "}
                      <span className="font-mono">{trendLabel(area.trend_pct)}</span>
                    </p>
                  </div>
                  <RiskBadge level={area.level} score={area.score} />
                </div>

                <SeverityBar
                  score={area.score}
                  level={area.level}
                  label="WASH risk score"
                  detail="Score combines verified reports, clustering and recency."
                />

                <div className="flex flex-col gap-4">
                  {Object.entries(
                    (area.components ?? {}) as Record<string, RiskComponent>,
                  ).map(([key, component]) => (
                    <SeverityBar
                      key={key}
                      score={component.score}
                      label={component.label}
                      detail={component.detail}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/report" className={buttonVariants({ size: "md" })}>
                    Report a Problem
                  </Link>
                  <Link
                    to="/map"
                    className={buttonVariants({ size: "md", variant: "outline" })}
                  >
                    View on map
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Recent reports nearby
            </h2>
            <AlertList empty="No reports here yet. Be the first to flag a problem.">
              {areaReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </AlertList>
          </section>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
