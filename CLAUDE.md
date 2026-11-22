# CLAUDE.md — Project Context for AI Sessions

## Project Purpose

Utility1 is a static finance calculator website. The goal is a collection of
practical, distraction-free calculators that work offline with no dependencies
beyond a browser and Chart.js loaded from a CDN.

## Tech Stack

- Plain HTML5, CSS3, vanilla JavaScript (ES2020+)
- Chart.js loaded via CDN (jsdelivr) — no npm, no build step
- Zero frameworks (no React, Vue, etc.)
- Zero server-side code
- The entire site runs by opening index.html in a browser

## Coding Conventions

- **Mobile-first responsive** — design for small screens first, use
  `min-width` media queries to enhance for larger screens.
- **Accessible semantic HTML** — use `<header>`, `<main>`, `<footer>`,
  `<section>`, `<label>`, proper heading hierarchy. Every input must have
  a visible, associated `<label>`.
- **BEM-style class names** — e.g. `.card`, `.card__title`, `.card--active`.
  Avoid deeply nested selectors; keep specificity low.
- **WCAG AA contrast** for all text/background combinations.
- **Visible focus states** — do not suppress `:focus` outlines.
- **No comments explaining what the code does** — only comment on non-obvious
  *why* (hidden constraints, workarounds, subtle invariants).
- **No frameworks, no build step** — if a suggestion requires npm install or
  a bundler, find a different approach.
- **Light/dark mode** via `prefers-color-scheme` + a manual toggle stored in
  `localStorage`. CSS custom properties (`--var-name`) for all colors.
- **System font stack** — no external font requests.
- **Debounce live inputs** at ~200 ms — don't recalculate on every keystroke.

## File Structure

```
/
├── index.html       # Compound interest calculator (first page)
├── style.css        # All styles
├── script.js        # DOM, validation, chart rendering
├── calc.js          # Pure calculation code (no DOM), loaded before script.js and require()d by tests
├── test/            # Node built-in tests: run `node --test` (no npm install needed)
├── .github/workflows/ci.yml
├── docs/screenshot.png
├── CLAUDE.md        # This file
├── README.md
├── LICENSE
└── .gitignore
```

Each future calculator gets its own HTML file (e.g. `simple-interest.html`)
and shares `style.css`. JS can stay in `script.js` or be split per-calculator.

## Roadmap — Next Calculators to Add

1. Simple Interest (`simple-interest.html`)
2. Loan / EMI (`loan-emi.html`)
3. Savings Goal (`savings-goal.html`)
4. Retirement / FIRE (`retirement.html`)
5. Debt Payoff — avalanche vs. snowball (`debt-payoff.html`)

## SEO Notes

- Each page needs a unique `<title>` and `<meta name="description">`.
- Use one `<h1>` per page (the calculator name).
- The "How it works" explainer below each calculator targets long-tail search.

## Known Constraints / Decisions

- No analytics or tracking scripts — privacy-first by default.
- No ads yet.
- Favicons and Open Graph images are placeholders until assets are designed.
- `og:url` is a placeholder until the site has a real domain.
