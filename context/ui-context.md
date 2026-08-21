# UI Context — WaterWatch (Lovable Prototype)

## Product feel

Calm, clear, local, community-driven. Emphasize neighborhood awareness and
next actions. Avoid fear-mongering, clinical aesthetics, and dense data-heavy
dashboards on the citizen side. Risk states are informative, not alarming.

## Visual energy

Clean & airy — generous whitespace, soft shadows, larger radii. The risk
palette is the only bold element. Urgency expressed through the risk system,
not visual density.

- Feeds and card lists: `space-y-6` / `gap-6`; sections `py-12`+
- Cards: hairline border + soft shadow, subtle lift on hover
- Buttons: pill or `rounded-lg`

## Brand

- Product name **WaterWatch** hero-level on marketing
- Team Compass secondary (about / footer)
- Tagline: **See the risk. Share the signal. Protect the community.**
- Short: **Myanmar's community WASH intelligence layer.**
- Theme: a neighborhood watch for water — mobile-first, friendly, actionable

## Report-type icons

Always pair an icon with a label:

- 💧 Unsafe water · 🧯 Sewage · 🌊 Flooding · 🔧 Broken infrastructure ·
  🚻 Sanitation problem · 🤒 Illness cluster · ⚪ Other

## Risk semantics (must be consistent)

Risk is always a **color + badge label + score** — never color alone.

- 🟢 **LOW** (0–33) — green `#16a34a`
- 🟠 **MODERATE** (34–66) — amber `#d97706`
- 🔴 **HIGH** (67–84) — red `#dc2626`
- 🟥 **CRITICAL** (85–100) — deep red `#b91c1c`

Use risk colors only for risk levels so meaning stays unambiguous.

## Color system (light)

White + soft blue-gray + navy primary + water-blue secondary + green/amber/red
risk accents. No pure black backgrounds on the citizen side.

Dark mode (`prefers-color-scheme: dark`) flips background to `#0b1120` and
foreground to `#f8fafc`.

## Typography

**Space Grotesk** (display + headings) + **DM Sans** (body) + **Geist Mono**
(data only — timestamps, ids, scores; never headings).

## Layout system

- Mobile-first; citizen app bottom-tab navigation (Home · Map · Report · Alerts · Profile)
- 12-column desktop grid for the org dashboard
- 8px spacing system, generous on feeds (`space-y-6` / `gap-6`)

## Map rendering

- **Leaflet + react-leaflet + OpenStreetMap** (free, no API key)
- SSR-safe: `NeighborhoodMap` wraps `NeighborhoodMapClient` via `ClientOnly` + `lazy`
- Area circles: color from `--risk-{level}` CSS var, radius from `area.radius_m`
- Report markers: color from `--brand-{level}` CSS var per report type
- Alert markers: dashed ring in risk color, fill from `--card`
- Center: Yangon `[16.84, 96.16]`, zoom 12
- Pulse animation on area popup open (`ww-area-pulse` keyframe)
- Tooltip on hover, popup on click with area details + verify link

## Interactions & copy

- **Report a Problem** not Submit a Complaint
- **Confirm / Dispute** not Validate / Reject
- **See Why** (risk explanation) not View Analytics
- **Get a Local Alert** not Enable Notifications
- Buttons: Navy primary bg, white text, pill/`rounded-lg`

## Accessibility

WCAG-friendly contrast · visible focus states · keyboard navigation · 44px touch
targets · semantic headings · alt text · reduced-motion support · risk never by
color alone.
