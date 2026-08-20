import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import type { AreaRisk } from "@/lib/waterwatch";

type Props = {
  areas: AreaRisk[];
  onAuth?: () => void;
};

/**
 * Email + password login / signup for citizens. The chosen area is stored on
 * the account metadata so the signup trigger can create a profile row.
 */
export function AuthCard({ areas, onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [areaId, setAreaId] = useState<string>(areas[0]?.area_id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { area_id: areaId },
        },
      });
      if (err) {
        setError(err.message);
      } else if (data.session) {
        onAuth?.();
      } else {
        setNotice("Check your inbox to confirm your email, then sign in.");
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
      } else {
        onAuth?.();
      }
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-base font-semibold text-foreground">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to get alerts for your neighborhood and to file reports under
          your name.
        </p>
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ww-password">Password</Label>
            <Input
              id="ww-password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

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
                : "Create account"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </Button>
      </CardBody>
    </Card>
  );
}

