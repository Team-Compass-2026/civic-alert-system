import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Spinner } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { RiskBadge } from "@/components/civic/RiskBadge";

import { ReportTypeIcon } from "@/components/civic/ReportTypeIcon";
import { SeverityBar } from "@/components/civic/SeverityBar";
import { areasQuery, reportFeedQuery } from "@/lib/queries";
import { DISCLAIMER, OG_IMAGE_URL, REPORT_TYPES, timeAgo, type RiskComponent } from "@/lib/waterwatch";


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

  component: AreaDashboard,
});

function AreaDashboard() {
  const { slug } = Route.useParams();
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);

  const area = (areas.data ?? []).find((a) => a.slug === slug);
  const areaReports = (feed.data ?? []).filter((r) => r.area_id === area?.area_id);

  if (!area) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <Sidebar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8">
          <Link to="/dashboard" className="text-sm text-brand-700 underline">
            ← Back to dashboard
          </Link>
          <p className="text-foreground">Area not found.</p>
        </main>
        <Footer />
      </div>
    );

  }

  const components = Object.values(area.components ?? {}) as RiskComponent[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Sidebar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-8">

        <Link to="/dashboard" className="text-sm text-brand-700 underline">
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
      </main>

      <TabBar />
    </div>
  );
}
