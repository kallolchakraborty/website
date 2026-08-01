# Kallol Chakraborty — Personal Portfolio Website

A high-performance, accessible, SEO-optimized personal portfolio site built as a static site generator + Tailwind CSS, deployed to GitHub Pages. Features a terminal-inspired dark/light theme system, 14 pages, WebGL ambient background, command palette search, and 26 LinkedIn recommendations with avatars.

**Live:** https://kallolchakraborty.github.io/website/
**Repository:** https://github.com/kallolchakraborty/website

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Build System](#build-system)
4. [Design System](#design-system)
5. [Pages & Content](#pages--content)
6. [Partial Templates](#partial-templates)
7. [JavaScript Features](#javascript-features)
8. [Theme System](#theme-system)
9. [Deployment](#deployment)
10. [Recommendations System](#recommendations-system)
11. [Assets & Avatars](#assets--avatars)
12. [SEO & Schema.org](#seo--schemaorg)
13. [Accessibility](#accessibility)
14. [Performance](#performance)
15. [Development Workflow](#development-workflow)
16. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATIC SITE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/                    partials/                              │
│  ├── *.page.html         ├── head.html      (DOCTYPE + <head>) │
│  ├── pages.json          ├── header.html    (nav, mobile menu) │
│  └── (content)           ├── footer.html    (footer + scripts) │
│                          └── dialog.html    (command palette)  │
│                          └── icons.svg       (SVG sprite)      │
│                                                                 │
│         ▼                    ▼                    ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              build.py (Python static generator)          │   │
│  │  • Template replacement: {{head}} {{header}} {{footer}}  │   │
│  │  • SEO: title, description, og:* tags from pages.json   │   │
│  │  • Search index generation → static/search-index.json   │   │
│  │  • Sitemap.xml generation                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ROOT/*.html (built pages, committed to git)             │   │
│  │  static/site.css (Tailwind + custom styles.css)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GitHub Pages (github.io/website/)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key principles:**
- Zero runtime framework — pure HTML/CSS/JS
- Source of truth: `src/*.page.html` + `partials/`
- Built output (`*.html` at root + `static/site.css`) committed to git
- GitHub Actions deploy on push to `main`

---

## Directory Structure

```
kallol-website-github-pages/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deploy (build + deploy)
├── assets/                      # Static assets (committed)
│   ├── avatars/                 # 26 recommender avatars (JPG, 100×100)
│   ├── favicon.svg
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   ├── og-card.png              # Open Graph social card (1200×630)
│   ├── neural-core.webp         # Hero preload image
│   └── resume.pdf
├── partials/                    # Reusable HTML fragments
│   ├── head.html                # <head> with SEO, theme script, fonts
│   ├── header.html              # Fixed header, nav, command palette trigger
│   ├── footer.html              # Footer, back-to-top, main.js include
│   ├── dialog.html              # Command palette <dialog> markup
│   └── icons.svg                # Material Symbols sprite (20+ icons)
├── src/                         # Page content source
│   ├── pages.json               # Page registry (title, description, extra_head)
│   ├── index.page.html          # Home page
│   ├── experience.page.html     # Career timeline + certifications
│   ├── projects.page.html       # Featured products & enterprise solutions
│   ├── contact.page.html        # Contact form + endpoints
│   ├── recommendations.page.html# 26 LinkedIn recs with avatars
│   ├── chhanda-ai.page.html     # Project detail pages (7x)
│   ├── ai-colab-server.page.html
│   ├── lgit.page.html
│   ├── health-simulator.page.html
│   ├── effort-planner.page.html
│   ├── free-chess.page.html
│   ├── 404.page.html            # Terminal-style 404
│   └── (other .page.html)
├── static/                      # Built/compiled assets
│   ├── input.css                # Tailwind entry (@tailwind base/components/utilities)
│   ├── site.css                 # Built + minified (committed)
│   └── search-index.json        # Auto-generated search index
├── *.html                       # Built pages at root (committed, deployed)
├── build.py                     # Static site generator (Python)
├── main.js                      # All client-side JS (theme, palette, shader, etc.)
├── styles.css                   # Design tokens + custom components (appended to site.css)
├── tailwind.config.js           # Tailwind config (colors, fonts, spacing)
├── package.json                 # npm scripts, tailwindcss dep
└── sitemap.xml                  # Auto-generated
```

---

## Build System

### `npm run build`

```bash
python3 build.py && tailwindcss -i ./static/input.css -o ./static/site.css --minify && cat styles.css >> static/site.css
```

**Three stages:**

1. **`python3 build.py`** — Static generator:
   - Reads `src/pages.json` for page registry
   - For each page: loads `src/<name>.page.html`
   - Replaces `{{head}}`, `{{header}}`, `{{footer}}`, `{{dialog}}` with partials
   - Injects `{{title}}`, `{{description}}`, `{{og_url}}`, `{{extra_head}}` from pages.json
   - Inserts `icons.svg` after `<body>` tag
   - Writes `ROOT/<name>.html`
   - Extracts search terms (title, h1-h3, first p) → `static/search-index.json`
   - Generates `sitemap.xml` with all URLs

2. **`tailwindcss -i ./static/input.css -o ./static/site.css --minify`** — Compiles Tailwind utilities used in source HTML + `main.js` + `partials/` into minified CSS

3. **`cat styles.css >> static/site.css`** — Appends custom design tokens, components, animations from `styles.css`

### Output Files (committed to git)

| File | Purpose |
|------|---------|
| `index.html`, `experience.html`, ... | Built pages at root (14 total) |
| `static/site.css` | Complete minified stylesheet (Tailwind + custom) |
| `static/search-index.json` | Search index for command palette |
| `sitemap.xml` | Sitemap for SEO |

---

## Design System

### Color System (CSS Variables + Tailwind)

All colors defined as RGB triplets in `styles.css` (`:root` + `.dark`), consumed by Tailwind via `rgb(var(--token) / <alpha-value>)`.

**Light theme tokens:**
```css
--bg: 252 252 252;
--surface: 255 255 255;
--surface-container: 248 250 252;
--surface-container-low: 241 245 249;
--surface-container-high: 241 245 249;
--surface-container-highest: 226 232 240;
--surface-variant: 226 232 240;
--on-surface: 15 23 42;
--on-surface-variant: 71 85 105;
--primary: 234 88 12;        /* Orange #ea580c */
--on-primary: 255 255 255;
--secondary: 124 58 237;     /* Purple #7c3aed */
--error: 220 38 38;
--tertiary: 5 150 105;       /* Emerald #059669 */
--outline-variant: 148 163 184;
```

**Dark theme** (`.dark`): inverted surfaces, `#0f172a` bg, `#fb923c` primary.

**Semantic Tailwind classes:** `bg-background`, `bg-surface`, `text-on-surface`, `border-primary/20`, `hover:bg-primary/10`, etc.

### Typography

| Class | Font | Use |
|-------|------|-----|
| `font-headline-lg`, `font-display-lg`, `font-code-sm` | Ubuntu Mono (monospace) | Terminal/command text, headings |
| `font-body-lg`, `font-body-md` | Ubuntu (sans) | Body copy, UI text |

Loaded via Google Fonts preconnect in `head.html`.

### Spacing Scale (Tailwind)

```js
'xs': '4px', 'sm': '8px', 'md': '12px', 'lg': '20px', 'xl': '32px',
'gutter': '16px', 'margin-desktop': '64px'
```

### Key Component Classes (from `styles.css`)

| Class | Purpose |
|-------|---------|
| `.header-glass` | Blurred sticky header with border |
| `.glass-panel-faang` | Elevated glass cards with hover lift |
| `.faang-card` | Standard content card with hover elevation |
| `.badge-pill` | Orange accent pill badges |
| `.hover-terminal-shadow` | Terminal-style 6px hard shadow on hover |
| `.kbd` | Keyboard hint chips |
| `.skip-link` | Accessibility skip-to-content link |
| `.shimmer-btn` | Animated gradient button |
| `.hover-terminal-shadow:hover` | `transform: translate(-3px, -3px); box-shadow: 6px 6px 0 orange` |

### Icon System

Material Symbols subset baked into `partials/icons.svg` as `<symbol id="i-*">`. Used via:
```html
<svg class="icon" aria-hidden="true"><use href="#i-terminal"/></svg>
```
**Available icons:** `i-terminal`, `i-search`, `i-dark_mode`, `i-light_mode`, `i-menu`, `i-close`, `i-verified`, `i-workspace_premium`, `i-open_in_new`, `i-arrow_forward`, `i-verified`, `i-verified`, etc. (20+ total)

---

## Pages & Content

### Page Registry (`src/pages.json`)

Each entry: `name`, `title`, `description`, `extra_head` (for JSON-LD, preloads, etc.).

| Page | URL | Description |
|------|-----|-------------|
| index | `/` | Home: hero, certifications banner, top skills |
| experience | `/experience.html` | Timeline (Wipro, Capgemini, IBM, TCS), 7× SAP certs sidebar |
| projects | `/projects.html` | 6 featured project cards with architecture diagrams |
| recommendations | `/recommendations.html` | **26 LinkedIn recommendations** with avatars, filter tabs |
| contact | `/contact.html` | Contact form, email, GitHub, LinkedIn, resume |
| chhanda-ai | `/chhanda-ai.html` | Local Android LLM/RAG (Kotlin, Gemma, LiteRT) |
| ai-colab-server | `/ai-colab-server.html` | Centralized semantic DAG sync server |
| lgit | `/lgit.html` | llm-git — semantic source control for AI era |
| health-simulator | `/health-simulator.html` | ICU vital signs simulator (FastAPI + Canvas) |
| effort-planner | `/effort-planner.html` | Calendar/resource planner (FullCalendar.js) |
| free-chess | `/free-chess.html` | Open-source chess app |
| 404 | `/404.html` | Terminal-style 404 with blinking cursor |

### Content Editing

- **Source:** Edit `src/<name>.page.html`
- **Metadata:** Edit `src/pages.json`
- **Rebuild:** `npm run build` → commit `*.html` + `static/site.css` → push

---

## Partial Templates

### `partials/head.html`
- DOCTYPE, viewport, SEO meta, Open Graph, Twitter cards
- Theme toggle script (localStorage + prefers-color-scheme)
- Google Fonts preconnect (Ubuntu + Ubuntu Mono)
- `{{extra_head}}` injection point for page-specific JSON-LD, preloads
- Favicon set (SVG, PNG 16/32, Apple touch icon)

### `partials/header.html`
- Skip-to-content link
- Fixed header (`z-50`), glassmorphism blur
- Logo + name (terminal icon)
- Desktop nav (`md:flex`) + mobile menu (`md:hidden`, fixed overlay)
- Command palette trigger (`⌘K`)
- Theme toggle (sun/moon icon swap)
- Mobile menu toggle (hamburger)

### `partials/footer.html`
- Status indicator + "Available for consulting"
- GitHub / LinkedIn / Contact links
- Copyright
- Back-to-top button (appears after 400px scroll)
- Loads `main.js`

### `partials/dialog.html`
- `<dialog id="command-palette">` with search input, results container, keyboard hints
- Native `<dialog>` with `::backdrop` blur, discrete transition animation

### `partials/icons.svg`
- 20+ Material Symbols as `<symbol id="i-*">`
- Used via `<use href="#i-icon_name"/>`
- `class="icon"` sets `width: 1em; height: 1em; fill: currentColor;`

---

## JavaScript Features (`main.js`)

All client-side logic in single `main.js` (no modules, loads via `<script src="main.js">` in footer).

| Feature | Function | Details |
|---------|----------|---------|
| **Navigation Highlighting** | `initNavigationHighlighting()` | Matches current path to nav links (`data-path`), adds `text-primary font-bold` |
| **Command Palette** | `initCommandPalette()` | `⌘K`/`Ctrl+K` opens `<dialog>`, fuzzy search over `static/search-index.json`, keyboard nav (↑/↓/Enter), sections: Navigation, Actions, Search Results |
| **Mobile Menu** | `initMobileMenu()` | Hamburger toggle, ESC close, link click close |
| **WebGL Ambient Shader** | `initWebGLShaderBackground()` | Canvas `#shader-canvas-ambient` fixed inset, animated orange pulse gradient. **Disabled on mobile** (`innerWidth < 768`) and `prefers-reduced-motion`. IntersectionObserver pauses when off-screen. |
| **Terminal Animations** | `initTerminalAnimations()` | IntersectionObserver reveals `.project-card`, `.timeline-item`, `.reveal-on-scroll` with `opacity-0 translate-y-8 → opacity-100 translate-y-0` |
| **Back to Top** | `initBackToTop()` | Fixed button (bottom-right), shows after 400px scroll, smooth scroll to top |

### Command Palette Commands (hardcoded in `main.js`)

```js
[
  { section: 'nav', name: '/home', action: → index.html },
  { section: 'nav', name: '/experience', action: → experience.html },
  { section: 'nav', name: '/projects', action: → projects.html },
  { section: 'nav', name: '/contact', action: → contact.html },
  { section: 'actions', name: 'download resume', action: → assets/resume.pdf },
  { section: 'actions', name: 'copy email', action: → clipboard },
  { section: 'actions', name: 'github', action: → github.com/kallolchakraborty },
  { section: 'actions', name: 'linkedin', action: → linkedin.com/in/kallol-chakraborty-9728a699 },
]
+ dynamic search results from static/search-index.json
```

---

## Theme System

**CSS Variables** in `styles.css` define both light (`:root`) and dark (`.dark`) token sets.

**Persistence:** `localStorage.setItem('theme', 'dark'/'light')`

**Initialization (inline in `head.html`):**
1. Read `localStorage.theme`
2. If none, check `prefers-color-scheme: dark`
3. Apply `.dark` to `<html>` before paint (no flash)
4. Theme toggle button updates icon (`i-dark_mode` ↔ `i-light_mode`) and `aria-label`

**Tailwind usage:** `dark:` prefix works because `darkMode: 'class'` in `tailwind.config.js`.

---

## Deployment

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .  # root has built *.html + static/
```

**Deploys to:** `https://kallolchakraborty.github.io/website/`

**Branch:** `gh-pages` (managed by action)

**Custom domain:** None (uses GitHub Pages subpath)

---

## Recommendations System

### Source Data

26 LinkedIn recommendations extracted from PDF (`assets/linkedin-recommendations.pdf`) using:
- `pypdf` for text extraction
- `pdfminer.six` for image position analysis
- `Pillow` for image validation (stddev check to filter placeholder initials)

### Avatar Extraction Process

1. PDF pages 2–5: doc-order alignment between pypdf image names (X26…X181) and pdfminer positions
2. Page 1 & 6: manual mapping
3. All 26 validated 100×100 RGB JPEG, stddev check on Subhamoy_Ghosh confirmed real photo
4. Source of truth: `/tmp/li_final/` → copied to `assets/avatars/` (~176 KB total)

### Avatar Files (`assets/avatars/`)

| Filename | Recommender |
|----------|-------------|
| Lav_Mishra.jpg | Lav Mishra |
| Deepak_Maheshwari.jpg | Deepak Maheshwari |
| Aniruddha_Bhowmick.jpg | Aniruddha Bhowmick |
| Samannaya_Roy.jpg | Samannaya Roy |
| Arpita_Karmakar.jpg | Dr. Arpita Karmakar |
| Anindita_Guha_Thakurta.jpg | Anindita Guha Thakurta |
| Arindam_Das.jpg | Arindam Das |
| Ankush_Chakraborty.jpg | Ankush Chakraborty |
| Dipak_Nandeshwar.jpg | Dipak Nandeshwar |
| Subhasis_Chandra.jpg | Subhasis Chandra |
| Amit_Gupta.jpg | Amit Gupta |
| Abhinandan_DAS.jpg | Abhinandan DAS |
| Subhamoy_Ghosh.jpg | Subhamoy Ghosh |
| Suman_Das.jpg | Suman Das |
| Sitesh_Behera.jpg | Sitesh Behera |
| Sabyasachi_Roy.jpg | Sabyasachi Roy |
| Pramod_Kumar.jpg | Pramod Kumar |
| Subhajit_Das.jpg | Subhajit Das |
| Debajyoti_Saha.jpg | Debajyoti Saha |
| Arindam_Mukherjee.jpg | Arindam Mukherjee |
| Tanmoy_Das.jpg | Tanmoy Das |
| Ankit_Kumar.jpg | Ankit Kumar |
| Rupak_Kumar.jpg | Rupak Kumar |
| Sanjib_Das.jpg | Sanjib Das |
| Debasish_Mondal.jpg | Debasish Mondal |
| Souvik_Mondal.jpg | Souvik Mondal |

### Frontend Implementation (`src/recommendations.page.html`)

- **Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg`
- **Cards:** `flex flex-col justify-between` — equal height per row, footer anchored at bottom
- **Avatar:** `<img src="assets/avatars/<Name>.jpg" width="40" height="40" class="w-10 h-10 rounded-full object-cover border border-primary/20" loading="lazy">`
- **Filter tabs:** All (26), Managers & Reports (5), Same Team (11), Senior Colleagues (4), Studied Together (3), Different Team (3)
- **Filter JS:** `data-category` on cards, buttons toggle `hidden` class

### Filter Logic (inline in page)

```js
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-primary', 'text-on-primary', 'border-primary'));
    btn.classList.add('active', 'bg-primary', 'text-on-primary', 'border-primary');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#recommendations-grid > div').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});
```

---

## Assets & Avatars

| Asset | Path | Purpose |
|-------|------|---------|
| Avatar photos | `assets/avatars/*.jpg` | 26 recommender photos (100×100) |
| Favicon SVG | `assets/favicon.svg` | Primary favicon |
| Favicon PNG | `assets/favicon-16.png`, `favicon-32.png` | Legacy favicons |
| Apple touch | `assets/apple-touch-icon.png` | iOS home screen |
| OG card | `assets/og-card.png` | Social sharing (1200×630) |
| Hero preload | `assets/neural-core.webp` | Preloaded in index `extra_head` |
| Resume | `assets/resume.pdf` | Downloadable via command palette |

**Adding new avatars:**
1. Add `<Name>.jpg` to `assets/avatars/`
2. Add `<img src="assets/avatars/<Name>.jpg" ...>` to card in `src/recommendations.page.html`
3. `npm run build` → commit → push

---

## SEO & Schema.org

### Per-Page (via `pages.json` `extra_head`)

- **Index:** Person schema with `sameAs` [GitHub, LinkedIn, Credly badge]
- **Others:** Title, description, OG tags from `pages.json`

### Global (in `head.html`)

- WebSite schema with SearchAction
- Canonical URLs: `https://kallolchakraborty.github.io/website/<page>.html`
- OG image: `assets/og-card.png` (1200×630)
- Twitter large image card
- robots: `index, follow, max-image-preview:large, max-snippet:-1`

### Sitemap

Auto-generated `sitemap.xml` with all 14 pages + root.

### Search Index

`static/search-index.json` — array of `{url, title, terms[]}` for command palette fuzzy search.

---

## Accessibility

| Feature | Implementation |
|---------|----------------|
| **Skip link** | `.skip-link` (focus-visible, top-left) |
| **Focus visible** | `:focus-visible { outline: 2px solid var(--primary-accent); }` |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables animations/transitions |
| **ARIA labels** | All icon buttons, dialog, nav, mobile menu |
| **Dialog** | Native `<dialog>` with `::backdrop`, `Esc` dismiss, focus trap |
| **Semantic HTML** | `<header>`, `<nav>`, `<main>`, `<footer>`, `<blockquote>`, `<dialog>` |
| **Color contrast** | Tailwind tokens meet WCAG AA in both themes |
| **Keyboard nav** | Command palette (↑/↓/Enter/Esc), tab order logical |

---

## Performance

| Metric | Strategy |
|--------|----------|
| **Zero JS framework** | Only 16 KB `main.js` (gzipped ~5 KB) |
| **CSS** | Tailwind purged to used utilities + minified; `styles.css` appended (~45 KB total gzipped) |
| **Fonts** | Google Fonts preconnect + `display=swap`; Ubuntu + Ubuntu Mono |
| **Images** | Avatars 100×100 JPEG, `loading="lazy"`, `width/height` attrs prevent CLS |
| **Hero preload** | `<link rel="preload" as="image" href="assets/neural-core.webp">` on index |
| **Shader** | Disabled on mobile (`innerWidth < 768`), paused off-screen (IntersectionObserver) |
| **Caching** | GitHub Pages serves with `Cache-Control: max-age=600`; static assets immutable |

---

## Development Workflow

### Prerequisites

- Python 3.8+
- Node.js 18+ (for Tailwind CLI)
- Git

### Local Development

```bash
# 1. Install deps
npm ci

# 2. Build
npm run build

# 3. Serve locally (any static server)
python3 -m http.server 8899
# → http://localhost:8899/
```

### Editing Content

| Change | Files to Edit |
|--------|---------------|
| Page content | `src/<name>.page.html` |
| Page title/description | `src/pages.json` |
| Navigation | `partials/header.html` |
| Footer | `partials/footer.html` |
| Global styles | `styles.css` |
| Tailwind config | `tailwind.config.js` |
| Client JS | `main.js` |
| New page | 1. Add `.page.html` to `src/` 2. Add entry to `pages.json` 3. `npm run build` |

### Adding a Recommendation

1. Add avatar JPG to `assets/avatars/<Name>.jpg`
2. Add card markup to `src/recommendations.page.html` (copy existing, update name, date, quote, skills, category)
3. Update filter counts in tab buttons (All count, category counts)
4. `npm run build` → commit → push

### Git Conventions

- **Branch:** `main` only (direct commits or PRs)
- **Built files committed:** `*.html` at root, `static/site.css`, `static/search-index.json`, `sitemap.xml`
- **Deploy trigger:** Push to `main` → GitHub Actions → `gh-pages` branch

---

## Troubleshooting

### Build Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: pypdf` | Missing Python deps | Not needed for build (only for avatar extraction) |
| `tailwindcss: command not found` | Node deps missing | `npm ci` |
| `File not found: partials/icons.svg` | Missing partial | Check `partials/` exists |
| `pages.json` parse error | Invalid JSON | Validate JSON syntax |

### Runtime Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Theme not persisting | localStorage blocked | Check browser privacy settings |
| Command palette not opening | `main.js` not loaded | Verify `<script src="main.js">` in footer |
| Shader not visible | Mobile viewport | Shader disabled < 768px by design |
| Mobile menu stuck | JS error | Check console; ensure `initMobileMenu` runs |
| Avatars broken | Wrong path | Use `assets/avatars/Name.jpg` (relative, not `/website/...`) |

### Avatar Issues

| Problem | Fix |
|---------|-----|
| 404 on avatar | Ensure file exists in `assets/avatars/`, filename matches `<img src>` exactly |
| Wrong avatar | Check mapping in `src/recommendations.page.html` |
| Blurry/distorted | Source must be 100×100; CSS `w-10 h-10 object-cover` handles display |

### Deployment Issues

| Problem | Fix |
|---------|-----|
| Changes not live | Wait 2-3 min for Actions; hard-refresh (bypasses 600s cache) |
| 404 on subpages | GitHub Pages serves from `gh-pages` branch; ensure action completed |
| Old CSS/JS cached | GitHub Pages `max-age=600`; add `?v=<hash>` or wait |

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/pages.json` | Page registry (title, desc, extra_head) |
| `build.py` | Static generator |
| `tailwind.config.js` | Tailwind theme (colors, fonts, spacing) |
| `styles.css` | Design tokens + custom components |
| `static/input.css` | Tailwind entry point |
| `main.js` | All client-side JS |
| `partials/head.html` | `<head>` template |
| `partials/header.html` | Header + nav |
| `partials/footer.html` | Footer + scripts |
| `partials/dialog.html` | Command palette |
| `partials/icons.svg` | Icon sprite |
| `src/recommendations.page.html` | Recommendations page (26 cards) |
| `assets/avatars/` | 26 avatar JPGs |

---

## Historical Fixes Log

| Commit | Date | Fix |
|--------|------|-----|
| `ce9a3e8` | 2026-08-01 | Reverted `items-start` on recommendations grid — equal-height rows restored |
| `754313f` | 2026-08-01 | Fixed recommendation card sizes (items-start) + replaced dead `people.sap.com` URLs with Credly badge |
| `39d179b` | 2026-08-01 | Fixed corrupted stats card opening div (`p-md">` stray text) |
| `55289c7` | 2026-08-01 | Removed LinkedIn profile links from recommendation cards (user request) |
| `b519bfc` | 2026-08-01 | Added 26 avatars + LinkedIn URLs to recommendations |
| `6aee044` | 2026-08-01 | Initial avatar extraction + wiring (introduced stats div corruption) |

---

## License

MIT License — Personal portfolio, feel free to adapt for your own use.

---

## Contact

**Kallol Chakraborty**
- Email: `kallol.a.chakraborty@gmail.com`
- LinkedIn: `linkedin.com/in/kallol-chakraborty-9728a699`
- GitHub: `github.com/kallolchakraborty`
- Credly (SAP certifications): `credly.com/badges/408b684c-9fc6-4f22-907c-c56c959aae10`

---

*Generated with ❤️ using a custom Python static generator + Tailwind CSS + zero-runtime JavaScript.*