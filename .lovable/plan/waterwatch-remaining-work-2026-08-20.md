# WaterWatch — remaining work

Most of the requested pages already exist and were just rebuilt to the prompt specs: landing (`/`), `/home`, `/report` (4-step guided form with tap-to-pin map, photo preview, anonymous-by-default, success card), `/map` (area overlays, popups with why-bullets, pulse on open, recent updates, legend, floating report button), `/alerts` (your-area section, severity-tinted cards, confirm / dispute / not sure workflow, live refresh), `/profile`, and `/faq` (5 items with rotating chevron).

What is left:

## 1. Organization dashboard drill-down
- Split the current `/dashboard` into a leaf page plus a per-area page at `/dashboard/<area-slug>`.
- Dashboard: eyebrow + title + overall-risk pill, indicators table with trend arrows, three ranked priority-area cards (rank, score, badge, trend, why-bullets) linking to the drill-down, recent-reports table (type icon, area, truncated report, confirm/dispute counts, when), disabled filter row and footer controls marked "coming soon", plus the disclaimer.
- Drill-down: back link, area header with badge and score, full risk-component breakdown, and a table of every report in that area.

## 2. Dark mode
- Add a `prefers-color-scheme: dark` block at the app theme layer that re-points the surface tokens (background, card, border, muted, foreground) to their dark values, so landing and `/home` follow the system setting.
- Risk tokens stay unchanged: badges keep the same label + score + colour semantics in both modes.

## 3. Accessibility pass
- FAQ and "Why this score?" accordions: proper expanded state, keyboard operation, and visible focus rings.
- Map: keyboard-reachable controls, accessible names on the pin/report actions, and a text alternative listing area risks for non-visual users.
- Check tap targets and focus-visible styling on the chip grid and segmented control in `/report`.

## 4. Verification
- Render every route headlessly, confirm no console errors, and confirm submit stays disabled until type and location are set.

## Note on the design-system prompt (Prompt 08)
That prompt describes building the design-system library itself. This project is the consumer app: the library is attached as vendor-owned files under `src/design-system/design-idea-5cd787/` that get overwritten on every library update, so token or component changes (including a navy-dominant palette) must be made in the library project and republished. I can instead apply an app-level token override here if you want the navy look now.

## Technical notes
- New files: `src/routes/dashboard.index.tsx`, `src/routes/dashboard.$slug.tsx` (replacing `src/routes/dashboard.tsx`).
- Dark mode lives in `src/styles.css` only; no component-level colour literals.
