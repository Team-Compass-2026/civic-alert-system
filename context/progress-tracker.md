# Progress Tracker — WaterWatch (Lovable Prototype)

## Current phase

- **Prototype scaffold v0.1.0 · dev** — Lovable prototype of WaterWatch built
  on TanStack Start + Supabase. Citizen app + org dashboard routes in place.
  Environment setup and RLS hardening next.

## Completed

- Lovable-built citizen app routes: home, map, report, alerts, profile
- Org dashboard routes: `/dashboard` index + `/dashboard/$slug` drill-down
- FAQ page
- Dark-mode toggle, sales-tax toggle (TanStack Start exploration)
- React Leaflet + OpenStreetMap map integration
- Supabase JS client configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- TanStack Query provider, Zod validation, Recharts charts, date-fns dates

## Completed

- Replaced Lovable placeholder assets with WaterWatch brand logos, favicons, manifest, and alert icons

## Next up

- Environment setup: verify Supabase connection, run migrations
- RLS hardening: ensure anonymous inserts work, signed-in writes gated
- Risk-score wiring: connect client to Supabase risk calculations
- Report → map → verify → risk → alert/demo flow end-to-end
- Org dashboard data from Supabase

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
