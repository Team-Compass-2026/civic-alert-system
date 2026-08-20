# Project Setup & Lifecycle Guide — WaterWatch (Lovable Prototype)

## The six-file methodology

This repo keeps the same methodology as the org repo. Files:

| # | File | Holds |
|---|------|-------|
| 1 | `project.yaml` | Version, channel, lifecycle stage, theme category |
| 2 | `context/project-overview.md` | Product description, scope, MVP, ethics |
| 3 | `context/architecture.md` | Stack, layout, invariants, risk engine |
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
