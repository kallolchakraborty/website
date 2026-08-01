# Site-wide Reveal & Micro-interaction Animation System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the janky timeline animation with a single optimized site-wide `.reveal` system (opacity + transform, one IntersectionObserver) and add CSS-only hover micro-interactions across the portfolio.

**Architecture:** One IntersectionObserver in `main.js` observes every `.reveal` element, flips it to `.revealed` once (then unobserves). CSS in `styles.css` owns all animation. Graceful fallback: if IntersectionObserver is missing or `prefers-reduced-motion` is set, everything is revealed immediately. Hover effects are pure CSS, gated by `prefers-reduced-motion`.

**Tech Stack:** Vanilla JS (no deps), Tailwind CSS, Python static generator (`build.py`). No new libraries.

## Global Constraints

- Only animate `opacity` and `transform` (GPU-friendly). No layout-triggering properties.
- Never leave `.reveal` content invisible: reduced-motion + no-IO fallbacks MUST reveal everything.
- `.reveal` default hidden state comes from CSS ONLY (no Tailwind `opacity-0` classes added to HTML). This fixes the "invisible if JS fails" risk — the fallback adds `.revealed`.
- Files edited only in `main.js`, `styles.css`, and `src/*.page.html`. Built artifacts (`*.html` at root, `static/site.css`) are regenerated via `npm run build`, never hand-edited.
- Commit after each task, including built artifacts.

---

### Task 1: Add reveal CSS to `styles.css`

**Files:**
- Modify: `styles.css` (append reveal block; remove old timeline `will-change`)

**Interfaces:**
- Produces: `.reveal`, `.reveal.revealed`, reduced-motion guard. Consumed by Task 3 (HTML classes) and Task 2 (JS toggling `.revealed`).

- [ ] **Step 1: Append the reveal CSS block**

Add to the end of `styles.css`:

