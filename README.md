# WaterWatch — Lovable Prototype

The **Lovable prototype** of WaterWatch: a community-powered WASH early-warning
platform. Same product as the main app, built with TanStack Start + Supabase.

## What's in here

- **Citizen app:** Home · Map · Report · Alerts · Profile
- **Auth:** `/auth` · `/sign-in` · `/sign-up` (Supabase Auth, email/password)
- **Org dashboard:** `/dashboard` (overall risk, indicators, hotspots) + `/dashboard/$slug` (per-area drill-down)
- **FAQ:** `/faq`

## Stack

- TanStack Start + TanStack Router (file routing under `src/routes/`)
- React 19 + TypeScript (strict)
- Vite 8 + Tailwind CSS v4
- TanStack Query + Zod 3
- Recharts + date-fns
- Leaflet / react-leaflet + OpenStreetMap (free, no API key)
- Supabase JS (Auth + Postgres + RLS + Storage)
- Nitro/Vercel deployment (VERCEL=1 auto-detect) + Cloudflare Workers fallback (wrangler.jsonc)

## Develop

```sh
bun install
bun run dev
```

## Environment

Create a local `.env` with your Supabase credentials (copy from `.env.example`):

```
SUPABASE_PROJECT_ID=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`.env` is **never committed** — only `.env.example` is tracked.

## Deployment

- **Vercel (primary):** The Nitro adapter (`nitro/vite`) auto-detects `VERCEL=1`
  (set automatically by Vercel) and emits `.vercel/output/` (Build Output API),
  which Vercel serves with zero settings changes. Keep the Framework Preset
  as **TanStack Start**, build command `vite build`, output `dist`. Set these
  environment variables in Vercel Project → Settings → Environment Variables:
  `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Cloudflare Workers (fallback):** `bunx wrangler deploy` — the Cloudflare Vite
  plugin produces a worker bundle in `dist/server/index.js` with `wrangler.jsonc`.
  Active when `VERCEL` is not set.

## Context

Self-documents in its `context/` directory (six-file methodology + project.yaml).
Org-level product spec: `Team-Compass-2026/.github` → `context/product-spec.md`.
