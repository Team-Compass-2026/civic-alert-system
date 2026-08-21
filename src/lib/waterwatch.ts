/**
 * WaterWatch shared domain types and helpers.
 * SSR-safe: no browser globals, no Leaflet imports.
 */

export const SITE_ORIGIN =
  "https://id-preview--6dc9d0c2-6f9b-489b-b962-7bb1dc27484b.lovable.app";
export const OG_IMAGE_URL =
  `${SITE_ORIGIN}/og.png`;

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";


export type ReportType =
  | "unsafe_water"
  | "sewage"
  | "flooding"
  | "broken_infrastructure"
  | "sanitation"
  | "illness_cluster"
  | "other";

export type RiskComponent = { label: string; score: number; detail: string };

export type AreaRisk = {
  area_id: string;
  slug: string;
  name: string;
  township: string;
  lat: number;
  lng: number;
  radius_m: number;
  score: number;
  level: RiskLevel;
  trend_pct: number;
  components: Record<string, RiskComponent>;
  reports_this_week: number;
};

export type ReportFeedItem = {
  id: string;
  type: ReportType;
  description: string | null;
  when_happened: string | null;
  lat: number;
  lng: number;
  photo_url: string | null;
  is_anonymous: boolean;
  created_at: string;
  status: string;
  area_id: string | null;
  area_name: string | null;
  confirms: number;
  disputes: number;
};

export type AlertItem = {
  id: string;
  level: RiskLevel;
  kind: string;
  title: string;
  body: string;
  advice: string | null;
  area_id: string | null;
  status: string;
  created_at: string;
  lat: number | null;
  lng: number | null;
  area_slug: string | null;
  area_name: string | null;
  township: string | null;
};

/** Week-over-week signal counts per report type, from v_signal_trends. */
export type SignalTrend = {
  type: ReportType;
  current_count: number;
  previous_count: number;
  trend_pct: number | null;
};

export const ALERT_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  monitoring: "Monitoring",
  resolved: "Resolved",
  draft: "Draft",
};


export const REPORT_TYPES: Record<
  ReportType,
  { icon: string; label: string; help: string }
> = {
  unsafe_water: {
    icon: "💧",
    label: "Unsafe water",
    help: "Discolored, smelly or bad-tasting water",
  },
  sewage: { icon: "🧯", label: "Sewage", help: "Overflow, leaks or bad smell" },
  flooding: { icon: "🌊", label: "Flooding", help: "Standing or rising water" },
  broken_infrastructure: {
    icon: "🔧",
    label: "Broken infrastructure",
    help: "Burst pipes, broken pumps or drains",
  },
  sanitation: {
    icon: "🚻",
    label: "Sanitation problem",
    help: "Toilets, waste or drainage",
  },
  illness_cluster: {
    icon: "🤒",
    label: "Illness cluster",
    help: "Several people sick nearby",
  },
  other: { icon: "⚪", label: "Other", help: "Something else worth flagging" },
};

export const REPORT_TYPE_ORDER: ReportType[] = [
  "unsafe_water",
  "sewage",
  "flooding",
  "broken_infrastructure",
  "sanitation",
  "illness_cluster",
  "other",
];

export const RISK_LEVELS: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 67) return "HIGH";
  if (score >= 34) return "MODERATE";
  return "LOW";
}

/** Token-backed classes per risk level. Color is never the only signal. */
export const RISK_STYLES: Record<
  RiskLevel,
  { text: string; bg: string; tint: string; border: string; dot: string }
> = {
  LOW: {
    text: "text-risk-low",
    bg: "bg-risk-low",
    tint: "bg-risk-low-tint",
    border: "border-risk-low",
    dot: "bg-risk-low",
  },
  MODERATE: {
    text: "text-risk-moderate",
    bg: "bg-risk-moderate",
    tint: "bg-risk-moderate-tint",
    border: "border-risk-moderate",
    dot: "bg-risk-moderate",
  },
  HIGH: {
    text: "text-risk-high",
    bg: "bg-risk-high",
    tint: "bg-risk-high-tint",
    border: "border-risk-high",
    dot: "bg-risk-high",
  },
  CRITICAL: {
    text: "text-risk-critical",
    bg: "bg-risk-critical",
    tint: "bg-risk-critical-tint",
    border: "border-risk-critical",
    dot: "bg-risk-critical",
  },
};

/** CSS custom property holding the level color — for Leaflet path options. */
export const RISK_CSS_VAR: Record<RiskLevel, string> = {
  LOW: "--risk-low",
  MODERATE: "--risk-moderate",
  HIGH: "--risk-high",
  CRITICAL: "--risk-critical",
};

export function riskColor(level: RiskLevel): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(RISK_CSS_VAR[level])
    .trim();
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function trendLabel(pct: number): string {
  if (pct > 0) return `↑${pct}%`;
  if (pct < 0) return `↓${Math.abs(pct)}%`;
  return "→0%";
}

export const YANGON_CENTER: [number, number] = [16.84, 96.16];
export const YANGON_ZOOM = 12;

export const DISCLAIMER =
  "WaterWatch identifies unusual community-level signals that may warrant attention. It does not diagnose disease.";

/** CSS custom property per report type — category color, never a risk signal. */
export const REPORT_TYPE_CSS_VAR: Record<ReportType, string> = {
  unsafe_water: "--brand-600",
  sewage: "--brand-950",
  flooding: "--brand-800",
  broken_infrastructure: "--muted-foreground",
  sanitation: "--brand-400",
  illness_cluster: "--risk-high",
  other: "--brand-300",
};

export type TrendDirection = "up" | "down" | "flat";

export function trendDirection(pct: number): TrendDirection {
  if (pct > 0) return "up";
  if (pct < 0) return "down";
  return "flat";
}

export const TREND_ARROW: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export const TREND_TEXT: Record<TrendDirection, string> = {
  up: "text-risk-high",
  down: "text-risk-low",
  flat: "text-muted-foreground",
};

/** Great-circle distance in km between two [lat, lng] points. */
export function distanceKm(
  a: [number, number],
  b: [number, number],
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Format a coordinate pair for display (mono, 4 decimals). */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/** Baseline safety actions per risk level, shown when an alert has no advice. */
export const RECOMMENDED_ACTIONS: Record<RiskLevel, string[]> = {
  LOW: [
    "Keep using your normal water source, but check colour and smell before drinking.",
    "Report anything unusual so neighbors get an early warning.",
  ],
  MODERATE: [
    "Boil drinking water for at least one minute, or use treated bottled water.",
    "Store water in covered containers and wash hands with soap after contact.",
    "Confirm or dispute nearby reports so the signal stays accurate.",
  ],
  HIGH: [
    "Do not drink untreated tap water — boil vigorously or use chlorine tablets.",
    "Avoid wading through standing or flood water; wash and dry skin if you do.",
    "Watch for diarrhoea or vomiting at home and seek care early for children.",
    "Share this alert with neighbors who are not on WaterWatch.",
  ],
  CRITICAL: [
    "Treat all tap water as unsafe: boil, chlorinate, or use sealed bottled water only.",
    "Keep children away from flooded or sewage-affected areas.",
    "Seek medical care immediately for severe diarrhoea, dehydration or fever.",
    "Follow township authority instructions and check back for updates.",
  ],
};
