# Code Standards — WaterWatch (Lovable Prototype)

**TanStack Start · React 19 · TypeScript strict · Tailwind v4 · Supabase**

## TypeScript
- `strict: true`; avoid `any`; prefer `unknown` + narrow
- Shared types in `src/lib/types.ts` (report types, areas, alerts)
- Zod schemas for validation

## Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Routes: file-based under `src/routes/` (TanStack Start convention)
- Supabase tables/columns: `snake_case`

## Styling
- Tailwind v4 CSS-first tokens (`@theme` in CSS)
- Only WaterWatch palette tokens — no arbitrary brand-breaking colors
- Risk colors only for risk levels; always pair color with badge + score
- Mobile-first; 8px spacing rhythm; clean & airy — soft shadows, larger radii

## Auth & privacy
- **Supabase Auth** — anonymous reporting is a first-class path
- PII minimal; identity/contact never exposed to organizations (RLS)
- Reports are **signals, not diagnoses** — no medical fields

## Data
- Supabase RLS on all write operations
- Anonymous inserts allowed; signed-in writes require auth
- Never commit `.env` — Supabase anon keys are client-side by design

## Commit style
- Conventional commits: `feat|fix|docs|chore|refactor|test(scope): why`
- Never commit `.env` / tokens / service keys
- `.gitignore` ignores `.env*` except `.env.example`

## Gates
- `bunx tsc --noEmit` — type check
- `bun run lint` — lint
- `bun run build` — production build

## Definition of Done
Spec met · types clean · RLS enforced · signals-not-diagnoses copy ·
risk scores explainable · no secrets · progress-tracker updated ·
demo path (report→verify→score→views) unbroken
