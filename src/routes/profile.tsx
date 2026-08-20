import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardBody, Select, Switch } from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { ReportCard } from "@/components/civic/ReportCard";
import { AlertList } from "@/components/civic/AlertList";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import {
  DEFAULT_PREFS,
  getMyReportIds,
  getPrefs,
  savePrefs,
  type AlertPrefs,
} from "@/lib/device";
import { DISCLAIMER } from "@/lib/waterwatch";

const TITLE = "Your reports & alert settings — WaterWatch";
const DESC =
  "Review the reports you submitted and choose which WaterWatch alerts you want for your neighborhood.";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [myIds, setMyIds] = useState<string[]>([]);

  useEffect(() => {
    setPrefs(getPrefs());
    setMyIds(getMyReportIds());
  }, []);

  function update(patch: Partial<AlertPrefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
  }

  const myReports = (feed.data ?? []).filter((r) => myIds.includes(r.id));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-8">
        <section className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Alert settings
          </h1>
          <Card>
            <CardBody className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pref-area"
                  className="text-sm font-medium text-foreground"
                >
                  Alert me about
                </label>
                <Select
                  id="pref-area"
                  value={prefs.areaSlug}
                  onChange={(e) => update({ areaSlug: e.target.value })}
                >
                  {(areas.data ?? []).map((a) => (
                    <option key={a.area_id} value={a.slug}>
                      {a.name} — {a.township}
                    </option>
                  ))}
                </Select>
              </div>

              <Switch
                checked={prefs.highRisk}
                onChange={(e) => update({ highRisk: e.target.checked })}
                label="High-risk alerts"
              />
              <Switch
                checked={prefs.verifyRequests}
                onChange={(e) => update({ verifyRequests: e.target.checked })}
                label="Verification requests from neighbors"
              />
              <Switch
                checked={prefs.neighborhoodUpdates}
                onChange={(e) => update({ neighborhoodUpdates: e.target.checked })}
                label="Weekly neighborhood updates"
              />
            </CardBody>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Your reports
          </h2>
          <AlertList empty="You haven't submitted a report from this device yet.">
            {myReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </AlertList>
        </section>

        <p className="text-sm text-muted-foreground">{DISCLAIMER}</p>
      </main>

      <TabBar />
    </div>
  );
}
