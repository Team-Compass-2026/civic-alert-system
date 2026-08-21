/**
 * Maps raw Supabase/auth errors onto short, friendly, actionable messages.
 * Never surface a raw Postgres/GoTrue string to a resident.
 */
export function friendlyAuthError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  const msg = raw.toLowerCase();

  if (!msg) return fallback;
  if (msg.includes("invalid login credentials"))
    return "That email and password don't match. Check them and try again.";
  if (msg.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the link.";
  if (msg.includes("user already registered") || msg.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (msg.includes("password should be at least") || msg.includes("weak password"))
    return "Please choose a longer password — at least 6 characters.";
  if (msg.includes("invalid email") || msg.includes("unable to validate email"))
    return "That email address doesn't look right.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("refresh token") || msg.includes("session") || msg.includes("jwt"))
    return "Your session expired. Please sign in again.";
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return "We can't reach WaterWatch right now. Check your connection and try again.";
  if (msg.includes("forbidden") || msg.includes("not authorized") || msg.includes("permission"))
    return "You don't have access to this area of WaterWatch.";
  return fallback;
}
