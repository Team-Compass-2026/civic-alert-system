import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  Switch,
  Spinner,
  Alert,
  buttonVariants,
} from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { StatusPill } from "@/components/civic/StatusPill";
import { AlertCard } from "@/components/civic/AlertCard";
import { AlertList } from "@/components/civic/AlertList";
import { useAuth } from "@/hooks/useAuth";
import { ReportTypeIcon } from "@/components/civic/ReportTypeIcon";
import { alertsQuery, areasQuery, reportFeedQuery } from "@/lib/queries";
import { getMyProfile, updateMyProfileArea } from "@/lib/profile.functions";
import {
  DEFAULT_PREFS,
  getMyReportIds,
  getPrefs,
  savePrefs,
  type AlertPrefs,
} from "@/lib/device";
import { DISCLAIMER, OG_IMAGE_URL, timeAgo } from "@/lib/waterwatch";

const TITLE = "Your profile & alert settings — WaterWatch";
const DESC =
  "Your community reputation, the reports you filed, and the settings that decide which localized WaterWatch alerts you receive.";

export const Route = createFileRoute("/profile")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
  },
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

  component: ProfilePage,
});

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
      {children}
    </span>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/60">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getMyProfileFn = useServerFn(getMyProfile);
  const updateMyProfileAreaFn = useServerFn(updateMyProfileArea);
  const areas = useQuery(areasQuery);
  const feed = useQuery(reportFeedQuery);
  const alerts = useQuery(alertsQuery);
  const profile = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfileFn(),
  });

  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [myIds, setMyIds] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");

  const updateArea = useMutation({
    mutationFn: (vars: { areaId: string | null }) =>
      updateMyProfileAreaFn({ data: vars }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });



  useEffect(() => {
    const loaded = getPrefs();
    setPrefs(loaded);
    setMyIds(getMyReportIds());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else if (prefs.theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("dark", "light");
    }
  }, [prefs.theme]);


  function update(patch: Partial<AlertPrefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const all = feed.data ?? [];
  const mine = all.filter((r) => myIds.includes(r.id));
  const myReports = mine.length > 0 ? mine : all.slice(0, 3);
  const confirmations = myReports.reduce((sum, r) => sum + r.confirms, 0);

  const activeAreaId = profile.data?.area_id ?? null;
  const myArea = activeAreaId
    ? (areas.data ?? []).find((a) => a.area_id === activeAreaId)
    : (areas.data ?? []).find((a) => a.slug === prefs.areaSlug);

  const myAreaAlerts = (alerts.data ?? []).filter(
    (a) => myArea && a.area_id === myArea.area_id,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col gap-8 px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Profile
        </h1>

        {auth.expired ? (
          <Alert variant="danger" title="Your session expired">
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Sign in again to keep receiving alerts for your area.
              </p>
              <Link to="/auth" className={cn(buttonVariants({ size: "sm" }))}>
                Sign in
              </Link>
            </div>
          </Alert>
        ) : null}

        {auth.user ? (
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Signed in as {auth.user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  Home area: {myArea?.name ?? "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/report" className={buttonVariants({ size: "sm" })}>
                  Report a problem
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleSignOut()}
                >
                  Sign out
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-foreground">
              Alerts for {myArea?.name ?? "your area"}
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void alerts.refetch()}
              disabled={alerts.isFetching}
            >
              Refresh
            </Button>
          </div>

          {alerts.isLoading || profile.isLoading ? (
            <Card>
              <CardBody className="flex items-center justify-center gap-2 p-5">
                <Spinner />
                <span className="text-sm text-muted-foreground">
                  Loading alerts…
                </span>
              </CardBody>
            </Card>
          ) : alerts.isError ? (
            <Alert variant="danger" title="Could not load alerts">
              <div className="flex flex-col gap-3">
                <p className="text-sm">{(alerts.error as Error).message}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void alerts.refetch()}
                >
                  Try again
                </Button>
              </div>
            </Alert>
          ) : myAreaAlerts.length > 0 ? (
            <AlertList>
              {myAreaAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </AlertList>
          ) : (
            <Card>
              <CardBody className="p-5">
                <p className="text-sm text-muted-foreground">
                  No active alerts for your area right now.
                </p>
              </CardBody>
            </Card>
          )}
        </section>

        <Card>
          <CardBody className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-pill bg-brand-50 text-2xl"
              >
                💧
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-lg font-semibold text-foreground">
                  WaterWatch Guardian
                </span>
                <span className="text-xs text-muted-foreground">
                  Community reputation ·{" "}
                  <span className="font-mono">{myReports.length}</span> reports ·{" "}
                  <span className="font-mono">{confirmations}</span> confirmations
                  received
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip>🛡️ Verified Reporter</Chip>
              <Chip>
                ⭐ <span className="font-mono">{confirmations}</span> confirmations
              </Chip>
              <Chip>
                🤝 <span className="font-mono">15</span> community verifications
              </Chip>
            </div>
          </CardBody>
        </Card>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            My reports
          </h2>
          <Card>
            <CardBody className="flex flex-col divide-y divide-border p-5">
              {myReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <ReportTypeIcon type={report.type} className="font-medium" />
                    <StatusPill
                      status={report.confirms >= 2 ? "resolved" : "open"}
                    />
                  </div>
                  {report.description ? (
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {report.area_name ?? "Unmapped area"} ·{" "}
                    <span className="font-mono">{report.confirms}</span> confirms
                    · <span className="font-mono">{timeAgo(report.created_at)}</span>
                  </p>
                </div>
              ))}
              {myReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't submitted a report from this device yet.
                </p>
              ) : null}
            </CardBody>
          </Card>
        </section>

        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-foreground">
              You have helped verify{" "}
              <span className="font-mono">15</span> nearby reports.
            </p>
            <Link
              to="/alerts"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "rounded-pill",
              )}
            >
              Verify more
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-base font-semibold text-foreground">
              Settings
            </h2>
          </CardHeader>
          <CardBody className="flex flex-col divide-y divide-border p-5">
            <SettingRow
              label="Location"
              hint="Set your home area to get localized alerts"
            >
              <Select
                aria-label="Home area"
                value={myArea?.slug ?? prefs.areaSlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  const area = (areas.data ?? []).find((a) => a.slug === slug);
                  update({ areaSlug: slug });
                  if (area && auth.user) {
                    void updateArea.mutate({ areaId: area.area_id });
                  }
                }}
              >
                {(areas.data ?? []).map((a) => (
                  <option key={a.area_id} value={a.slug}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </SettingRow>

            <SettingRow label="Local alerts">
              <Switch
                checked={prefs.highRisk}
                onChange={(e) => update({ highRisk: e.target.checked })}
                aria-label="Local alerts"
              />
            </SettingRow>

            <SettingRow label="Anonymous by default">
              <Switch
                checked={prefs.verifyRequests}
                onChange={(e) => update({ verifyRequests: e.target.checked })}
                aria-label="Anonymous by default"
              />
            </SettingRow>

            <SettingRow
              label="Language"
              hint="Translations are experimental in this demo"
            >
              <Select
                aria-label="Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="my">Myanmar (Burmese)</option>
                <option value="en">English</option>
              </Select>
            </SettingRow>

            <SettingRow label="Theme" hint="Choose light, dark, or follow system">
              <Select
                aria-label="Theme"
                value={prefs.theme}
                onChange={(e) =>
                  update({ theme: e.target.value as AlertPrefs["theme"] })
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </SettingRow>

            <SettingRow
              label="Partner rewards"
              hint="Coming soon — earn points for verified contributions"
            >
              <Switch checked={false} disabled aria-label="Partner rewards" />
            </SettingRow>
          </CardBody>
        </Card>

        <section className="flex flex-col gap-2 border-t border-border pt-6">
          <h2 className="font-display text-sm font-semibold text-foreground">
            About Team Compass
          </h2>
          <p className="text-xs text-muted-foreground">
            WaterWatch is built by Team Compass 🧭 for DEEP Hackathon 2026 — a
            community-first approach to water, sanitation and hygiene risk in
            Yangon.
          </p>
          <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
