import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  buttonVariants,
  Card,
  CardBody,
} from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { NeighborhoodMap } from "@/components/map/NeighborhoodMap";
import { RiskBadge } from "@/components/civic/RiskBadge";
import { areasQuery } from "@/lib/queries";
import { OG_IMAGE_URL } from "@/lib/waterwatch";



const TITLE = "WaterWatch — Community water & sanitation early warning";
const DESC =
  "Neighbors in Yangon report water, sewage and flooding problems. WaterWatch turns those reports into an early-warning risk signal for every area.";

export const Route = createFileRoute("/")({
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

  component: Landing,
});

const STEPS = [
  {
    step: "01",
    title: "Observe",
    body: "Dirty water, sewage, flooding or broken infrastructure in your street.",
  },
  {
    step: "02",
    title: "Report",
    body: "What, where, when — add a photo. Under a minute, anonymously if you prefer.",
  },
  {
    step: "03",
    title: "Verify",
    body: "Nearby residents confirm or dispute, so one mistaken flag never drives an alert.",
  },
  {
    step: "04",
    title: "Alert",
    body: "Localized warnings and a neighborhood risk score with safe-water advice.",
  },
];

const BENEFITS = [
  {
    title: "Know Your Neighborhood",
    body: "See the current WASH risk where you live — and exactly why it changed this week.",
  },
  {
    title: "Warn Your Neighbors",
    body: "Your report helps the people living nearby stay safe before a problem spreads.",
  },
  {
    title: "Guide the Response",
    body: "Organizations use the signal to prioritize where to investigate first.",
  },
  {
    title: "Stay Informed",
    body: "Get practical guidance and localized alerts to protect your community.",
  },
];

function Landing() {
  const areas = useQuery(areasQuery);
  const list = areas.data ?? [];
  const focus = list.find((a) => a.slug === "hlaing-tharyar") ?? list[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="bg-gradient-to-b from-brand-50 to-transparent">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-16 sm:py-20 md:grid-cols-2 md:py-24">
            <div className="motion-safe:animate-fade-in-up flex flex-col gap-6">
              <Badge variant="brand" className="w-fit">
                Yangon · community early warning
              </Badge>
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Your information is life-saving.
                <br />
                <span className="text-brand-600">Protect the community.</span>
              </h1>

              <p className="text-lg text-muted-foreground">
                WaterWatch turns local observations about water and sanitation
                into early warnings for your neighborhood.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/report"
                  className={buttonVariants({ size: "lg" })}
                >
                  Report a Problem
                </Link>
                <Link
                  to="/map"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  Current Data
                </Link>
              </div>
              {focus ? (
                <p className="text-sm text-muted-foreground">
                  Your area · {focus.name} —{" "}
                  <span className="font-mono">
                    {focus.level} {focus.score}/100
                  </span>{" "}
                  ·{" "}
                  <span className="font-mono">{focus.reports_this_week}</span>{" "}
                  reports this week
                </p>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-lg motion-safe:animate-fade-in" style={{ animationDelay: "200ms" }}>
            <Card className="overflow-hidden">
              <CardBody className="relative overflow-hidden p-0">
                <NeighborhoodMap areas={list} className="isolate h-64 w-full sm:h-80 md:h-96" />

                {focus ? (
                  <Card className="absolute bottom-4 left-4 right-4 z-10 sm:bottom-6 sm:left-6 sm:right-6 md:right-auto md:max-w-xs">
                    <CardBody className="flex flex-col">
                      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                        Your area · {focus.name}
                      </span>
                      <RiskBadge
                        level={focus.level}
                        score={focus.score}
                        size="sm"
                        className="w-fit"
                      />
                      <span className="text-xs text-muted-foreground">
                        <span className="font-mono">
                          {focus.reports_this_week}
                        </span>{" "}
                        reports this week
                      </span>
                    </CardBody>
                  </Card>
                ) : null}
              </CardBody>
            </Card>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="motion-safe:animate-fade-in-up">
            <h2 className="font-display text-3xl font-extrabold text-foreground">
              How things work
            </h2>
          </div>
          <div className="mt-8 grid gap-6 motion-safe:animate-stagger sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map((step) => (
              <Card key={step.step} className="motion-safe:animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardBody className="flex flex-col gap-3 pt-5">
                  <span className="font-mono text-sm text-brand-600">
                    {step.step}
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <div className="grid gap-6 motion-safe:animate-stagger sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="motion-safe:animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardBody className="flex flex-col gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{b.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-16 pb-20 sm:pt-20 md:pt-24">
          <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardBody className="flex flex-col items-center gap-6 text-center">
              <h2 className="font-display text-3xl font-extrabold text-foreground">
                Learn what is happening near you?
              </h2>
              <Link to="/home" className={buttonVariants({ size: "lg" })}>
                Check Your Neighborhood →
              </Link>
            </CardBody>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}

