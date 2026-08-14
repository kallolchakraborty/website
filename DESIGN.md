# Kallol Chakraborty — Design System Contract

Modern terminal aesthetic for a Principal Consultant & SAP BTP Architect portfolio.
GitHub-Pages static site; `src/*.page.html` sources are compiled to root HTML by
`build.py`, styled by Tailwind (utility classes) + the token layer in `styles.css`.

No invented values: every token below exists in `styles.css` or `tailwind.config.js`.

## Theme

Two themes: **Terminal Light** and **Terminal Dark** (toggled on `.dark` in `<html>`,
theme choice memoized in `localStorage['theme']`, set by an inline `<head>` script to
avoid FOUC). The design language is a clean developer-terminal: monospace display
headings, code-flavored labels, hard offset shadows on hover, pill badges.

## Color

All colors are RGB triplets in `:root` / `.dark`, consumed as `rgb(var(--n) / alpha)`
so Tailwind can add alpha (`border-primary/40`). The scale stacks (`--slate-*`,
`--orange-*`, `--purple-*`, `--emerald-*`) also swap per theme.

**Accent-role map — one hue, one job (do not recolor by eye, change the role token):**

| Role token | Hue (light) | Meaning / usage |
|---|---|---|
| `--primary` | orange 600 | SAP BTP / brand / primary actions / CTAs, focus ring, saf role tags |
| `--secondary` | purple 600 | Gen AI / advanced competency chips, Gen AI section icons |
| `--tertiary` | emerald 600 | status / personal / hobby markers, `Latest` badge glow, status dots |
| `--error` | red | error / destructive only |
| slate (`--on-surface-variant`) | neutral | bodies, borders, chips, no semantic meaning |

Containers: `--bg` (page), `--surface` (cards), `--surface-container*` (nested raised
bars), `--surface-variant` (muted fills). Foregrounds: `--on-surface` (headings/body),
`--on-surface-variant` (secondary text). Accent-role chips use the lightest tint of the
role's scale (e.g. `bg-purple-50 text-purple-700 border-purple-200`) so role is
instantly readable in both themes.

## Typography

Two families, loaded once from Google Fonts:
- **Ubuntu** — body & long-form (`font-body-lg`, `font-body-md`, `font-sans`).
- **Ubuntu Mono** — everything that reads like a terminal line (`font-headline-lg`,
  `font-display-lg`, `font-code-sm`, `font-label-md`).

Conventions: terminal commands, file-tree names, job titles, counts, badges, labels,
KBDs, and `Latest` pills = monospace. Headlines use `gradient-text-orange` or
`text-on-surface` for emphasis; body never renders below `--on-surface-variant`.
Length-preserving measures: `h1/h2 { overflow-wrap: anywhere }` and `pre`
horizontal-scrolls rather than wrapping.

## Components

Lowercase terminal-style section headers (`> ls -la ./featured_work`), each a
`<section>` with `reveal` scroll animation.

- **Cards**: `.faang-card` (home tiles) and `.project-card-item` (projects grid) share
  the same recipe — surface bg, 1px `--border-card`, `--radius-card`, hover = -4px lift
  + primary border tint (`.dark` identical). Project cards open a detail `<dialog>`
  (native, animated via `@starting-style`) or navigate; office tiles are
  non-clickable and get no lift.
- **Chips/badges**: `badge-pill` (orange, mono 12px, pill radius) for status; category
  chips are `text-[10px]` mono pills, one per accent role
  (SAP BTP=orange, Gen AI=purple, Integrations=slate, Personal/status=emerald).
- **`Latest` badge**: `.latest-badge` — primary pill with `auto_awesome` icon and a
  2.4s `latest-pulse` glow ring; static on homepage cards (`.faang-card .latest-badge`),
  absolutely positioned top-right on project tiles. Always disabled under
  `prefers-reduced-motion`.
- **Icons**: one Material Symbols subset inline sprite (`partials/icons.svg`), used via
  `<svg class="icon"><use href="#i_name"/></svg>`; never mix families.
