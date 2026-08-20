# AI Agent Notes — WaterWatch Lovable Prototype

This is the **WaterWatch Lovable/prototype path** — the same WaterWatch
product (WASH early-warning platform), built with TanStack Start + Supabase
instead of the main app's Next.js + Neon + Prisma stack.

**Stack:** TanStack Start + React 19 + Vite 8 + Tailwind v4 + Supabase JS
**Auth:** Supabase Auth (anonymous reporting first-class)
**Never commit `.env`** — Supabase anon keys are client-side by design.

## Context read order

Read these files in order before making changes:

1. `context/project-overview.md` — what the product is
2. `context/architecture.md` — stack, data model, invariants
3. `context/code-standards.md` — conventions, gates
4. `context/ui-context.md` — tokens, palette, typography, layout
5. `context/ai-workflow-rules.md` — how to scope and deliver
6. `context/progress-tracker.md` — current state, what's next

## Orchestra commands

- `/orchestra off` — disable auto-orchestra
- `/orchestra on` — enable auto-orchestra
- `/orchestra stop` — halt running orchestra loop

## Notes

- This repo uses TanStack Start file routing (`src/routes/`), NOT Next.js App Router
- Supabase + RLS replaces Prisma + Neon + Better Auth
- Leaflet + react-leaflet + OpenStreetMap for mapping (same as main app)
- `context/product-spec.md` lives in the org repo (`Team-Compass-2026/.github`)
