import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Separator,
} from "@/design-system/design-idea-5cd787";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { OG_IMAGE_URL } from "@/lib/waterwatch";

const TITLE = "Reset link sent — WaterWatch";
const DESC =
  "We've emailed you a link to choose a new WaterWatch password. Here's what to do next if it doesn't arrive.";

/**
 * Confirmation shown after a password reset email is requested. It never
 * confirms whether the address has an account — that would leak membership.
 */
export const Route = createFileRoute("/reset-password/sent")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    const email = search["email"];
    return typeof email === "string" && email.length > 0 && email.length <= 254
      ? { email }
      : {};
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
      { name: "robots", content: "noindex" },
    ],
  }),

  component: ResetSentPage,
});

const STEPS = [
  "Open the email from WaterWatch and tap “Reset password”. The link works once and expires in an hour.",
  "Choose a new password — at least 8 characters, mixing letters with a number or symbol.",
  "You'll be signed in and sent back to the page you were on.",
];

function ResetSentPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <Card>
          <CardHeader>
            <h1 className="font-display text-base font-semibold text-foreground">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground">
              {email ? (
                <>
                  If <span className="font-mono text-foreground">{email}</span> has a
                  WaterWatch account, a reset link is on its way.
                </>
              ) : (
                "If that address has a WaterWatch account, a reset link is on its way."
              )}
            </p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 p-5">
            <ol className="flex flex-col gap-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-foreground">
                  <span className="font-mono text-sm text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <Separator />

            <Alert variant="info">
              No email after a few minutes? Check your spam folder, and make sure you
              typed the same address you signed up with.
            </Alert>

            <Button onClick={() => navigate({ to: "/sign-in" })}>
              Back to sign in
            </Button>
            <Button variant="secondary" onClick={() => navigate({ to: "/home" })}>
              Go to your area
            </Button>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
