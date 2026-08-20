/**
 * Device-local identity for anonymous reporting / verification.
 * Every function here touches localStorage — call only from effects or
 * event handlers, never during render or SSR.
 */

const TOKEN_KEY = "ww_verify_token";
const MY_REPORTS_KEY = "ww_my_reports";
const PREFS_KEY = "ww_prefs";

export type AlertPrefs = {
  areaSlug: string;
  highRisk: boolean;
  verifyRequests: boolean;
  neighborhoodUpdates: boolean;
  theme: "system" | "light" | "dark";
};

export const DEFAULT_PREFS: AlertPrefs = {
  areaSlug: "hlaing-tharyar",
  highRisk: true,
  verifyRequests: true,
  neighborhoodUpdates: false,
  theme: "system",
};


export function getAnonToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getMyReportIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MY_REPORTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function rememberMyReport(id: string): void {
  if (typeof window === "undefined") return;
  const ids = [id, ...getMyReportIds().filter((x) => x !== id)].slice(0, 50);
  localStorage.setItem(MY_REPORTS_KEY, JSON.stringify(ids));
}

export function getPrefs(): AlertPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: AlertPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
