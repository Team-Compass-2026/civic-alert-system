# WaterWatch — Current State & Lovable Rules of Engagement

> Consolidated snapshot · 2026-08-21
> Replaces piecemeal plan files as the single source of truth for Lovable sessions.

## What the prototype IS

**Stack:** TanStack Start + React 19 + Vite 8 + Tailwind v4 + Supabase JS
**Auth:** Supabase Auth (email/password, `/auth` + `/sign-in` + `/sign-up`)
**Maps:** React Leaflet + OpenStreetMap (free, no API key)
**Deployment:** Nitro/Vercel primary (VERCEL=1 auto-detect), Cloudflare Workers fallback (wrangler.jsonc)

### Routes (all live)

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, tagline, mini-map, How It Works, CTA, footer |
| `/home` | Your area — risk score + why + recommendations |
| `/map` | Full-screen neighborhood map + report markers |
| `/report` | Report form (4-step: type, location, details, photo, anonymous) |
| `/alerts` | Localized alerts + verification (Confirm/Dispute) |
| `/profile` | Reputation, my reports, settings (auth-gated) |
| `/auth` | Login / signup (Supabase Auth) |
| `/sign-in` | Sign-in page |
| `/sign-up` | Sign-up page |
| `/dashboard` | Org dashboard — overall risk, indicators, hotspots |
| `/dashboard/$slug` | Org drill-down — per-area risk + reports |
| `/faq` | Frequently asked questions |

### Supabase setup (DONE)

- **Tables:** areas, reports, verifications, alerts, profiles
- **RLS:** anon INSERT on reports/verifications; owner-scoped SELECT on PII
- **Views:** `v_area_risk` (area risk scores), `v_report_feed` (reports + counts)
- **Storage:** `report-photos` bucket (public read, anon insert)
- **Seed:** 5 Yangon areas, 10 seed reports, demo alerts, Hlaing Tharyar 82/100 HIGH

### What's next (verified roadmap)

1. Wire report → map → verify → risk → alert demo flow end-to-end with live Supabase data
2. Org dashboard data from Supabase (currently scaffolded)
3. Risk-score wiring: connect client to Supabase risk calculations
4. Accessibility pass (FAQ/map accordions, keyboard nav, focus rings)
5. Dark mode (prefers-color-scheme) surface token flip

## Rules of engagement for Lovable

1. **Never commit `.env`** — Supabase anon keys are client-side by design. Only `.env.example` is tracked.
2. **Use existing components/design tokens** — compose from the attached design system (`src/design-system/design-idea-5cd787/`), not from scratch.
3. **Keep data driven by Supabase views** — reads go through `v_area_risk` and `v_report_feed`; writes through RLS-gated tables.
4. **Risk is always badge + label + score** — never color alone. Brand blue never signals risk.
5. **Reports are signals, not diagnoses** — no medical fields, no outbreak claims.
6. **One MVP pillar per session** — don't bundle unrelated features.
7. **Verify before marking done** — `bunx tsc --noEmit` + `bun run lint` + `bun run build` must pass.
8. **Update `context/progress-tracker.md`** when completing work.
9. **TanStack Start file routing** under `src/routes/` — not Next.js App Router.
10. **Mobile-first** — citizen app uses bottom-tab or sidebar navigation, 44px touch targets.
