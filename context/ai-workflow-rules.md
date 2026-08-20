# AI Workflow Rules — WaterWatch (Lovable Prototype)

## Approach

Spec-driven against the six-file context (`context/`) + org
`context/product-spec.md`. Do not invent report categories, townships, or
scoring rules outside the curated product design.

**Current mandate: Lovable prototype built on TanStack Start + Supabase.
Supabase Auth + RLS for all write operations.**

## Scoping rules

- One MVP pillar per implementation cycle
- Auth: **Supabase Auth** (anonymous reporting first-class)
- Maps: Leaflet + react-leaflet + OpenStreetMap
- Anonymous reporting is a first-class path

## When to split work

Split if combining: report intake+map, verification+risk score, citizen app+org
dashboard.

## System design triggers

| Trigger | Doc / skill |
|---------|-------------|
| Reports / verifications | `context/architecture.md` storage + RLS |
| Risk score / alerts | `context/architecture.md` risk engine |
| Map / geospatial | `context/architecture.md` Leaflet + OSM |
| UI / design | `context/ui-context.md` |
| New report types / areas | `context/product-spec.md` (org repo) |

## Verification (when building)

- Demo path: report → map → verify → risk score → citizen alert / org view
- Anonymous report works end-to-end
- Unauthenticated writes rejected (RLS on Supabase)
- Risk score exposes a component breakdown
- `bunx tsc --noEmit` + `bun run lint` + `bun run build` pass
- Update `context/progress-tracker.md`

## Delivery approach

1. One MVP pillar per cycle (report intake+map, verification+risk score,
   citizen app+org dashboard)
2. Seed sample data (report types, areas, baseline)
3. P0 vertical: report → map → verify → risk score → alerts/dashboard
4. Gate each pillar with type check + lint + build