- **Terminal signature**: `.hover-terminal-shadow` = `--shadow-terminal` (6px 6px 0 0
  primary) + (-3px,-3px) translate on project-card hover; `.shimmer-btn` = 4s gradient
  sweep on the primary hero CTA.

## Layout / Spacing

Tailwind `spacing` scale is tokenized in `tailwind.config.js`:
`xs 4 / sm 8 / md 12 / lg 20 / xl 32`, plus `gutter 16` and `margin-desktop 64`
(main-column gutters). Sections stack with generous whitespace; cards sit in a
responsive grid that collapses to single column on mobile. Max-widths and center
columns come from utility classes, not custom layout CSS.

## Elevation

Shadows mean elevation, never decoration beyond the retro signature.
- `--shadow-sm/md/lg` — resting card hierarchy (surface levels).
- Hover uses a soft primary-tinted shadow + lift (cards raise, never distort).
- `--shadow-terminal` — the one hard shadow, reserved for the terminal-hover accent.
Borders (`--border-card`, `--outline-variant`) separate flat surfaces; don't stack
borders and shadows together.

## Motion

Durations tokenized: `--motion-fast 150ms / --motion-base 300ms / --motion-slow 450ms`
with `--ease-standard: cubic-bezier(0.16, 1, 0.3, 1)` for everything that moves.
Default easing is this exit-oriented curve; linear `step-end` only for the 404 blinking
cursor. Motions:
- `.reveal` scroll reveal (opacity + 18px translate, staggered ≤6 children).
- `latest-pulse` glow ring on the `Latest` badge (2.4s, both themes via a token not a
  hardcoded green).
- `shimmer` background sweep (4s linear) on the hero CTA.
- Micro-lifts: card -4px, arrow translate-x on card/cert hover, `button:active` scale 0.98.

**Kill switch enforced twice**: global `prefers-reduced-motion` block zeroes
duration/iteration for all animations, and individual rules additionally set
`animation: none` / `transform: none` under the same query.

## Dark mode

`.dark` mirrors every token (page `--bg` #0f172a, orange shifts to `#fb923c`,
purple/emerald lighten, slate scale inverts darkest→lightest). Parity rules:
- Accent-tint chips use the dark theme's lighter tints (`--orange-700 → --orange-400`,
  purple/emerald likewise); the legacy `.dark .bg-*` overrides in `styles.css` handle
  light-mode-only utility combos.
- `dialog::backdrop` and header glass darken with the theme.
- Terminal hard shadow flips to the light orange `#fb923c`.

Never ship a component that only renders for one theme; always check both.

## Responsive

Mobile-first Tailwind breakpoints; the header collapses to a hamburger whose
icon-swap and `aria-expanded` are styled in CSS; long code strings wrap (headings)
or scroll (`pre`). Confirm at ≥ 320px and desktops; icon-only controls need 44px
targets.

## Do's / Don'ts

- Do reuse role tokens for any new accent color; add a scale to `tailwind.config.js` +
  both `:root`/`.dark` before using it in markup.
- Do put every string-bearing tone in a monospace utility; body stays Ubuntu.
- Do add `width/height` + `loading="lazy"` to images; keep sprites single-family.
- Don't invent a new hover shadow, card, or chip variant — reuse `.faang-card` /
  `.project-card-item` / `badge-pill` / role-tint chips.
- Don't hardcode the latest-pulse hue; it must follow `--tertiary`.
- Don't ship one-theme-only styles; test `.dark` parity and reduced-motion.
- Don't edit compiled root `.html` directly — edit `src/*.page.html` and rebuild
  (`npm run build`), keeping source == artifact (CI enforces).

## Agent prompt guide

"Follow `DESIGN.md` + `styles.css`/`tailwind.config.js` token layer. Keep the modern
terminal aesthetic. Change accent colors via the accent-role tokens, not utility-class
searches. Edit `src/*.page.html` (sources), run `npm run build`, keep dark mode + the
reduced-motion kill switch, and never hand-edit generated `*.html`/`sitemap.xml`/
`search-index.json`."