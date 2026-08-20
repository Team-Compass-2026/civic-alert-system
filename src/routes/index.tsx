import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, buttonVariants, Card, CardBody } from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DISCLAIMER } from "@/lib/waterwatch";

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
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: "📝",
    title: "Neighbors report",
    body: "Anyone can flag unsafe water, sewage, flooding or broken pipes in under a minute — anonymously if they prefer.",
  },
  {
    icon: "✅",
    title: "The community verifies",
    body: "Nearby residents confirm or dispute each report, so a single mistaken flag never drives an alert.",
  },
  {
    icon: "📈",
    title: "Risk rises early",
    body: "Verified reports raise an area's WASH risk score. Crossing a threshold sends an alert with safe-water advice.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <div className="flex max-w-2xl flex-col gap-6">
            <Badge variant="brand" className="w-fit">
              Yangon · community early warning
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Spot water and sanitation problems before they spread
            </h1>
            <p className="text-lg text-muted-foreground">
              WaterWatch collects reports from residents, verifies them with the
              people who live nearby, and turns them into a clear risk signal for
              each neighborhood.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/report" className={buttonVariants({ size: "lg" })}>
                Report a Problem
              </Link>
              <Link
                to="/home"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                See Your Area
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            How it works
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card key={step.title}>
                <CardBody className="flex flex-col gap-3 p-6">
                  <span aria-hidden="true" className="text-2xl">
                    {step.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20">
          <Card>
            <CardBody className="flex flex-col gap-2 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                What WaterWatch is not
              </h2>
              <p className="text-sm text-muted-foreground">{DISCLAIMER}</p>
            </CardBody>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 text-sm text-muted-foreground">
          WaterWatch · community WASH early warning for Yangon
        </div>
      </footer>
    </div>
  );
}
