# Portfolio Site Hardening — Design

Date: 2026-08-01

## Problem

A FAANG architect review found the site is unshippable and unmaintainable:

- **Nothing is committed** — branch has zero commits, no remote, no Pages workflow.
- **Broken resume command** — `main.js` opens `#resume`, but no resume file exists.
- **Undefined Tailwind classes silently ignored** — `bg-error`, `bg-tertiary`,
  `text-outline-variant`, `hover-terminal-shadow` render nothing.
- **10× duplicated shell** — header/nav/mobile-menu/footer/command-palette and a
  27-line inline theme-toggle script are copy-pasted on every page.
- **Tailwind CDN in production** — in-browser JIT (~100KB+ JS, FOUC).
- **Fonts loaded twice** — `@import` in `styles.css` plus a `<link>` per page.
- **No share/SEO layer** — no favicon, OG/Twitter meta, JSON-LD, sitemap, robots.
- **Fake contact form** — simulates "Ack: 200 OK", never sends.
- **Fake heatmap** — `Math.random()` presented as commit counts.
- **WebGL/Three.js ignore `prefers-reduced-motion`** and run forever.

## Decision

Harden the site in five phases, in order:

### Phase 0 — Ship it
1. Commit everything (zero commits exist today).
2. Copy `Downloads/Resume-Of-Kallol-Chakraborty V22_260114_200547.pdf` →
   `assets/resume.pdf`; point the resume command at it.
3. Create GitHub repo via `gh repo create`; push; add `.github/workflows/deploy.yml`
   (Pages deploy on push to main); enable Pages via `gh`.
4. Add missing tokens (`error` = red, `tertiary` = green, `outline-variant` =
   slate-500) to `theme.js` + CSS vars; define `.hover-terminal-shadow` using the
   existing `--shadow-terminal` var.

### Phase 1 — Build system (DRY)
A stdlib-only `build.py` assembles pages from shared partials so the shell is
defined once, not 10 times.

- `partials/` — `head.html`, `header.html`, `mobile-menu.html`, `footer.html`,
  `dialog.html`.
- `src/*.page.html` — pages with placeholder tokens; `src/pages.json` carries
  per-page data (title, description, canonical, active nav, dialog variant).
- `build.py` renders pages to root `*.html` (committed output).
- The inline theme-toggle script merges into `theme.js`.
- Output is diff-checked against the current pages before switching over.

### Phase 2 — Precompiled CSS
- Tailwind v3 as a devDependency; `tailwind.config.js` derived from `theme.js`;
  content globs include `main.js` (runtime-generated classes).
- Build `static/site.css`; remove the CDN script and runtime `theme.js` from pages.
- Font `preconnect` for Google Fonts; `preload` the hero image on index.
- Drop the duplicate font `@import` in `styles.css`.

### Phase 3 — Trust & share
- Contact form wired to Formspree via `fetch`, with honest success/error states
  and a `mailto:` fallback.
- Favicon (inline SVG), OG/Twitter meta, JSON-LD `Person` on index, `sitemap.xml`,
  `robots.txt`. All added once in the head partial.

### Phase 4 — Polish
- Heatmap: remove fabricated commit-count tooltips; label as illustrative.
- Gate WebGL ambient shader and Three.js scene on `prefers-reduced-motion`; pause
  the ambient shader when offscreen (IntersectionObserver).
- Remove dead CSS (`.badge-pill` typo, unused vars).
- Self-host the four company logos into `assets/` (drop Wikimedia hotlinks,
  replace `bg-white` boxes with theme-aware `bg-surface`).
- Unify the Free Chess card link with the other project cards.

## Verification

- `./build.py` runs clean; Phase 1 output renders identically to current pages.
- Headless puppeteer pass on all 10 pages: no console errors, no 404s, theme
  toggle works, nav highlights, command palette and contact form interact,
  favicon/sitemap/robots resolve.
- Phase 2: visual parity in light and dark against the CDN version.

## Out of scope

- Migrating index/experience to the semantic token convention (values already
  match; drift is prevented by the build system).
- Real analytics, CMS, or server-side rendering.
