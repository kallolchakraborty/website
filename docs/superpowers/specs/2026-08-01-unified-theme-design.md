# Unified Terminal Theme — Design

Date: 2026-08-01

## Problem

The site has two diverging design systems. `index.html` and `experience.html` use
literal Tailwind classes (slate grays, `orange-600`) with Ubuntu Mono/Ubuntu fonts
loaded from Google Fonts. `projects.html` and `contact.html` use semantic design
tokens (`text-primary`, `bg-surface-container`, `on-surface`) with a brick/mauve
palette (`#a93100` / `#7f506c`) and fonts ("JetBrains Mono", "Inter") that are never
loaded, so those pages silently fall back to system monospace.

Because the Tailwind config is duplicated inline on all 4 pages, the two halves
drifted. `main.js` renders the command palette with token classes that only resolve
on the projects/contact pages, so shared components render differently per page.

## Decision

Standardize the whole site on the **terminal orange + Ubuntu** direction
(index/experience look), enforced through **one shared theme file** so drift
cannot recur.

## Changes

### 1. New file: `theme.js`

Single shared `tailwind.config` loaded by all pages before the Tailwind CDN.
Contents:

- **Colors** — orange/slate palette, values from index/experience, plus every
  token name that projects/contact reference:
  - `primary: #ea580c`, `primary-container: #ea580c`, `secondary: #7c3aed`
  - `surface: #ffffff`, `surface-container: #f8fafc`,
    `surface-container-low: #f1f5f9`, `surface-container-high: #f1f5f9`,
    `surface-container-highest: #e2e8f0`, `surface-variant: #e2e8f0`
  - `on-surface: #0f172a`, `on-surface-variant: #475569`, `on-primary: #ffffff`,
    `surface-tint: #ea580c`, `background: #fcfcfc`
- **Fonts** — Ubuntu Mono for `headline-lg`, `display-lg`, `code-sm`,
  `label-md`; Ubuntu for `body-lg`, `body-md`. Drop the dead
  "JetBrains Mono"/"Inter" entries.
- **Spacing** — `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 48px`,
  `gutter: 20px`, `margin-desktop: 80px`. (Adds `xs` and `margin-desktop`,
  both already used but never defined.)

### 2. All 4 HTML pages

Replace the inline `<script id="tailwind-config">...</script>` block with
`<script src="theme.js"></script>`.

Unify the Material Symbols icon link to the `@20..48` variable-font variant on
all pages (index/experience currently use the fixed `@24,400` variant).

### 3. No other changes

Page content, layout, and `main.js` logic are untouched.

## Result

`text-primary`, `bg-surface-container`, `p-md` (used by `main.js` palette and
projects/contact) resolve to the same values on every page; literal
`slate-*`/`orange-*` classes already match. Headers, cards, and the command
palette render identically across the site.

## Verification

- Load all 4 pages in a browser; confirm no console errors.
- Spot-check token styling that was previously undefined:
  `bg-surface-container-low`, `px-margin-desktop`, `text-on-primary`,
  `border-surface-variant`.
- Confirm the command palette (Cmd+K) renders identically on all 4 pages.

## Out of scope

- Migrating to a single class convention (literal vs. token). Both remain, but
  now share identical values.
- Dark mode.
- Any change to page content or component logic.
