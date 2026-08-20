# WaterWatch — Auth, layout, palette and profile polish

## Goals

1. Apply the user-supplied Deep Navy / Water Blue palette across the app while keeping risk semantics (badge + label + score) and the Space Grotesk / DM Sans / Geist Mono fonts.
2. Move the site chrome (header, mobile drawer, footer) into a shared wrapper so it appears on every real page without leaking into canvas preview routes.
3. Reduce the landing hero headline size and tidy the landing section rhythm.
4. Add a `profiles` table to persist the user's home area, plus a protected `/profile` flow with proper session restore, sign-out cleanup, and unauthorized redirects.
5. Implement a live area-alerts section on `/profile` with loading, empty, error, and manual refresh states.
6. Add a region picker to the signup flow and persist the chosen area to the account.

## Design decisions

- **Palette**: This is a consumer-app override of the attached design-system tokens. The new `:root` values will map the existing token names (`--brand-*`, `--risk-*`, `--background`, `--foreground`, etc.) to the Deep Navy / Water Blue / Off-white palette. Risk colors remain semantic and paired with labels and scores.
- **Layout**: `src/routes/__root.tsx` stays chrome-free because the Lovable canvas preview routes (`/__mockup/preview`, `/__component/preview`) render inside it. A new `SiteShell` component will wrap every public page instead.
- **Protected routes**: Only `/profile` is guarded. The guard uses `ssr: false` + a `beforeLoad` check that calls `supabase.auth.getUser()`, redirecting to `/auth` with a `redirect` param.
- **Auth pages**: A new `/auth` route hosts the login/signup form. Already-signed-in users are redirected away.
- **Profile storage**: A `public.profiles` table with `user_id` (FK to `auth.users`, cascade delete) and `area_id` (FK to `areas`, set null). The signup form sends `area_id` in `options.data`; a database trigger creates the profile row on user creation. As a fallback, the app also upserts the profile if the row is missing.
- **Sign-out hygiene**: A shared sign-out helper cancels in-flight queries, clears the query cache, calls `supabase.auth.signOut()`, and replaces the history entry to `/auth`.
- **Dark mode**: No `prefers-color-scheme` dark mode is introduced; the default stays light. The existing `.dark` class remains available for manual toggling only.

## Technical plan

### 1. Palette override
- In `src/styles.css`, after the design-system token import, override `:root` custom properties with the Deep Navy / Water Blue / Off-white / Dark Charcoal palette.
- Map the brand ramp so `brand-600` is Water Blue `#2F80ED`, `brand-900` is Deep Navy `#123B5D`, and `brand-50` is a light tint.
- Set `--risk-low` to green `#27AE60`, `--risk-high` and `--risk-critical` to Coral Red `#EB5757`, keep `--risk-moderate` as amber for colorblind-safe contrast.
- Set `--background` to Off-white `#F7F9FA`, `--foreground` to Dark Charcoal `#1F2933`, and update surfaces/borders accordingly.
- Leave the design-system `@theme` wiring untouched; the token variables override the values it references.

### 2. Shared site chrome
- Create `src/components/layout/SiteShell.tsx` that accepts `children` and renders:
  - `SiteHeader` (sticky, translucent white per the landing spec).
  - `Sidebar` (mobile-only hamburger drawer).
  - A `<main>` wrapper with sensible vertical padding.
  - `Footer` with the WaterWatch tagline, links, and disclaimer.
- Move the footer markup from `src/routes/index.tsx` into a new `Footer` component.
- Replace per-page `<SiteHeader />`, `<Sidebar />`, and footer in `index.tsx`, `home.tsx`, `map.tsx`, `report.tsx`, `alerts.tsx`, `profile.tsx`, `faq.tsx`, `dashboard.index.tsx`, and `dashboard.$slug.tsx` with `<SiteShell>...</SiteShell>`.

### 3. Landing page polish
- In `src/routes/index.tsx`, reduce the hero H1 from `text-4xl md:text-6xl` to `text-3xl md:text-5xl` and keep the tight line height.
- Keep the two-column hero, OpenStreetMap mini-map, and the pinned area caption card.
- Ensure the hero map still fills the card edge-to-edge (`p-0`).

### 4. Database migration
- Use the migration tool to create SQL:
  - `CREATE TABLE public.profiles` with `id`, `user_id`, `area_id`, `created_at`, `updated_at`.
  - `GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated`.
  - `GRANT ALL ON public.profiles TO service_role`.
  - `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`.
  - Policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` scoped to `auth.uid() = user_id`.
  - A trigger on `auth.users` that inserts a `profiles` row with `area_id` from `new.raw_user_meta_data->>'area_id'` when a user is created.
  - Index on `profiles(user_id)` for fast lookups.

### 5. Auth wiring
- Create `src/start.ts` exporting `createStart({ functionMiddleware: [attachSupabaseAuth] })` so protected server functions receive the bearer token.
- Add a single `supabase.auth.onAuthStateChange` listener in `src/routes/__root.tsx` (inside the existing root component) that filters to `SIGNED_IN`, `SIGNED_OUT`, and `USER_UPDATED` and invalidates the router + query cache as appropriate.
- Create `src/lib/auth.ts` with `signOutWithCleanup(queryClient, router)` that matches the recommended hygiene.

### 6. Auth route
- Create `src/routes/auth.tsx`:
  - Public route, no SSR guard.
  - If `auth.user` is already present, redirect to `search.redirect ?? "/profile"`.
  - Render `AuthCard` with the area list and a `redirect` search param.

### 7. Signup region picker
- Update `src/components/auth/AuthCard.tsx`:
  - In signup mode, always show the area selector (unauthenticated users have no saved area yet).
  - Store the selected area's UUID in component state and pass it in `supabase.auth.signUp({ options: { data: { area_id } } })`.
  - Keep the existing "check your email" notice for email confirmation.

### 8. Profile page
- Update `src/routes/profile.tsx`:
  - Add `ssr: false` and a `beforeLoad` guard that calls `supabase.auth.getUser()` and redirects to `/auth` with `redirect` param when unauthenticated.
  - Add a `useQuery` for the signed-in user's profile row (`profiles` filtered by `user_id`).
  - If the profile row is missing or has no `area_id`, show a "Complete your profile" card with an area selector and a save button that upserts the profile.
  - Live area alerts section:
    - Use `useQuery(alertsQuery)` and `useWaterwatchRealtime()` for live updates.
    - Show a `Spinner` while loading, an `Alert` on error with a retry button, and `AlertList`/`AlertCard` for results.
    - Add a manual refresh button next to the section heading that calls `refetch()`.
    - Show an empty-state card when no alerts match the user's area.
  - Replace the inline `signOut` call with the robust `signOutWithCleanup` helper.
  - Keep the identity card, my-reports list, reputation chips, and settings card, but source the home area from the profile first and fall back to device prefs.

### 9. Verification
- Run `bunx tsc --noEmit`.
- Run a production build.
- Do a quick runtime check that `/` renders the smaller hero, the footer appears on `/home` and `/map`, `/profile` redirects to `/auth` when signed out, and `/auth` can create a profile-linked account.

## Out of scope

- No new Supabase Edge Functions; all server-side work is either the migration or TanStack server functions if needed.
- No changes to the attached design-system files under `src/design-system/design-idea-5cd787/` or `.lovable/rules/libraries/design-idea-5cd787/`.
- Only `/profile` is gated; `/home`, `/map`, `/report`, and `/alerts` remain public.
