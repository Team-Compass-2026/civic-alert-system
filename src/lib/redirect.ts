/**
 * Helpers for "send me back where I was" after signing in.
 *
 * Only same-origin paths are ever honoured: anything absolute, protocol
 * relative, or pointing at another host is discarded so the sign-in flow can
 * never be used as an open redirect.
 */

const STORAGE_KEY = "ww:redirect-after-signin";

/** Routes that would bounce the user straight back to sign-in. */
const BLOCKED = ["/auth", "/sign-in", "/sign-up", "/reset-password"];

/**
 * Returns a safe same-origin path (`/path?query#hash`) or null.
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (!value.startsWith("/")) return null;
  // "//host" and "/\host" are protocol-relative escapes.
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  if (value.length > 512) return null;

  const path = value.split("?")[0]!.split("#")[0]!;
  if (BLOCKED.some((blocked) => path === blocked || path.startsWith(`${blocked}/`))) {
    return null;
  }
  return value;
}

/** The current location as a redirect target, or null when it isn't worth one. */
export function currentRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  return safeRedirectPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

/** Remember where the user was heading before the session ran out. */
export function rememberRedirect(target: string | null = currentRedirectTarget()) {
  if (typeof window === "undefined") return;
  const safe = safeRedirectPath(target);
  try {
    if (safe) window.sessionStorage.setItem(STORAGE_KEY, safe);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private-mode storage failures are non-fatal; we just lose the memory.
  }
}

/** Read and clear the remembered destination. */
export function consumeRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return safeRedirectPath(stored);
  } catch {
    return null;
  }
}

/**
 * Resolve the post-sign-in destination: an explicit `?redirect=` wins, then the
 * remembered one, then the given fallback.
 */
export function resolveRedirect(search: unknown, fallback = "/profile"): string {
  const explicit = safeRedirectPath(search);
  return explicit ?? consumeRedirect() ?? fallback;
}
