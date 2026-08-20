import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Card, CardBody } from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { ReportCard } from "@/components/civic/ReportCard";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import { RISK_LEVELS, type ReportFeedItem, type RiskLevel } from "@/lib/waterwatch";

const TITLE = "Neighborhood risk map — WaterWatch";
const DESC =
  "Explore water, sewage and flooding reports across Yangon neighborhoods with color-coded, labelled risk zones.";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const [levels, setLevels] = useState<RiskLevel[]>([]);
  const [selected, setSelected] = useState<ReportFeedItem | null>(null);

  const visibleAreas = (areas.data ?? []).filter(
    (a) => levels.length === 0 || levels.includes(a.level),
  );
  const visibleAreaIds = new Set(visibleAreas.map((a) => a.area_id));
  const visibleReports = (feed.data ?? []).filter(
    (r) => !r.area_id || visibleAreaIds.has(r.area_id),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-5 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Neighborhood risk map
          </h1>
          <p className="text-sm text-muted-foreground">
            Each zone shows its risk level and score — color is never the only
            signal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RISK_LEVELS.map((level) => {
            const active = levels.includes(level);
            return (
              <Button
                key={level}
                size="sm"
                variant={active ? "primary" : "outline"}
                onClick={() =>
                  setLevels((prev) =>
                    prev.includes(level)
                      ? prev.filter((l) => l !== level)
                      : [...prev, level],
                  )
                }
              >
                {level}
              </Button>
            );
          })}
        </div>

        <NeighborhoodMap
          areas={visibleAreas}
          reports={visibleReports}
          onSelectReport={setSelected}
          className="h-96 w-full border border-border"
        />

        {selected ? (
          <ReportCard report={selected} />
        ) : (
          <Card>
            <CardBody className="flex flex-col gap-3 p-5">
              <h2 className="font-display text-base font-semibold text-foreground">
                Areas by risk
              </h2>
              <ul className="flex flex-col gap-2">
                {visibleAreas.map((area) => (
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
        )}
      </main>

      <TabBar />
    </div>
  );
}
