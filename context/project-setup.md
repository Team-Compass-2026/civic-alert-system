# Project Setup & Lifecycle Guide — WaterWatch (Lovable Prototype)

## The seven-file methodology

This repo keeps the same methodology as the org repo. Files:

| # | File | Holds |
|---|------|-------|
| 1 | `project.yaml` | Version, channel, lifecycle stage, theme category |
| 2 | `context/project-overview.md` | Product description, scope, MVP, ethics |
| 3 | `context/architecture.md` | Stack, data model, invariants, risk engine, Supabase patterns |
| 4 | `context/code-standards.md` | Conventions, lint/build gates, DoD |
| 5 | `context/ui-context.md` | Theme tokens, typography, risk semantics, visual energy |
| 6 | `context/ai-workflow-rules.md` | Agent behavior, scoping, verification |
| 7 | `context/progress-tracker.md` | Current phase, completed, next, decisions |

Org-level master spec: `Team-Compass-2026/.github` → `context/product-spec.md`.

## Getting started (this repo)

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint       # eslint
bun run build      # production build gate
```

## Environment variables

Create a local `.env` (gitignored) from `.env.example` (tracked):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_PROJECT_ID` | Supabase project reference |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (server-side) |
| `SUPABASE_URL` | Supabase project URL (server-side) |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref (client-side) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key (client-side, exposed in bundle) |
| `VITE_SUPABASE_URL` | Supabase URL (client-side, exposed in bundle) |
| `SUPABASE_SERVICE_ROLE_KEY` | Placeholder — service role key for admin/migration ops |

**7 vars total.** `.env` is never committed. `.env.example` is tracked and must stay in sync.

## Supabase data flow

### How data gets to the frontend

1. **Seeded data** — Migrations in `supabase/migrations/` create tables, views, and seed ~12 areas, ~134 reports, ~200+ verifications, ~18 alerts
2. **Client-side queries** — `src/lib/queries.ts` defines TanStack Query `queryOptions` that call Supabase views directly from the browser
3. **Server functions** — `src/lib/access.functions.ts` and `src/lib/profile.functions.ts` use `createServerFn` with `requireSupabaseAuth` middleware for user-scoped queries
4. **Realtime** — `useWaterwatchRealtime` hook subscribes to postgres_changes on reports + alerts, invalidating React Query caches

### Query patterns

```
// Client-side (browser, RLS applies via anon key)
supabase.from("v_area_risk").select("*").order("score", { ascending: false })
supabase.from("v_report_feed").select("*").order("created_at", { ascending: false }).limit(60)

// Server-side (authenticated user, middleware-scoped client)
context.supabase.from("user_roles").select("role, area_id").eq("user_id", context.userId)
context.supabase.from("v_area_risk").select("*").eq("slug", slug).maybeSingle()
```

## Version & lifecycle (project.yaml)

- `version.current` — semver; bump `0.x.0` per feature in dev
- `version.channel` — dev → alpha → beta → rc → stable
- `lifecycle.stage` — idea → … → development (current) → testing → staging →
  production → maintenance → sunset
- `build_number` — auto-incremented per release

## Daily workflow

1. Read the context files (ground truth)
2. State the goal ("fix the alerts card", "wire the report form to Supabase")
3. Implement one MVP pillar at a time
4. Verify: `bunx tsc --noEmit` + `bun run lint` + `bun run build`
5. Update `context/progress-tracker.md`
6. Bump `project.yaml` on releases

## Context maintenance

- Update a context file when its truth changes
- Commit context changes alongside code changes
