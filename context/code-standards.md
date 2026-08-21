# Code Standards — WaterWatch (Lovable Prototype)

**TanStack Start · React 19 · TypeScript strict · Tailwind v4 · Supabase**

## TypeScript
- `strict: true`; avoid `any`; prefer `unknown` + narrow
- Shared types in `src/lib/waterwatch.ts` (report types, areas, alerts, risk)
- Zod schemas for server function input validation
- Supabase generated types in `src/integrations/supabase/types.ts`

## Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Routes: file-based under `src/routes/` (TanStack Start convention)
- Server functions: `*.functions.ts` (e.g., `access.functions.ts`)
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
- Server functions use `requireSupabaseAuth` middleware for user-scoped queries

## Data
- Supabase RLS on all write operations
- Anonymous inserts allowed; signed-in writes require auth
- Never commit `.env` — Supabase anon keys are client-side by design
- Client queries go through `src/lib/queries.ts` (TanStack Query `queryOptions`)
- Server queries go through `createServerFn` with auth middleware

## Server function pattern
```ts
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAccess> => {
    // context.supabase is scoped to the authenticated user
    // context.userId is the authenticated user's ID
  });
```

## Performance
- Avoid N+1 queries — fetch bulk data via views, never loop and query per item
- Parallelize independent queries with `Promise.all` when possible
- Use `.select("col1, col2")` instead of `.select("*")` for large views
- Add indexes on frequently filtered columns (area_id, created_at)

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
