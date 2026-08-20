# Progress Tracker — WaterWatch (Lovable Prototype)

## Current phase

- **Prototype scaffold v0.1.0 · dev** — Lovable prototype of WaterWatch built
  on TanStack Start + Supabase. Citizen app + org dashboard, Supabase backend,
  Vercel deployment all functional. UI polish and demo flow wiring in progress.

## Completed

- Lovable-built citizen app routes: home, map, report, alerts, profile
- Org dashboard routes: `/dashboard` index + `/dashboard/$slug` drill-down
- FAQ page
- Dark-mode toggle, sales-tax toggle (TanStack Start exploration)
- React Leaflet + OpenStreetMap map integration
- Supabase JS client configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- TanStack Query provider, Zod validation, Recharts charts, date-fns dates
- Replaced Lovable placeholder assets with WaterWatch brand logos, favicons, manifest, and alert icons
- Vercel deployment support added (VERCEL=1 gates Cloudflare plugin to non-Vercel builds); lovable-sync merged (89bc2be) and pushed
- Supabase env setup local + `.env.example` tracked (7 vars, SUPABASE_SERVICE_ROLE_KEY placeholder)
- Auth pages: `/auth` + `/sign-in` + `/sign-up` split (Supabase Auth with email/password)
- Supabase migrations complete: areas, reports, verifications, alerts, profiles tables + RLS incl. anon-insert on reports/verifications
- Views `v_area_risk` and `v_report_feed` live; seed with Hlaing Tharyar 82/100 HIGH
- Demo alerts seed + `report-photos` storage bucket (migration `20260821031500_setup_complete.sql`)
- Content parity with waterwatch main app (consistent terminology, signals-not-diagnoses)
- Deployed URL verified on Vercel (Nitro auto-detect)
- UI responsive polish + landing page refinement (in flight — just landed)

## Next up

- Wire report → map → verify → risk → alert/demo flow end-to-end with live Supabase data
- Org dashboard data from Supabase (currently scaffolded)
- Risk-score wiring: connect client to Supabase risk calculations
- Accessibility pass (FAQ/map accordions, keyboard nav, focus rings)
- Dark mode (prefers-color-scheme) surface token flip

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
- Deployment: Nitro/Vercel primary (VERCEL=1), Cloudflare Workers fallback
