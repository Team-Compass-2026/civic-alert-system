# Architecture Context — WaterWatch (Lovable Prototype)

> Ground truth: `project-overview.md` and org master spec
> (`Team-Compass-2026/.github` → `context/product-spec.md`).
> **MVP = deterministic, explainable risk scoring over community reports +
> verification. No medical diagnosis, no epidemiological inference engine.**

## Stack (as built)

| Layer | Technology | Status |
| ----- | ---------- | ------ |
| Framework | **TanStack Start** (file routing, `src/routes/`) | built |
| Language | TypeScript 5, strict | built |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) | built |
| Data fetching | TanStack Query v5 + TanStack Start `createServerFn` | built |
| Validation | Zod 3 | built |
| Charts | Recharts | built |
| Dates | date-fns | built |
| Maps | **React Leaflet + Leaflet + OpenStreetMap** (free, no API key) | built |
| Backend | **Supabase** (Postgres + Auth + RLS + Storage) | built |
| Deployment | **Cloudflare Workers** (wrangler.jsonc) | deployed |

## Route map

| Route | Purpose | SSR |
|-------|---------|-----|
| `/` | Landing / index | yes |
| `/home` | Your area — risk score + why + recommendations | yes |
| `/map` | Neighborhood map + report markers | yes |
| `/report` | Report form (type, location, details, photo, anonymous) | yes |
| `/alerts` | Localized alerts + verification requests | yes |
| `/profile` | Reputation, my reports, settings | no |
| `/auth` | Login / signup (Supabase Auth) | yes |
| `/sign-in` | Sign-in page | yes |
| `/sign-up` | Sign-up page | yes |
| `/reset-password` | Password reset flow | yes |
| `/reset-password/sent` | Password reset confirmation | yes |
| `/dashboard` | Org dashboard — overall risk, indicators, hotspots | no |
| `/dashboard/$slug` | Org drill-down — per-area risk + reports | no |
| `/faq` | Frequently asked questions | yes |

## Data model (Supabase)

### Tables

- **areas** — slug, name, township, lat/lng, radius_m, base_score, trend_pct, baseline_reports, components (JSONB), baseline_at
- **reports** — type (enum), description, when_happened, lat/lng, area_id (FK→areas), photo_url, is_anonymous, anon_token, status, created_at
- **verifications** — report_id (FK→reports), value (confirm/dispute), anon_token, unique(report_id, anon_token)
- **alerts** — level (risk_level enum), kind, title, body, advice, area_id (FK→areas), status, lat/lng, created_at
- **profiles** — user_id (FK→auth.users, unique), area_id (FK→areas), created_at, updated_at
- **user_roles** — user_id (FK→auth.users), role (admin/org/citizen enum), area_id (FK→areas), unique(user_id, role)

### Enums

- **report_type** — unsafe_water, sewage, flooding, broken_infrastructure, sanitation, illness_cluster, other
- **risk_level** — LOW, MODERATE, HIGH, CRITICAL
- **verification_value** — confirm, dispute
- **app_role** — admin, org, citizen

### Views (queried as tables)

- **v_area_risk** — areas + live report count via LATERAL subquery; computes score, level, reports_this_week
- **v_report_feed** — reports + area name + confirm/dispute counts via LATERAL subquery
- **v_alert_feed** — alerts + area metadata (slug, name, township, lat/lng)
- **v_signal_trends** — week-over-week report type counts (current_count, previous_count, trend_pct)

### RLS policies

- areas: publicly readable
- reports: publicly readable; anyone can insert (status='open')
- verifications: publicly readable; anyone can insert with valid anon_token
- alerts: publicly readable
- profiles: scoped to owner (SELECT/INSERT/UPDATE/DELETE where auth.uid() = user_id)
- user_roles: scoped to owner (SELECT where auth.uid() = user_id)
- storage.objects: report-photos bucket (public read, anon insert)

### Triggers

- `on_auth_user_created` → `handle_new_user()` — creates profile on signup
- `on_auth_user_created_role` → `handle_new_user_role()` — assigns 'citizen' role on signup

### Storage

- `report-photos` bucket (public read, anon insert) for report photos

## Supabase client architecture

### Browser client (`src/integrations/supabase/client.ts`)
- Lazy-initialized via Proxy pattern (only created on first access)
- Uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- Persisted sessions in `localStorage`

### Server admin client (`src/integrations/supabase/client.server.ts`)
- Uses `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS
- Used only for trusted server-side operations

### Auth middleware (`src/integrations/supabase/auth-middleware.ts`)
- Creates per-request Supabase client scoped to authenticated user's JWT
- Extracts Bearer token from request headers
- Validates via `supabase.auth.getClaims(token)`
- Passes `{ supabase, userId, claims }` to downstream server functions

### Data fetching patterns

**Client-side queries** (TanStack Query in `src/lib/queries.ts`):
```ts
supabase.from("v_area_risk").select("*").order("score", { ascending: false })
supabase.from("v_report_feed").select("*").order("created_at", { ascending: false }).limit(60)
supabase.from("v_alert_feed").select("*").order("created_at", { ascending: false })
supabase.from("v_signal_trends").select("*").order("current_count", { ascending: false })
```

**Server functions** (`createServerFn` + `requireSupabaseAuth` middleware):
- `getMyAccess` — queries user_roles + profiles
- `getAreaDashboard` — loadAccess + area lookup + reports + alerts (5 sequential queries)
- `getScopedAreas` — loadAccess + filtered area list
- `getMyProfile` — queries profiles, auto-creates if missing
- `updateMyProfileArea` — updates profiles.area_id

## Risk semantics

4-level risk scale (score 0–100):

| Level | Range | Color | Badge |
|-------|-------|-------|-------|
| LOW | 0–33 | `#16a34a` (green) | LOW |
| MODERATE | 34–66 | `#d97706` (amber) | MODERATE |
| HIGH | 67–84 | `#dc2626` (red) | HIGH |
| CRITICAL | 85–100 | `#b91c1c` (deep red) | CRITICAL |

Risk is always **color + badge label + score** — never color alone.

## Invariants

1. Reports are **signals, not diagnoses** — never claim an outbreak/diagnosis
2. Risk scores are transparent and explainable (component breakdown)
3. Anonymous reporting must always be possible
4. PII minimized; identity/contact data never exposed to organizations
5. Verification + clustering gate outlier reports
6. **No secrets in git** — `.env` is never committed
7. Risk color is never used alone — always badge label + score
8. Supabase RLS gates all write operations

## N+1 awareness

- No classic N+1 patterns found — all queries fetch bulk data via views
- `getAreaDashboard` runs 5 sequential queries; reports + alerts could be parallelized
- `loadAccess()` is called separately in `RequireAccess` and inside server functions (double query per dashboard visit)
- `v_area_risk` uses LATERAL subquery — may degrade at scale; consider materializing report count
