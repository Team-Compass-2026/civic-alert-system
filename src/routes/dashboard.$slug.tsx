import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Spinner } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { RiskBadge } from "@/components/civic/RiskBadge";

import { ReportTypeIcon } from "@/components/civic/ReportTypeIcon";
import { SeverityBar } from "@/components/civic/SeverityBar";
import { useServerFn } from "@tanstack/react-start";
import { RequireAccess } from "@/components/auth/RequireAccess";
import { friendlyAuthError } from "@/lib/authErrors";
import { getAreaDashboard } from "@/lib/access.functions";
import type { AlertItem, AreaRisk, ReportFeedItem } from "@/lib/waterwatch";
import {
  ALERT_STATUS_LABEL,
  DISCLAIMER,
  OG_IMAGE_URL,
  REPORT_TYPES,
  timeAgo,
  type RiskComponent,
} from "@/lib/waterwatch";


export const Route = createFileRoute("/dashboard/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Area breakdown — ${params.slug} | WaterWatch` },
      { name: "description", content: "Risk-component breakdown and all reports for this Yangon area." },
      { property: "og:image", content: OG_IMAGE_URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE_URL },
    ],
  }),

  ssr: false,
  component: AreaDashboardPage,
});

function AreaDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8">
        <RequireAccess roles={["admin", "org"]}>
          {() => <AreaDashboard />}
        </RequireAccess>
      </main>
      <Footer />
    </div>
  );
}

function AreaDashboard() {
  const { slug } = Route.useParams();
  const getAreaDashboardFn = useServerFn(getAreaDashboard);
  const scoped = useQuery({
    queryKey: ["area-dashboard", slug],
    queryFn: () => getAreaDashboardFn({ data: { slug } }),
    retry: false,
  });

  const area = scoped.data?.area as AreaRisk | undefined;
  const areaReports = (scoped.data?.reports ?? []) as unknown as ReportFeedItem[];
  const areaAlerts = (scoped.data?.alerts ?? []) as unknown as AlertItem[];

  if (scoped.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!area) {
    return (
      <>
        <Link to="/dashboard" className="text-sm text-brand-700 underline">
          ← Back to dashboard
        </Link>
        <p className="text-foreground">
          {scoped.isError
            ? friendlyAuthError(scoped.error, "This area is outside your authorized scope.")
            : "Area not found."}
        </p>
      </>
    );
  }

  const components = Object.values(area.components ?? {}) as RiskComponent[];

  return (
    <>

        <Link to="/dashboard" className="text-sm text-brand-700 underline transition-colors duration-200 hover:text-brand-800">
          ← Back to dashboard
        </Link>

        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {area.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {area.township} · Risk breakdown
              </p>
            </div>
            <RiskBadge level={area.level} score={area.score} size="md" />
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Why this score?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {components.length > 0 ? (
              components.map((c) => (
                <SeverityBar
                  key={c.label}
                  score={c.score}
                  label={c.label}
                  detail={c.detail}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No component data available.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-semibold text-foreground">
                Alerts issued for {area.name}
              </h2>
            </CardHeader>
            <CardBody>
              {areaAlerts.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border">
                  {areaAlerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {alert.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {alert.body}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {ALERT_STATUS_LABEL[alert.status] ?? alert.status} ·{" "}
                          {timeAgo(alert.created_at)}
                        </span>
                        <RiskBadge level={alert.level} score={area.score} size="sm" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No alerts issued for this area yet.
                </p>
              )}
            </CardBody>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-semibold text-foreground">
                All reports in {area.name}
              </h2>
            </CardHeader>
            <CardBody className="overflow-x-auto p-5">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Report</th>
                    <th className="pb-3 font-medium">Verification</th>
                    <th className="pb-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {areaReports.map((report) => (
                    <tr key={report.id} className="transition-colors hover:bg-muted/60">
                      <td className="py-3">
                        <ReportTypeIcon type={report.type} />
                      </td>
                      <td className="max-w-md py-3">
                        <span className="block truncate text-foreground">
                          {report.description ?? REPORT_TYPES[report.type].label}
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
                  {areaReports.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        No reports in this area yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </section>

        <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
    </>
  );
}

