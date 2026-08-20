# Architecture Context — WaterWatch (Lovable Prototype)

> Ground truth: `project-overview.md` and org master spec
> (`Team-Compass-2026/.github` → `context/product-spec.md`).
> **MVP = deterministic, explainable risk scoring over community reports +
> verification. No medical diagnosis, no epidemiological inference engine.**

## Stack (as built)

| Layer | Technology | Status |
| ----- | ---------- | ------ |
| Framework | **TanStack Start** (file routing, `src/routes/`) | built |
| Language | TypeScript 5, strict | built |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) | built |
| Data fetching | TanStack Query | built |
| Validation | Zod 3 | built |
| Charts | Recharts | built |
| Dates | date-fns | built |
| Maps | **React Leaflet + Leaflet + OpenStreetMap** (free, no API key) | built |
| Backend | **Supabase** (Postgres + Auth + RLS + Storage) | built |
| Deployment | Cloudflare (Vite plugin + wrangler) | configured |

## Route map

| Route | Purpose |
|-------|---------|
| `/` | Landing / index |
| `/home` | Your area — risk score + why + recommendations |
| `/map` | Neighborhood map + report markers |
| `/report` | Report form (type, location, details, photo, anonymous) |
| `/alerts` | Localized alerts + verification requests |
| `/profile` | Reputation, my reports, settings |
| `/dashboard` | Org dashboard — overall risk, indicators, hotspots |
| `/dashboard/$slug` | Org drill-down — per-area risk + reports |
| `/faq` | Frequently asked questions |

## Data model (Supabase)

Core tables via Supabase migrations:

- **reports** — type, description, lat/lng, photo_url, user_id (nullable for anonymous), created_at
- **verifications** — report_id, voter_id, vote (confirm/dispute), created_at
- **areas** — name, slug, geometry/polygon, baseline metrics
- **alerts** — area_id, risk_score, level, message, created_at

RLS policies: reports readable (aggregated) publicly; PII scoped to owner;
org data scoped to subscription. Anonymous inserts allowed via RLS.

## Risk semantics

4-level risk scale (score 0–100):

| Level | Range | Color | Badge |
|-------|-------|-------|-------|
| LOW | 0–33 | `#16a34a` (green) | LOW |
| MODERATE | 34–66 | `#d97706` (amber) | MODERATE |
| HIGH | 67–84 | `#dc2626` (red) | HIGH |
| CRITICAL | 85–100 | `#b91c1c` (deep red) | CRITICAL |

Risk is always **color + badge label + score** — never color alone.

## Invariants

1. Reports are **signals, not diagnoses** — never claim an outbreak/diagnosis
2. Risk scores are transparent and explainable (component breakdown)
3. Anonymous reporting must always be possible
4. PII minimized; identity/contact data never exposed to organizations
5. Verification + clustering gate outlier reports
6. **No secrets in git** — `.env` is never committed
7. Risk color is never used alone — always badge label + score
8. Supabase RLS gates all write operations
