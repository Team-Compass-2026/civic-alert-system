import { useEffect, useId, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@/design-system/design-idea-5cd787";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import { assessPassword, MIN_PASSWORD_LENGTH } from "@/lib/passwordStrength";
import { consumeRedirect } from "@/lib/redirect";
import { OG_IMAGE_URL } from "@/lib/waterwatch";

const TITLE = "Choose a new password — WaterWatch";
const DESC =
  "Set a new password for your WaterWatch account and get back to your neighborhood alerts.";

export const Route = createFileRoute("/reset-password")({
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
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const strengthId = useId();

  const strength = assessPassword(password);

  // Supabase delivers the recovery session through the URL fragment; the client
  // consumes it and fires PASSWORD_RECOVERY. A session that already exists
  // (link just opened) counts too.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setRecovery(true);
      setReady(true);
    });

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery")) setRecovery(true);

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecovery(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!strength.acceptable) {
      setError(
        `Please choose a stronger password — at least ${MIN_PASSWORD_LENGTH} characters, mixing letters with a number or symbol.`,
      );
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (err) {
      const message = friendlyAuthError(err, "We couldn't update your password. Please try again.");
      setError(message);
      toast.error("Password not updated", { description: message });
      return;
    }

    toast.success("Password updated", { description: "You're signed in with your new password." });
    navigate({ to: consumeRedirect() ?? "/profile", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-12">
        <Card>
          <CardHeader>
            <h1 className="font-display text-base font-semibold text-foreground">
              Choose a new password
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick something you don't use anywhere else. You'll stay signed in
              on this device.
            </p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 p-5">
            {!ready ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span className="text-sm text-muted-foreground">Checking your reset link…</span>
              </div>
            ) : !recovery ? (
              <Alert variant="danger" title="This reset link isn't valid">
                <div className="flex flex-col gap-3">
                  <p className="text-sm">
                    The link may have expired or already been used. Request a new
                    one from the sign-in page.
                  </p>
                  <Button size="sm" onClick={() => navigate({ to: "/auth" })}>
                    Back to sign in
                  </Button>
                </div>
              </Alert>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                {error ? <Alert variant="danger">{error}</Alert> : null}

                <PasswordField
                  id="ww-new-password"
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  describedBy={strengthId}
                >
                  <PasswordStrengthMeter id={strengthId} password={password} />
                </PasswordField>

                <PasswordField
                  id="ww-confirm-password"
                  label="Confirm new password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder="Type it again"
                />

                <Button type="submit" disabled={busy}>
                  {busy ? "Updating…" : "Update password"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
