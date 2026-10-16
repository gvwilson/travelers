# Before

No source files exist. The project has `README.md`, `PLAN.md`, and build/lint
config, but no `index.html` or `src/`. KAPLAY is not yet wired up, so nothing
runs in the browser. This is roadmap item 1 from `PLAN.md`.

# After

Create the minimal static-site scaffold that boots KAPLAY:

- `index.html` — a single HTML page that loads `src/main.js` as an ES module
  (no build step, per the README).
- `src/main.js` — imports KAPLAY from the pinned CDN (matching `../humans`) and
  initializes a blank canvas via `kaplay({...})`.

*Done when:* the page opens showing a blank canvas with no console errors.
