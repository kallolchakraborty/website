# Design: Site-wide Reveal & Micro-interaction Animation System

**Date:** 2026-08-01
**Status:** Approved
**Related skill:** superpowers:brainstorming

## Problem

1. Timeline items animate with a permanent `will-change` (GPU layer held forever), a slow 0.7s easing, and delays up to 0.4s — feels floaty, not smooth.
2. `main.js` observes `.project-card` but the HTML uses `.project-card-item`, so the 15 project cards never animate at all.
3. Most content has no reveal at all: `faang-card` sections (7 pages), `cert-item` rows (experience + index), 26 recommendation cards.
4. If JS fails or IntersectionObserver is unsupported, timeline items stay `opacity-0` inline in the HTML — content becomes invisible.

## Goals

- Smooth, subtle, fast reveals site-wide (opacity + transform only, GPU-friendly).
- One optimized IntersectionObserver — no layout thrash, no permanent `will-change`.
- Respect `prefers-reduced-motion`.
- Never leave content invisible: graceful fallback when JS/IO unavailable.
- CSS-only hover micro-interactions (no JS).

## Design

### 1. Reveal system (`main.js`)

Replace `initTerminalAnimations()` with a single observer:

- One `IntersectionObserver` at `{ threshold: 0.12, rootMargin: '0px 0px -40px' }`.
- Targets: elements with class `.reveal`.
- On intersect: add `.revealed`, `unobserve`, then remove `will-change` style.
- Fallback: if `IntersectionObserver` missing OR `prefers-reduced-motion: reduce`, add `.revealed` to all `.reveal` immediately (no animation, no hidden content).

Keep the existing init dispatch pattern (`initRevealAnimations` added to the `inits` list in `DOMContentLoaded`).

### 2. CSS (`styles.css`)

```css
.reveal {
  opacity: 0;
  transform: translateY(18px);
  will-change: opacity, transform;
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.revealed {
  opacity: 1;
  transform: none;
  will-change: auto;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

Stagger for grouped items via `transition-delay`:
- Timeline items: `nth-child` 0.05s steps, capped ~0.3s.
- Remove the old permanent `will-change` on `.timeline-item` and its long delays.

### 3. HTML changes

Add class `reveal` to:
- 6 timeline items (`src/experience.page.html`)
- 15 project cards (`src/projects.page.html`)
- `faang-card` sections on 7 pages (index, experience, projects, contact, chhanda-ai, ai-colab-server, lgit, effort-planner, free-chess, health-simulator)
- `cert-item` rows (experience + index, 7 each)
- 26 recommendation cards (`src/recommendations.page.html`) — grid children

Where an element already carries `opacity-0 translate-y-8` (timeline), replace those Tailwind classes with `reveal` (the class provides the hidden start state).

### 4. Hover micro-interactions (`styles.css`, CSS-only)

- `.faang-card:hover` — existing lift; add primary border/glow (already present, keep).
- `.cert-item:hover` — keep arrow slide; add label `translate-x` and background tint.
- Project card link icon slide on hover.
- Timeline dot pulse (respects reduced-motion).
- Buttons: `active:scale-[0.98]` press effect.
- All gated by `@media (prefers-reduced-motion: reduce)` where they animate transforms.

### 5. Files touched

- `main.js`
- `styles.css`
- `src/*.page.html` (index, experience, projects, contact, chhanda-ai, ai-colab-server, lgit, effort-planner, free-chess, health-simulator)
- Rebuild → built `*.html`, `static/site.css` committed.
- `README.md` animation section updated if needed.

### 6. Testing / verification

- `npm run build` succeeds.
- Headless Chrome: `.reveal` elements inside viewport gain `.revealed`; nothing stays at `opacity: 0`; zero console errors.
- Emulate `prefers-reduced-motion: reduce` → all `.reveal` revealed immediately, no transitions.
- Disable IO (fallback path) → content visible.
- Desktop + mobile viewport sanity: timeline, project cards, certs, recommendation cards all reveal.

## Non-goals

- No scroll-linked animations (`animation-timeline`) — browser support too narrow.
- No new JS libraries.
- No page transitions/router.
