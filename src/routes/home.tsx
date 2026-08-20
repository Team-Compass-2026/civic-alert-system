import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import {
  Alert,
  buttonVariants,
  Card,
  CardBody,
  Select,
  Separator,
  Spinner,
} from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";

import { RiskBadge } from "@/components/civic/RiskBadge";
import { SeverityBar } from "@/components/civic/SeverityBar";
import { ReportCard } from "@/components/civic/ReportCard";
import { AlertList } from "@/components/civic/AlertList";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import { DEFAULT_PREFS, getPrefs, savePrefs } from "@/lib/device";
import { OG_IMAGE_URL, trendLabel, type RiskComponent } from "@/lib/waterwatch";



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
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
  }),

  component: HomePage,
});

function HomePage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const slug = useId();
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_PREFS.areaSlug);
  const [showWhy, setShowWhy] = useState(false);
  const whyId = useId();


  useEffect(() => {
    setSelectedSlug(getPrefs().areaSlug);
  }, []);

  const area = areas.data?.find((a) => a.slug === selectedSlug) ?? areas.data?.[0];
  const nearby = (areas.data ?? []).filter((a) => a.area_id !== area?.area_id);
  const areaReports =
    feed.data?.filter((r) => !area || r.area_id === area.area_id).slice(0, 4) ?? [];
  const components = Object.entries(
    (area?.components ?? {}) as Record<string, RiskComponent>,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <Sidebar />
        <main className="flex-1 px-5 py-8 md:px-8">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-6">

          <header className="flex flex-col gap-1">
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Your Area
            </h1>
            <p className="text-sm text-muted-foreground">
              {area ? `${area.name}, ${area.township}` : "Yangon"}
            </p>
          </header>

          <div className="flex flex-col gap-2">
            <label
              htmlFor={slug}
              className="text-sm font-medium text-foreground"
            >
              Change neighborhood
            </label>
            <Select
              id={slug}
              value={selectedSlug}
              onChange={(e) => {
                setSelectedSlug(e.target.value);
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
            <>
              {/* YOUR AREA CARD */}
              <Card>
                <CardBody className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        WASH Risk
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Updated a few minutes ago
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

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Risk score
                      </span>
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {area.score}/100
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Trend vs last week
                      </span>
                      <span
                        className={`font-mono text-lg font-semibold ${
                          area.trend_pct > 0
                            ? "text-risk-high"
                            : "text-foreground"
                        }`}
                      >
                        {trendLabel(area.trend_pct)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Recent reports
                      </span>
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {area.reports_this_week}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* WHY THIS SCORE */}
              <Card>
                <CardBody className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setShowWhy((v) => !v)}
                    aria-expanded={showWhy}
                    aria-controls={whyId}
                    className="flex items-center justify-between gap-3 text-left focus-visible:rounded-md focus-visible:outline-none focus-visible:ring focus-visible:ring-ring"
                  >
                    <span className="font-display text-lg font-bold text-foreground">
                      Why this score?
                    </span>
                    <span
                      className="flex items-center gap-1 text-sm text-muted-foreground"
                      aria-hidden="true"
                    >
                      {showWhy ? "Hide" : "See why"}
                      <svg
                        viewBox="0 0 24 24"
                        className={`size-4 transition-transform duration-200 ${showWhy ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {showWhy ? (
                    <div id={whyId}>
                      <Separator className="mb-4" />
                      <div className="flex flex-col gap-4">
                        {components.map(([key, component]) => (
                          <SeverityBar
                            key={key}
                            score={component.score}
                            label={component.label}
                            detail={component.detail}
                          />
                        ))}
                      </div>
                      <Alert variant="warning" title="Local recommendation" className="mt-4">
                        Multiple water-quality concerns have been reported near
                        you. Consider using treated or boiled drinking water
                        until the situation is clarified.
                      </Alert>
                    </div>
                  ) : null}
                </CardBody>
              </Card>

            </>
          ) : null}

          {/* RECENT REPORTS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-foreground">
                Recent reports near you
              </h2>
              <Link
                to="/map"
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                View map →
              </Link>
            </div>
            <AlertList empty="No reports here yet. Be the first to flag a problem.">
              {areaReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </AlertList>
          </section>

          {/* NEARBY AREAS */}
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Nearby areas
            </h2>
            <Card>
              <CardBody className="flex flex-col gap-3 p-5">
                {nearby.map((a, i) => (
                  <div key={a.area_id} className="flex flex-col gap-3">
                    {i > 0 ? <Separator /> : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {a.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {a.township}
                        </span>
                      </div>
                      <RiskBadge level={a.level} score={a.score} size="sm" />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>

          {/* BOTTOM ACTIONS */}
          <div className="flex flex-wrap gap-3">
            <Link to="/report" className={buttonVariants({ size: "lg" })}>
              Report a Problem
            </Link>
            <Link
              to="/map"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              View Map
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


