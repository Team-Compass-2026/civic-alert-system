import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/AuthCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { areasQuery } from "@/lib/queries";
import { OG_IMAGE_URL } from "@/lib/waterwatch";
import { resolveRedirect, safeRedirectPath } from "@/lib/redirect";

const TITLE = "Create account — WaterWatch";
const DESC =
  "Create a WaterWatch account to get localized alerts for your Yangon neighborhood and file reports.";

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const target = safeRedirectPath(search["redirect"]);
    return target ? { redirect: target } : {};
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

  component: SignUpPage,
});

function SignUpPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const areas = useQuery(areasQuery);
  const search = Route.useSearch();
  const destination = () => resolveRedirect(search.redirect);

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate({ to: destination(), replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.loading, auth.user, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <AuthCard
          areas={areas.data ?? []}
          initialMode="signup"
          onAuth={() => navigate({ to: destination(), replace: true })}
        />
      </main>

      <Footer />
    </div>
  );
}
