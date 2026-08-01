# Intuitive Project Tiles — Design

Date: 2026-08-01

## Problem

Project tiles are ambiguous: 5 office projects have no detail pages and no
click handler, while 6 personal projects navigate to detail pages — with no
visual distinction. The `open_in_new` icon means "GitHub repo" on 5 tiles but
"detail page" on Free Chess. Clickability is discoverable only via a hover
shadow. No keyboard access to tile actions.

## Decision

Make tile type and destination obvious at rest (no hover required).

### 1. Tile types are visually distinct

- Personal tiles (6): clickable. Persistent footer action row: "View case
  study →" opens the detail page. GitHub icon button beside it where a public
  repo exists (5 of 6; Free Chess repo is private → no GitHub button).
- Office tiles (5): no click handler, no arrow/chevron, muted hover (border
  tint only, no terminal-shadow lift) so they read as static cards.

### 2. Clear link destinations

- Personal tile footer "View case study →" is the single consistent target
  (detail page).
- GitHub button uses the `code` icon, `title="View source on GitHub"`, opens
  new tab. Removes today's mixed `open_in_new` semantics.

### 3. Keyboard accessibility

- Personal tile title and action row: keyboard-focusable links (Enter opens
  detail page). Office tiles stay non-interactive (no tab stop).

### 4. No new files or dependencies

- Pure HTML/CSS change in `src/projects.page.html` plus a small main.js
  addition (keyboard Enter on tile action rows). Detail pages and filter JS
  untouched.

## Files touched

- `src/projects.page.html` — action rows, GitHub buttons, office-tile styling.
- `main.js` — keyboard Enter support for tile action rows.
- Generated `projects.html`, `static/site.css` via `npm run build`.

## Verification

- Headless: all 6 personal tiles show "View case study →"; 5 show GitHub
  button; free-chess tile has none; office tiles have no arrow and no click
  navigation; keyboard Enter on a focused personal tile opens its detail page.
