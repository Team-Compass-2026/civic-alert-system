import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardBody, buttonVariants } from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TabBar } from "@/components/layout/TabBar";
import { DISCLAIMER } from "@/lib/waterwatch";

const TITLE = "FAQ — How WaterWatch works";
const DESC =
  "Answers about anonymous reporting, community verification, how neighborhood WASH risk scores are calculated, and what WaterWatch is not.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Is reporting anonymous?",
    a: "Yes. Reports are anonymous by default — no account, no phone number. A random device token is kept on your phone only so you can see your own reports and avoid double-verifying the same one.",
  },
  {
    q: "How is a neighborhood risk score calculated?",
    a: "Each area starts from a baseline. Verified reports raise the score by type — unsafe water and illness signals weigh most, then sewage and flooding, then infrastructure. Reports fade over time, so a score falls when problems stop being reported.",
  },
  {
    q: "What do LOW, MODERATE, HIGH and CRITICAL mean?",
    a: "LOW 0-33, MODERATE 34-66, HIGH 67-84, CRITICAL 85-100. Every risk is always shown as a colored badge with its label and numeric score, never as color alone.",
  },
  {
    q: "What happens after I confirm or dispute a report?",
    a: "Confirmations from nearby neighbors make a report count toward the area score; disputes hold it back. A single mistaken flag never drives an alert on its own.",
  },
  {
    q: "When do I get an alert?",
    a: "When your area crosses a risk threshold, when a report near you needs verification, or when neighbors confirm something on your street. Alerts always carry safe-water advice you can act on.",
  },
  {
    q: "Is this medical advice?",
    a: DISCLAIMER,
  },
  {
    q: "Who can use the organization dashboard?",
    a: "Municipal teams, NGOs and clinics use it to see aggregate indicators and ranked areas across Yangon — trends by report type, not individual identities.",
  },
];

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Frequently asked questions
          </h1>
          <p className="text-muted-foreground">
            How reporting, verification and risk scoring work in WaterWatch.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map((item) => (
            <Card key={item.q}>
              <CardBody className="flex flex-col gap-2 p-5">
                <h2 className="font-display text-base font-semibold text-foreground">
                  {item.q}
                </h2>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/report" className={buttonVariants({ size: "lg" })}>
            Report a Problem
          </Link>
          <Link
            to="/map"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            See the map
          </Link>
        </div>
      </main>

      <TabBar />
    </div>
  );
}
