# Project Overview — WaterWatch (Lovable Prototype)

**Team:** Team Compass · **Hackathon:** DEEP 2026
**Repo:** `Team-Compass-2026/civic-alert-system`
**Category:** Health and Wellbeing (primary) · Community Resilience and Sustainability (secondary)

> Brand: **WaterWatch** · Tagline: *See the risk. Share the signal. Protect the community.*
> Canonical org-level spec: `Team-Compass-2026/.github` → `context/product-spec.md`.
> This file is the Lovable/prototype repo operational view.

## What this repo is

The **Lovable prototype** of WaterWatch — the same community WASH early-warning
platform, backed by Supabase (Auth + Postgres + RLS + Storage) instead of the
main app's Next.js + Neon + Prisma stack.

**Stack:** TanStack Start + React 19 + Vite 8 + Tailwind v4 + Supabase JS

## The problem

Water and sanitation problems emerge at the neighborhood level before they show
up in formal health statistics. Residents observe dirty water, sewage overflow,
flooding, or broken infrastructure but have no simple way to turn those
observations into a structured community warning — and organizations lack
localized data to decide where to investigate first.

## Our solution

Citizens report local WASH problems (what / where / when / photo, anonymous
option). Nearby users verify. WaterWatch aggregates geographically and
temporally into neighborhood WASH Risk Scores and localized alerts.
Organizations get a prioritization dashboard.

**Core loop:** Observe → Report → Verify → Analyze → Alert → Prioritize

**Reports are signals, not diagnoses** — WaterWatch does not diagnose cholera or
declare outbreaks; it flags unusual community-level signals that may warrant
attention.

## MVP — five things only

1. User reports a WASH problem.
2. Report appears on a map.
3. Nearby users can verify it.
4. System calculates a basic risk score.
5. Users and organizations receive different views of the information.

## Scope

- In-scope / demo: mobile-first citizen app (home, map, report, alerts, profile)
  + org dashboard (`/dashboard`)
- Out of scope: medical diagnosis, sensors/rainfall feeds, multi-city,
  partner-rewards marketplace, multi-language, export/API tiers