```css
/* Site-wide Reveal Scroll Animation (opacity + transform only) */
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

/* Stagger: timeline items + project cards */
.reveal-stagger > *:nth-child(1) { transition-delay: 0s; }
.reveal-stagger > *:nth-child(2) { transition-delay: 0.05s; }
.reveal-stagger > *:nth-child(3) { transition-delay: 0.1s; }
.reveal-stagger > *:nth-child(4) { transition-delay: 0.15s; }
.reveal-stagger > *:nth-child(5) { transition-delay: 0.2s; }
.reveal-stagger > *:nth-child(6) { transition-delay: 0.25s; }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal.revealed {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Remove the old timeline `will-change` + delays**

Replace lines 325–334 of `styles.css` (currently):

```css
/* Timeline Scroll-Reveal Animation */.timeline-item {
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.timeline-item:nth-child(2) { transition-delay: 0.08s; }
.timeline-item:nth-child(3) { transition-delay: 0.16s; }
.timeline-item:nth-child(4) { transition-delay: 0.24s; }
.timeline-item:nth-child(5) { transition-delay: 0.32s; }
.timeline-item:nth-child(6) { transition-delay: 0.4s; }
```

with:

```css
/* Timeline items use the shared .reveal system (see .reveal above) */
```

- [ ] **Step 3: Verify**

Run: `grep -n "will-change" styles.css`
Expected: the only `will-change` occurrences are inside the `.reveal` block (`will-change: opacity, transform` and `will-change: auto`).

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: add site-wide reveal animation CSS, drop permanent timeline will-change"
```

---

### Task 2: Replace `initTerminalAnimations` with `initRevealAnimations` in `main.js`

**Files:**
- Modify: `main.js:8` (inits list) and `main.js:380-395` (function body)

**Interfaces:**
- Consumes: `.reveal` / `.revealed` classes from Task 1.
- Produces: `initRevealAnimations()` — adds `.revealed` to all `.reveal` in view; immediate reveal fallback. Consumed by the `inits` array at page load.

- [ ] **Step 1: Register the new init**

In `main.js`, the `inits` array at line 4–11 currently lists `initTerminalAnimations`. Change it to `initRevealAnimations`:

```js
  const inits = [
    initNavigationHighlighting,
    initCommandPalette,
    initMobileMenu,
    initWebGLShaderBackground,
    initRevealAnimations,
    initBackToTop
  ];
```

- [ ] **Step 2: Replace the function body**

Replace lines 380–395 (the entire `initTerminalAnimations` function) with:

```js
// 4. Reveal Scroll Animations (single observer, GPU-friendly, reduced-motion aware)
function initRevealAnimations() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const revealAll = () => els.forEach(el => el.classList.add('revealed'));
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof IntersectionObserver === 'undefined' || reducedMotion) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('revealed');
      observer.unobserve(el);
      el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; }, { once: true });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}
```

- [ ] **Step 3: Verify no stale references**

Run: `grep -n "initTerminalAnimations\|initRevealAnimations" main.js`
Expected: `initRevealAnimations` appears 2× (inits array + function name); `initTerminalAnimations` appears 0×.

- [ ] **Step 4: Commit**

```bash
git add main.js
git commit -m "feat: single optimized reveal observer with reduced-motion fallback"
```

---

### Task 3: Add `reveal` classes to HTML (experience + projects)

**Files:**
- Modify: `src/experience.page.html` (6 timeline items, 7 cert-items, 1 faang-card)
- Modify: `src/projects.page.html` (14 project cards — the 15th `project-card-item` match is a JS `querySelectorAll` at line 502)

**Interfaces:**
- Consumes: `.reveal` CSS (Task 1). No output consumed by later tasks.

- [ ] **Step 1: Timeline items — swap `opacity-0 translate-y-8` for `reveal`**

In `src/experience.page.html`, replace all 6 occurrences of:

```html
<div class="relative group timeline-item opacity-0 translate-y-8">
```

with:

```html
<div class="relative group reveal">
```

(The `.reveal` CSS now provides the hidden start; the old Tailwind classes are removed so content never stays invisible if JS fails.)

- [ ] **Step 2: Timeline stagger — wrap items in a stagger container**

The 6 timeline items are siblings. Add `reveal-stagger` to their shared parent. Find the container that holds all 6 `.timeline-item` elements (a `<div>` or `<ol>` wrapping them in `src/experience.page.html`) and add `reveal-stagger` to its class list.

Verify: `grep -c "reveal-stagger" src/experience.page.html` → 1.

- [ ] **Step 3: cert-items — add `reveal` class**

In `src/experience.page.html`, all 7 `cert-item` anchors have class `cert-item group/cert ...`. Add `reveal` to each: change `class="cert-item` to `class="cert-item reveal`.

Verify: `grep -c 'cert-item reveal' src/experience.page.html` → 7.

- [ ] **Step 4: experience faang-card — add `reveal`**

The certifications sidebar card (`faang-card p-8 flex flex-col justify-between`) — add `reveal`. Verify: `grep -c "faang-card.*reveal\|faang-card" src/experience.page.html`.

- [ ] **Step 5: Project cards — add `reveal` + stagger**

In `src/projects.page.html`, all 14 cards start with `class="project-card-item ..."`. Change each to `class="project-card-item reveal ..."`. Then add `reveal-stagger` to the grid container that holds them.

Verify: `grep -c "project-card-item reveal" src/projects.page.html` → 14, and `grep -c "reveal-stagger" src/projects.page.html` → 1.

- [ ] **Step 6: Commit**

```bash
git add src/experience.page.html src/projects.page.html
git commit -m "feat: add reveal classes to timeline, certs, and project cards"
```

---

### Task 4: Add `reveal` classes to remaining pages (index, contact, project detail pages, recommendations)

**Files:**
- Modify: `src/index.page.html` (5 faang-cards, 7 cert-items)
- Modify: `src/contact.page.html` (contact method cards)
- Modify: `src/chhanda-ai.page.html` (9), `src/ai-colab-server.page.html` (7), `src/lgit.page.html` (9), `src/effort-planner.page.html` (4), `src/free-chess.page.html` (2), `src/health-simulator.page.html` (9) — add `reveal` to each `faang-card`
- Modify: `src/recommendations.page.html` (26 grid cards)

**Interfaces:**
- Consumes: `.reveal` CSS (Task 1). No output consumed by later tasks.

- [ ] **Step 1: index faang-cards**

In `src/index.page.html`, change all `class="faang-card` to `class="faang-card reveal`. Verify: `grep -c "faang-card reveal" src/index.page.html` → 5.

- [ ] **Step 2: index cert-items**

In `src/index.page.html`, change all `class="cert-item` to `class="cert-item reveal`. Verify: `grep -c "cert-item reveal" src/index.page.html` → 7.

- [ ] **Step 3: project detail pages**

For each of `chhanda-ai`, `ai-colab-server`, `lgit`, `effort-planner`, `free-chess`, `health-simulator`: change every `class="faang-card` to `class="faang-card reveal`.

Verify per page: `grep -c "faang-card reveal" src/<page>.page.html` matches counts: chhanda-ai 9, ai-colab-server 7, lgit 9, effort-planner 4, free-chess 2, health-simulator 9.

- [ ] **Step 4: contact page cards**

`src/contact.page.html` uses `bg-surface-container-low` cards (the GitHub/LinkedIn/SAP/email/phone endpoint cards). Find the contact-method anchor/card elements and add `reveal` to each. Verify: `grep -c " reveal" src/contact.page.html` > 0 and each card has it.

- [ ] **Step 5: recommendation cards**

In `src/recommendations.page.html`, the 26 cards start with `class="bg-surface border border-surface-container-highest p-lg hover-terminal-shadow transition-all flex flex-col justify-between"`. Add `reveal` to each. Verify: `grep -c 'hover-terminal-shadow transition-all flex flex-col justify-between reveal' src/recommendations.page.html` → 26.

- [ ] **Step 6: Commit**

```bash
git add src/index.page.html src/contact.page.html src/chhanda-ai.page.html src/ai-colab-server.page.html src/lgit.page.html src/effort-planner.page.html src/free-chess.page.html src/health-simulator.page.html src/recommendations.page.html
git commit -m "feat: add reveal classes to index, contact, project detail, and recommendation cards"
```

---

### Task 5: Hover micro-interactions (CSS-only)

**Files:**
- Modify: `styles.css` (append hover block)

**Interfaces:**
- Consumes: existing component classes (`faang-card`, `cert-item`, `project-card-item`, `.icon`). No JS changes.

- [ ] **Step 1: Append hover micro-interaction CSS**

Append to `styles.css`:

```css
/* Hover micro-interactions */
button, .btn, a[href] { -webkit-tap-highlight-color: transparent; }
button:active, .btn:active { transform: scale(0.98); }

.faang-card:hover { border-color: rgb(var(--primary) / 0.45); }

.project-card-item .icon-arrow { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.project-card-item:hover .icon-arrow { transform: translateX(4px); }

.cert-item .icon { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.cert-item:hover .icon { transform: translateX(3px); }

.timeline-item:hover { transform: translateX(4px); }

.timeline-dot { position: relative; }
.timeline-dot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  border: 2px solid rgb(var(--primary) / 0.4);
  opacity: 0;
  animation: none;
}
.timeline-item:hover .timeline-dot::after { animation: timeline-pulse 1.2s ease-out infinite; }

@keyframes timeline-pulse {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  button:active, .btn:active { transform: none; }
  .project-card-item:hover .icon-arrow,
  .cert-item:hover .icon,
  .timeline-item:hover { transform: none; }
  .timeline-item:hover .timeline-dot::after { animation: none; }
}
```

- [ ] **Step 2: Verify reduced-motion + no layout thrash**

Run: `grep -c "prefers-reduced-motion" styles.css`
Expected: ≥ 4 (the reveal block, the hover block, plus the existing global reduce block at line ~248).

Run: `grep -c "timeline-dot" src/experience.page.html`
Expected: ≥ 6 (each timeline item should have a dot element with class `timeline-dot`; if the existing markup uses a different class name, add `timeline-dot` to it — the pulse targets `.timeline-dot`).

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add CSS-only hover micro-interactions with reduced-motion guards"
```

---

### Task 6: Build, verify, commit built artifacts

**Files:**
- Regenerate: all root `*.html`, `static/site.css`, `static/search-index.json`, `sitemap.xml`

**Interfaces:**
- Consumes: all Tasks 1–5 source changes. Produces: deployed artifacts.

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: `built <page>.html` lines for all 12 pages + `wrote sitemap.xml` + `wrote static/search-index.json` + tailwind "Done in".

- [ ] **Step 2: Verify reveal wired into built files**

Run: `grep -c 'class="relative group reveal"' experience.html` → 6.
Run: `grep -c 'project-card-item reveal' projects.html` → 15.
Run: `grep -c 'bg-surface border border-surface-container-highest p-lg hover-terminal-shadow transition-all flex flex-col justify-between reveal' recommendations.html` → 26.
Run: `grep -c '.reveal{' static/site.css` → 1 (minified CSS keeps `.reveal{`).

- [ ] **Step 3: Headless browser verification**

Run a headless Chrome check (existing pattern — puppeteer-core against the local file) verifying:
- `.reveal` elements within the viewport gain `.revealed` after scroll.
- With `page.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}])`, all `.reveal` are `.revealed` immediately and `getComputedStyle(el).transitionDuration` is `0s`.
- `console` captures zero errors.
- No element remains `opacity: 0` after scrolling through the page.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "build: regenerate site with reveal animations"
git push
```
