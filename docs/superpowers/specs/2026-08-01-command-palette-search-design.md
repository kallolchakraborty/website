# Command Palette Professionalization & Content Search — Design

Date: 2026-08-01

## Problem

The Ctrl+K command palette is unpolished: substring filter, no keyboard
navigation, cramped `justify-between` rows (descriptions squeezed to
84–234px in a 576px dialog), and a gimmicky fake `status` command that alerts
fabricated system stats. The header search/theme buttons are misaligned
(search ~28px tall from `py-1.5`, theme toggle 36px).

## Decision

Rebuild the palette and add content search. Four changes, all committed
output (root pages + `static/site.css` are committed; `npm run build`
regenerates).

### 1. Palette behavior (main.js)

- Keyboard navigation: ArrowUp/ArrowDown move active row, Enter executes,
  Esc closes (dialog default).
- Grouped sections: `NAVIGATION` / `ACTIONS` / `SEARCH RESULTS`.
- Match highlighting: matched substring wrapped in `<mark>`.
- Honest commands: remove fake `status`; add copy-email, open GitHub, open
  LinkedIn, download resume, plus page navigation.
- Content search: fetch `static/search-index.json`, substring match on
  title/terms, open the page on Enter.

### 2. Palette layout (partials/dialog.html)

- Input header `h-14` with search icon, input, close button, bottom border.
- Result rows: icon + name left, description right with truncation; active
  row gets left accent bar + tinted background.
- Section headers as small-caps labels between groups.
- Footer hint: `↑↓ navigate · ↵ open · esc dismiss`.

### 3. Header layout (partials/header.html)

- Search button and theme toggle both `h-9` for aligned heights.
- Real `<kbd>⌘K</kbd>` chip in the search button; icon-only on small screens.
- Consistent `gap-3` across the controls group.

### 4. Content index (build.py)

- New build step: scan each rendered page, extract `<title>`, `h1`–`h3`
  headings, and first `<p>`; write `static/search-index.json` (one entry per
  page: `url`, `title`, `terms`).

## Approach vs. alternatives

Pre-built JSON index at build time — offline, instant, ~few KB. Rejected:
fetch-and-strip every page per query (slow, chatty) and Lunr/Fuse (new
dependency for a 10-page site).

## Verification

- Headless puppeteer on all 10 pages: no console errors.
- Palette: open via Cmd+K, type a query, ArrowUp/Down + Enter navigates,
  search results open the correct page, theme toggle still works.
- Header: search/theme/menu buttons aligned at `h-9`.
