import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";

/**
 * Client-side Supabase auth state for the citizen account.
 *
 * Also reloads the session whenever the tab regains focus, so a long-idle tab
 * never keeps rendering with a token that has already expired. When the reload
 * fails, `expired` flips to true and callers show a sign-in prompt.
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setExpired(true);
      toast.error("Session problem", {
        description: friendlyAuthError(error, "We couldn't refresh your session. Please sign in again."),
      });
      return;
    }

    const current = data.session;
    if (!current) {
      setSession(null);
      return;
    }

    const expiresAt = (current.expires_at ?? 0) * 1000;
    if (expiresAt && expiresAt - Date.now() < 60_000) {
      const { data: renewed, error: renewError } = await supabase.auth.refreshSession();
      if (renewError || !renewed.session) {
        setSession(null);
        setExpired(true);
        toast.error("Your session expired", {
          description: "Please sign in again to keep getting alerts for your area.",
        });
        return;
      }
      setSession(renewed.session);
      setExpired(false);
      return;
    }

    setSession(current);
    setExpired(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") setExpired(false);
      if (event === "SIGNED_OUT") setExpired(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState === "visible") void refresh();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  const user: User | null = session?.user ?? null;

  return {
    session,
    user,
    loading,
    /** True when the previous session ran out and the user must sign in again. */
    expired: expired && !session,
    refresh,
    signOut: () => supabase.auth.signOut(),
  };
}
