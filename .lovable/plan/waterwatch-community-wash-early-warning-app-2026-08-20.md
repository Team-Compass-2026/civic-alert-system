# WaterWatch — Community WASH Early-Warning App

Build the full WaterWatch app in this project on top of the attached Civic
Early-Warning design system, backed by a real Supabase database with Yangon
seed data and an interactive Leaflet map.

## What exists today

- Blank TanStack Start app: only a placeholder `/` route, plain `src/styles.css`
  (no Tailwind entry yet), Tailwind v4 + `@tailwindcss/vite` already installed.
- Civic design system attached at `src/design-system/design-idea-5cd787/` with
  primitives only: Button, IconButton, Input, Textarea, Label, Select, Checkbox,
  Switch, Badge, Card (+Header/Body/Footer), Avatar, Alert, Tooltip, Separator,
  Spinner. No civic components (RiskBadge, AlertCard, etc.) are in the attached
  copy — those get built here as app components composed from the primitives.
- Supabase is connected; `src/integrations/supabase` exists. No WaterWatch
  tables yet.

## Foundation

- Wire `src/styles.css` to `@import "tailwindcss"` then the design system's
  `styles/tokens.css`, so brand/risk/radius/shadow tokens and font tokens apply.
- Load Space Grotesk, DM Sans, Geist Mono via `<link>` in `__root.tsx` head;
  body defaults to `font-sans`.
- Install `leaflet`, `react-leaflet`, `@types/leaflet`.
- Design system rules hold everywhere: tokens only (no hex/px literals), risk is
  always badge + label + score, brand blue never signals risk.

## Database (Supabase migration)

Tables in `public`, each with GRANTs, RLS enabled, and literal seed INSERTs in
the same migration:

- `areas` — slug, name, township, lat, lng, radius_m (5 Yangon areas).
- `reports` — type enum (unsafe_water, sewage, flooding, broken_infrastructure,
  sanitation, illness_cluster, other), description, when_happened, lat/lng,
  area_id, photo_url, is_anonymous, status, created_at (10 seed reports).
- `verifications` — report_id, value (confirm/dispute), anon_token, unique per
  report+token.
- `alerts` — level, title, body, area_id, kind, created_at (3 seed alerts).
- `area_risk` view — score, level (LOW/MODERATE/HIGH/CRITICAL), trend_pct,
  components, reports_this_week, derived from reports + a stored baseline.
- `report_feed` view — report joined with area name and confirm/dispute counts.

Policies: public (`anon`) SELECT on areas, views, alerts; public INSERT on
reports and verifications (anonymous reporting, as in the hackathon spec); no
public UPDATE/DELETE. Realtime enabled on `reports` and `alerts`.

Storage bucket `report-photos` (public read, anon insert) for report photos.

Reads happen through the browser Supabase client with TanStack Query; the report
submit and verify writes go through server functions that validate input with
Zod before inserting.

## Civic components (`src/components/civic/`)

Composed from design-system primitives, tokens only:
`RiskBadge`, `SeverityBar`, `StatusPill`, `AlertCard`, `ReportCard`,
`AlertList`, `StatTile`, plus `ReportTypeIcon` (icon + label always paired).

## Map

`NeighborhoodMap` as a browser-only component: `React.lazy` behind
`<ClientOnly>` with a skeleton fallback, OSM tiles, `Circle`/`CircleMarker`
overlays colored by risk level, no default marker icons. Shared area/report
types live in a separate SSR-safe data module. A `LocationPicker` variant
(tap to drop a point) is used by the report form.

## Routes

| Route | Page |
|---|---|
| `/` | Landing: sticky nav, hero with tagline + dual CTA + area mini-line, hero mini-map with 5 risk overlays and caption card, 4-step How It Works, 3 benefits, final CTA, footer with disclaimer |
| `/home` | Your Area: current risk header, "See Why" component breakdown, recent nearby reports, quick actions |
| `/report` | Report a Problem: type picker (icon + label), description, when, location picker, optional photo upload, anonymous toggle, submit |
| `/report/submitted` | Confirmation with what happens next |
| `/map` | Full-screen neighborhood map: area overlays, report markers, filters, detail sheet with Confirm/Dispute |
| `/alerts` | Alert feed with AlertList, level filters, verify actions |
| `/profile` | My reports, verification count, alert preferences |
| `/dashboard` | Organization dashboard: StatTiles, overall risk, area ranking table, trend chart, report table |

Citizen tab bar (Home · Map · Report · Alerts · Profile) on app routes; landing
and dashboard use the marketing/org nav. Each route gets its own `head()` with
unique title, description, og:title, og:description.

## Build order

1. Foundation: styles, fonts, Leaflet install, shared types/data module.
2. Migration + seed; generated types available for reads.
3. Civic components.
4. Map components.
5. Landing (`/`) — replaces the placeholder.
6. Citizen app: home, report + submitted, map, alerts, profile.
7. Organization dashboard.
8. Verify build, check preview renders each route, confirm risk is never color
   alone.

## Technical notes

- Reports/alerts read live from Supabase via TanStack Query; realtime channels
  subscribe inside `useEffect` with `removeChannel` cleanup.
- Anonymous verification uses a `localStorage` token read inside effects/handlers
  only (never during render or SSR).
- Risk scoring is computed in SQL from report volume, recency, type weight, and
  confirmations so the seed data yields the spec's scores (Hlaing Tharyar 82,
  Thaketa 61, South Dagon 54, North Dagon 31, Insein 22).
- No auth: anonymous reporting only, per the hackathon spec. Profile is
  device-local. This is a demo posture — hardening (rate limits, moderation,
  org-gated dashboard) is out of scope unless you ask for it.
