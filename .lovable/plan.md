Plan — WaterWatch UI/UX Refinement

1. Navigation redesign
   - Remove the fixed bottom TabBar (`src/components/layout/TabBar.tsx`) from the app shell.
   - Add a collapsible side navigation (sidebar) that holds the primary citizen links: Home, Map, Report, Alerts, Profile.
   - Keep the top SiteHeader with the WaterWatch logo, the primary "Report a Problem" CTA, and the org/FAQ links.
   - Ensure the sidebar is responsive: a persistent drawer on desktop and an off-canvas/slide-over menu on mobile, with a menu toggle in the header.
   - Apply the sidebar layout to every citizen page (home, map, report, alerts, profile, faq) without affecting the public landing page (`/`) or the org dashboard (`/dashboard`).

2. Map improvements
   - Increase the map height in the hero section on `/` so the pinned area risk caption has more usable visual space.
   - Complete the `/map` page with interactive area circles, a clear legend, and a risk details panel that opens when a user taps/clicks an area. The panel should show the area name, overall risk score, risk badge, a short "Why this score" breakdown, and a list of recent contributing reports.

3. Report page
   - Keep `/report` as a guided, mobile-first form (what/where/when/photo/privacy) with step-by-step flow and a confirmation state after submission.
   - Ensure it still uses the map for location pinning and Supabase Storage for optional photo uploads.

4. Dark mode
   - Add a `prefers-color-scheme: dark` mode across `/` and `/home` that flips semantic surface tokens (background, card, muted, foreground, border) while preserving the design-system risk color semantics (green/amber/red/critical).
   - Keep the risk badge color invariant: badge + label + score, never color alone.
   - Remove the redundant dark-token block in `src/styles.css` that duplicates the design-system tokens, then wire the dark mode via the design-system theme or a single project dark override.

5. Alerts page
   - Ensure `/alerts` displays localized alerts for the user’s selected area, with severity-tinted cards and real-time refresh via the existing Supabase realtime subscription.
   - Keep the community verification workflow (Confirm/Dispute) for each alert.

6. Accessibility
   - Add correct `aria-expanded`, `aria-controls`, and keyboard handling (`Enter`/`Space`) to the accordion on `/home`.
   - Add focus rings, visible labels, and keyboard support to map controls (area circles, report markers, popup close buttons, and the layer/legend controls).

7. Design-system tidy-up
   - Remove the button-shape override to `rounded-pill` in `/map` and `/report`.
   - Remove the CardBody padding overrides in `/home` and `/index` so they rely on the design system’s built-in spacing.
   - Verify the build still passes after the changes.

8. Out of scope
   - No new backend migrations or schema changes unless a data gap is discovered while wiring the sidebar/map details.
   - No org-dashboard changes beyond the existing route structure.
