import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/design-system/design-idea-5cd787";
import { cn } from "@/design-system/design-idea-5cd787/lib/utils";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";

import { DISCLAIMER, OG_IMAGE_URL } from "@/lib/waterwatch";


const TITLE = "FAQ — How WaterWatch works";
const DESC =
  "Answers about anonymous reporting, community verification, how neighborhood WASH risk scores work, and why WaterWatch does not diagnose cholera.";

export const Route = createFileRoute("/faq")({
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

  component: FaqPage,
});

const FAQS = [
  {
    q: "What is WaterWatch?",
    a: "WaterWatch is a community-powered platform that helps people report and monitor local water, sanitation, and flooding problems. By combining community reports, verification, and geographic data, WaterWatch identifies areas that may require attention.",
  },
  {
    q: "How does WaterWatch identify high-risk areas?",
    a: "WaterWatch analyzes patterns in community reports, including their location, frequency, timing, and type. Multiple reports from the same area can increase the area's WASH Risk Score, helping highlight emerging hotspots.",
  },
  {
    q: "Can WaterWatch detect or diagnose cholera?",
    a: "No. WaterWatch does not diagnose diseases or confirm cholera outbreaks. It identifies unusual community-level WASH signals that may indicate a potential risk and help communities and organizations decide where further investigation may be needed.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. You can submit reports anonymously. WaterWatch is designed to focus on community-level patterns rather than identifying individuals, and sensitive personal information should never be publicly displayed.",
  },
  {
    q: "Why should I report a problem?",
    a: "Your report helps build a clearer picture of what is happening in your neighborhood. In return, WaterWatch gives you access to local risk information, alerts, community verification, and practical guidance to help you stay informed and protect your community.",
  },
];

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">FAQ</h1>

        <div className="mt-6 flex flex-col">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-foreground transition-colors hover:text-brand-700">
                {item.q}
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Link
            to="/report"
            className={cn(buttonVariants({ size: "md" }), "self-start rounded-pill")}
          >
            Report a problem
          </Link>
          <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

