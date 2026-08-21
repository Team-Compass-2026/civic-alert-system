import { useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  Select,
} from "@/design-system/design-idea-5cd787";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import { assessPassword, MIN_PASSWORD_LENGTH } from "@/lib/passwordStrength";
import type { AreaRisk } from "@/lib/waterwatch";

type Mode = "login" | "signup" | "forgot";

type Props = {
  areas: AreaRisk[];
  onAuth?: () => void;
  /** Start the card in sign-in or sign-up mode. Defaults to "login". */
  initialMode?: "login" | "signup";
};

const COPY: Record<Mode, { title: string; blurb: string }> = {
  login: {
    title: "Sign in",
    blurb:
      "Sign in to get alerts for your neighborhood and to file reports under your name.",
  },
  signup: {
    title: "Create your account",
    blurb:
      "Pick your area and we'll localize alerts, reports and risk scores to it.",
  },
  forgot: {
    title: "Reset your password",
    blurb:
      "Enter the email on your account and we'll send you a link to choose a new password.",
  },
};

/**
 * Email + password login / signup / password-reset for citizens. The chosen
 * area is stored on the account metadata so the signup trigger can create a
 * profile row.
 */
export function AuthCard({ areas, onAuth, initialMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [areaId, setAreaId] = useState<string>(areas[0]?.area_id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const strengthId = useId();
  const navigate = useNavigate();

  const strength = assessPassword(password);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup" && !strength.acceptable) {
      const message = `Please choose a stronger password — at least ${MIN_PASSWORD_LENGTH} characters, mixing letters with a number or symbol.`;
      setError(message);
      toast.error("Password too weak", { description: message });
      return;
    }

    setBusy(true);

    if (mode === "forgot") {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        const message = friendlyAuthError(err, "We couldn't send the reset email. Please try again.");
        setError(message);
        toast.error("Reset email failed", { description: message });
      } else {
        toast.success("Reset link sent", {
          description: "Check your inbox for the link to choose a new password.",
        });
        setBusy(false);
        navigate({ to: "/reset-password/sent", search: { email: email.trim() } });
        return;
      }
    } else if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { area_id: areaId },
        },
      });
      if (err) {
        const message = friendlyAuthError(err, "We couldn't create your account. Please try again.");
        setError(message);
        toast.error("Sign-up failed", { description: message });
      } else if (data.session) {
        toast.success("Account created", {
          description: "You're signed in — alerts are now localized to your area.",
        });
        onAuth?.();
      } else {
        setNotice("Check your inbox to confirm your email, then sign in.");
        toast.info("Almost there", {
          description: "Confirm your email with the link we just sent, then sign in.",
        });
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        const message = friendlyAuthError(err, "We couldn't sign you in. Please try again.");
        setError(message);
        toast.error("Sign-in failed", { description: message });
      } else {
        toast.success("Signed in");
        onAuth?.();
      }
    }

    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-base font-semibold text-foreground">
          {COPY[mode].title}
        </h2>
        <p className="text-sm text-muted-foreground">{COPY[mode].blurb}</p>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 p-5">
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {notice ? <Alert variant="info">{notice}</Alert> : null}

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ww-email">Email</Label>
            <Input
              id="ww-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {mode !== "forgot" ? (
            <PasswordField
              id="ww-password"
              label="Password"
              value={password}
              onChange={setPassword}
              required
              minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : 6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={
                mode === "signup"
                  ? `At least ${MIN_PASSWORD_LENGTH} characters`
                  : "Your password"
              }
              describedBy={mode === "signup" ? strengthId : undefined}
              labelAction={
                mode === "login" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => switchMode("forgot")}
                  >
                    Forgot password?
                  </Button>
                ) : null
              }
            >
              {mode === "signup" ? (
                <PasswordStrengthMeter id={strengthId} password={password} />
              ) : null}
            </PasswordField>
          ) : null}

          {mode === "signup" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ww-area">Your area</Label>
              <Select
                id="ww-area"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
              >
                {areas.map((a) => (
                  <option key={a.area_id} value={a.area_id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground">
                We use this to localize your alerts and reports.
              </p>
            </div>
          ) : null}

          <Button type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </Button>
        </form>

        {mode === "forgot" ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => switchMode("login")}>
            Back to sign in
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
