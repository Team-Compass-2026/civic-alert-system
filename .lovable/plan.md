# WaterWatch — Real Yangon data + correct per-screen wiring

Today the database holds 5 areas, 22 reports, 17 verifications and 8 alerts. That is too thin to make the product read like the pitch: the dashboard indicators, township ranking, trends and the map all look empty or hand-waved, and alerts have no location of their own so they cannot be shown on the map.

This plan reseeds the data to pitch scale, gives alerts a place on the map, and makes every screen read from that data. The landing page keeps its current copy and structure.

## 1. Reseed the Yangon dataset

Expand `areas` from 5 to 12 real Yangon townships with correct coordinates, radii, risk baselines and per-signal breakdowns (water / sanitation / flooding / illness), spread across the risk scale:

- HIGH/CRITICAL: Hlaing Tharyar, Shwepyithar, Dagon Seikkan, Thaketa
- MODERATE: South Dagon, North Okkalapa, Insein, Mingaladon, Dala
- LOW: North Dagon, Kamayut, Bahan

Seed roughly 140 reports across the 12 areas over the last 14 days, weighted so high-risk townships carry most water/sewage/illness reports and calm townships carry a few. Report types, timestamps and free-text descriptions are written to look like real resident observations (Burmese place references, market/jetty/lane detail). Seed ~90 verifications so confirm/dispute counts vary per report, including a couple of disputed reports.

Seed ~14 alerts: at least one per high and moderate area, mixing severity (HIGH / MODERATE / LOW), kind (advisory, verification request, resolved update) and status (active / resolved / monitoring).

All rows go in as literal `INSERT` statements in a migration.

## 2. Give alerts a location

Add nullable `lat` / `lng` to `alerts`, backfilled from the parent area centroid with a small offset so alerts do not stack exactly on the area circle center. Extend the feed view (or add `v_alert_feed`) so every alert ships with its area name, township, coordinates, level, status and confirm counts in one read.

## 3. Signals view for the dashboard

Add `v_signal_trends`: per report type, counts for the last 7 days vs the previous 7 days and a percentage trend. The organization dashboard's indicator table (water reports, sanitation, illness signals, flood reports, with ↑/↓ trend) reads from this instead of local math over a truncated feed.

## 4. Screen-by-screen wiring

- `/` landing — unchanged copy and layout; only the mini-map benefits from the richer area set.
- `/home` — area picker lists all 12 townships; risk card, stat tiles, "Why this score?" breakdown, recent reports and nearby areas all resolve from the reseeded rows for whichever area is selected.
- `/map` — area circles for all 12 townships, report markers, plus a **new alert layer**: one marker per active alert at its coordinates, severity-colored, with a popup showing title, area, level badge, timestamp and a link to `/alerts`. Legend gains an alert entry. Township trends card reads the trends view.
- `/alerts` — feed reads the alert view: "Your area" section filters by the resident's saved/profile area, the rest are grouped by township, each card shows area name + distance context and its verification prompt.
- `/report` — location step area list matches the 12 areas; submitted reports land in the right area and appear immediately in feed/map.
- `/profile` — my-reports and localized alerts resolve against the user's home area from the new set.
- `/dashboard` — aggregate indicators from `v_signal_trends`, priority-area ranking over all 12 areas, recent reports table with area + verification counts.
- `/dashboard/$slug` — drill-down shows that area's signal breakdown, its alerts and its reports.

## Technical notes

- One Supabase migration: `ALTER TABLE public.alerts` for lat/lng, the two views (`v_alert_feed`, `v_signal_trends`) with `security_invoker = true` and `GRANT SELECT` to `anon, authenticated, service_role`, then the literal seed inserts. Existing seeded reports/verifications/alerts are cleared first so counts stay consistent; real user-submitted reports are preserved by only deleting rows created before the seed marker timestamp.
- New query options in `src/lib/queries.ts` for the alert feed and signal trends; existing `areasQuery` / `reportFeedQuery` keep their shape.
- Map alert layer added to `src/components/map/NeighborhoodMapClient.tsx` as an optional `alerts` prop so `/` keeps its clean mini-map and `/map` opts in.
- All styling stays on design-system components and tokens; risk color stays badge + label + score.
