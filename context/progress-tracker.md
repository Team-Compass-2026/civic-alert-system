# Progress Tracker — WaterWatch (Lovable Prototype)

## Current phase

- **Prototype scaffold v0.1.0 · dev** — Lovable prototype of WaterWatch built
  on TanStack Start + Supabase. Full citizen app + org dashboard, Supabase
  backend with seeded data, Cloudflare Workers deployment.

## Completed

### Core infrastructure
- TanStack Start file routing (`src/routes/`) — 17 route files
- Supabase JS client (browser + server + auth middleware)
- TanStack Query provider wired globally
- Zod validation on server function inputs
- Vite 8 + Tailwind v4 + design system component library

### Database (Supabase)
- Tables: areas (12 seeded), reports (~134 seeded), verifications (~200+ seeded), alerts (~18 seeded), profiles, user_roles
- Enums: report_type, risk_level, verification_value, app_role
- Views: v_area_risk, v_report_feed, v_alert_feed, v_signal_trends
- RLS policies on all tables (anon read, anon insert for reports/verifications)
- Triggers: auto-create profile + citizen role on signup
- Storage: report-photos bucket (public read, anon insert)
- 11 migration files in `supabase/migrations/`

### Citizen app routes
- `/home` — area risk score + component breakdown + recent reports + nearby areas
- `/map` — Leaflet map with area circles, report markers, alert markers
- `/report` — report form (type, location, details, photo, anonymous)
- `/alerts` — localized alerts + verify/dispute reports
- `/profile` — user profile, area selection, sign out
- `/auth`, `/sign-in`, `/sign-up` — Supabase Auth (email/password)
- `/reset-password`, `/reset-password/sent` — password reset flow
- `/faq` — frequently asked questions

### Org dashboard routes
- `/dashboard` — indicators, top areas, recent reports (scoped by role)
- `/dashboard/$slug` — per-area drill-down (risk components, alerts, reports)

### Server functions (with requireSupabaseAuth middleware)
- `getMyAccess` — role + area access check
- `getAreaDashboard` — area drill-down (access + area + reports + alerts)
- `getScopedAreas` — filtered area list by role
- `getMyProfile` — profile fetch with auto-create fallback
- `updateMyProfileArea` — update home area

### Components
- Layout: SiteHeader, Footer
- Auth: AuthCard, PasswordField, PasswordStrengthMeter, RequireAccess
- Civic: AlertCard, AlertDetailsDrawer, AlertList, ReportCard, ReportTypeIcon, RiskBadge, SeverityBar, StatTile, StatusPill
- Map: NeighborhoodMap (SSR-safe lazy wrapper), NeighborhoodMapClient (Leaflet)
- Design system: 15+ UI components (button, card, input, select, badge, spinner, tooltip, etc.)

### Realtime
- Supabase Realtime channel on reports + alerts tables
- Auto-invalidate TanStack Query caches on changes

### Branding
- WaterWatch logos, favicons, manifest, OG image
- Deep Navy + Water Blue palette with risk color system

## Next up

- Wire report → map → verify → risk → alert/demo flow end-to-end with live Supabase data
- Org dashboard data from Supabase (currently scaffolded, server functions wired)
- Risk-score wiring: connect client to Supabase risk calculations
- Accessibility pass (FAQ/map accordions, keyboard nav, focus rings)
- Dark mode (prefers-color-scheme) surface token flip
- Parallelize reports + alerts fetch in `getAreaDashboard`
- Cache `loadAccess()` to avoid double query per dashboard visit
- Add `area_id` index on alerts table

## Open questions

- Which Supabase project for the pilot?
- Anonymous vs signed-in split for demo
- Risk-score weighting tuning (volume vs cluster vs verification vs signal mix)

## Architecture decisions

- **This repo = Lovable prototype** of WaterWatch (TanStack Start + Supabase)
- Main app = `waterwatch/` repo (Next.js + Neon + Prisma + Better Auth)
- Supabase RLS gates all write operations
- Anonymous reporting always possible
- Reports are signals, not diagnoses
- Leaflet + OSM (free, no API key)
- Deployment: Cloudflare Workers (wrangler.jsonc)
