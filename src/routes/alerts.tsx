import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Spinner } from "@/design-system/design-idea-5cd787";
import { useWaterwatchRealtime } from "@/hooks/useWaterwatchRealtime";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { AlertList } from "@/components/civic/AlertList";
import { AlertCard } from "@/components/civic/AlertCard";
import { ReportCard } from "@/components/civic/ReportCard";
import { alertsQuery, areasQuery, reportFeedQuery } from "@/lib/queries";
import { verifyReport } from "@/lib/actions";

const TITLE = "Alerts & verification requests — WaterWatch";
const DESC =
  "Active WASH alerts with safe-water advice, plus nearby reports waiting for a neighbor to confirm or dispute.";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: AlertsPage,
});

type Tab = "alerts" | "verify";

function AlertsPage() {
  useWaterwatchRealtime();
  const alerts = useQuery(alertsQuery);
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("alerts");
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const vote = useMutation({
    mutationFn: ({ id, value }: { id: string; value: "confirm" | "dispute" }) =>
      verifyReport(id, value),
    onSuccess: async (_data, variables) => {
      setVoted((prev) => ({ ...prev, [variables.id]: true }));
      await queryClient.invalidateQueries({ queryKey: ["report-feed"] });
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  const pendingReports = (feed.data ?? []).filter((r) => r.status !== "resolved");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Alerts</h1>

        <div className="mt-4">
          <AlertList
            filters={
              <>
                <Button
                  size="sm"
                  variant={tab === "alerts" ? "primary" : "outline"}
                  onClick={() => setTab("alerts")}
                >
                  Active alerts
                </Button>
                <Button
                  size="sm"
                  variant={tab === "verify" ? "primary" : "outline"}
                  onClick={() => setTab("verify")}
                >
                  Verify nearby reports
                </Button>
              </>
            }
            empty={
              tab === "alerts"
                ? "No active alerts. That's good news."
                : "Nothing to verify right now."
            }
          >
            {alerts.isLoading || feed.isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : tab === "alerts" ? (
              (alerts.data ?? []).map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  area={(areas.data ?? []).find((a) => a.area_id === alert.area_id)}
                />
              ))
            ) : (
              pendingReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  voted={voted[report.id] ?? false}
                  pending={vote.isPending}
                  onConfirm={(id) => vote.mutate({ id, value: "confirm" })}
                  onDispute={(id) => vote.mutate({ id, value: "dispute" })}
                />
              ))
            )}
          </AlertList>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
