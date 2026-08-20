# WaterWatch — Lovable Prototype

The **Lovable prototype** of WaterWatch: a community-powered WASH early-warning
platform. Same product as the main app, built with TanStack Start + Supabase.

## What's in here

- **Citizen app:** Home · Map · Report · Alerts · Profile
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
- Cloudflare deployment (Vite plugin + wrangler)

## Develop

```sh
bun install
bun run dev
```

## Environment

Create a local `.env` with your Supabase credentials:

```
SUPABASE_PROJECT_ID=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`.env` is **never committed** — only `.env.example` is tracked.

## Deployment

- **Cloudflare Workers (primary):** `bunx wrangler deploy` — the Cloudflare Vite
  plugin is active on every build by default, producing a worker bundle in
  `dist/server/index.js` with `wrangler.json`.
- **Vercel:** Builds automatically via `VERCEL=1` (set by Vercel CI). This gates
  the Cloudflare plugin off, so Vite emits a standard Node.js SSR entry
  (`dist/server/server.js`) that Vercel's builder can serve. No `vercel.json`
  required — the TanStack Start SSR handler serves all routes.

## Context

Self-documents in its `context/` directory (six-file methodology + project.yaml).
Org-level product spec: `Team-Compass-2026/.github` → `context/product-spec.md`.
