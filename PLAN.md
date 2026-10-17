# Implementation Plan — Travelers

"Travelers" looks like a tower defense game, but the goal is to help travelers
reach their destination rather than killing them. A lightweight browser-based
single-player game: the player spends points to build towers that support
travelers as they move along a one-way path from entry to exit.

## Engine

**KAPLAY** (formerly Kaboom.js), loaded via a **pinned CDN** for now — no
vendored copy in the repo (avoids committing a large opaque minified blob).
Bundling/packaging via npm + a bundler is deferred to a later step, per the
README.

KAPLAY covers everything needed now (game loop, input, grid rendering) and the
deferred needs later (sprites via `loadSprite()`, audio via `loadSound()` /
`loadMusic()`).

## Design assumptions

- **Grid-based, one-way path movement.** The map is a grid with a path one cell
  wide. Each path cell is *directed*: a traveler entering it leaves by exactly
  one next cell (or, at a *split*, one of several). The result is a directed
  acyclic graph (DAG) of path cells from entry cells to exit cells — no cycles,
  so a traveler always makes forward progress.
- **Continuous time.** Movement is real-time: `onUpdate` drives per-kind move
  intervals (each traveler kind has its own speed), as in `../humans`.
- **Centralized tuning.** All tunable values (speeds, energy costs, point
  values, tower costs, danger spawn rates) live in one `CONFIG` object, so
  playtesting tweaks are one-line edits.
- **Single HTML page** (`index.html`) loads all JavaScript files as ES modules;
  no bundler for now.
- **Rendering.** Circled characters for every entity; sound and graphics later.
- **File layout**, mirroring `../humans` but splitting the entity families:
  - `src/main.js` — game loop, rendering, input, scoring.
  - `src/map.js` — grid, cell types, map generation, pathfinding.
  - `src/actors.js` — `Traveler` base + five kinds.
  - `src/towers.js` — `Tower` base + hostel/engineer/guard/medical station.
  - `src/dangers.js` — `Danger` classes (mobile, static, status).
  - `src/config.js` — the central `CONFIG` object.

## Domain model

Letter glyphs are placeholders until graphics land.

### Travelers (5)

| kind | letter | uses energy | point value | notes |
| --- | --- | --- | --- | --- |
| Courier | `C` | no | 1 | fast (courier) |
| Merchant | `M` | yes | 2 | carries goods: worth more, but tires |
| Pilgrim | `P` | no | 1 | steady walker, baseline |
| Refugee | `R` | yes | 1 | fragile: expires quickly when out of energy |
| Tourist | `T` | no | 1 | slow, lingers |

### Towers (4, extensible)

The README names towers "for example" — the set is open-ended, not fixed.

| tower | letter | cost | effect |
| --- | --- | --- | --- |
| Engineer | `E` | 75 | dispatches workers to repair collapsed bridges / damaged roads |
| Guard | `G` | 60 | dispatches soldiers to fend off bandits / wild animals |
| Hostel | `H` | 50 | travelers pausing here refresh their energy |
| Medical station | `A` | 60 | dispatches doctors/nurses to heal wounded or sick travelers |

Costs are illustrative defaults; all live in `CONFIG`.

### Dangers (6)

| danger | kind | effect | countered by |
| --- | --- | --- | --- |
| Bandit | mobile | appears along the path, attacks (wounds) travelers | Guard |
| Collapsed bridge | static | a path cell collapses, blocking it until repaired | Engineer |
| Flood | static | floods a path segment, blocking it until it recedes or is repaired | Engineer (or timed) |
| Hunger | status | drains traveler energy over time | Hostel (refresh) |
| Plague | status | a traveler becomes sick and spreads it to nearby travelers | Medical station |
| Wild animal | mobile | moves along the map, attacks (wounds) travelers on contact | Guard |

Wounded (from attacks) and sick (from plague) are traveler statuses the Medical
station heals; Hostel handles energy, Engineer repairs, Guard fends off.

## Map & movement

- **Cell types:** `ENTRY` (travelers appear), `PATH` (directed: one `next`
  neighbor, or several at a `SPLIT`), `EXIT` (travelers leave and score),
  `EMPTY` (non-path), and `BUILD_SITE` (fixed tower locations beside the path).
- **Direction:** each `PATH` cell stores its `next` neighbor(s). A normal cell
  has exactly one; a split cell has two or more; an `EXIT` cell has none.
- **Invariants** (verified by a connectivity check):
  1. every `ENTRY` reaches at least one `EXIT`;
  2. every path cell is reachable from some `ENTRY`;
  3. every path cell reaches some `EXIT`;
  4. the path graph is acyclic;
  5. no two path cells are adjacent unless one is the next cell after the other.
- **Generation:** a random generator builds a single winding path from one
  `ENTRY` cell on the left edge to one `EXIT` cell on the right edge. Consecutive
  cells connect orthogonally (edge-to-edge, never corner-to-corner). Only the
  `ENTRY` and `EXIT` cells sit on the grid border; every other cell stays at
  least one row/column away from it. Reloading the page generates a new map.
  The path never branches, joins, backtracks, or runs alongside itself.

## Placing towers

The player builds towers at fixed sites along the path, one tower per site.

- **Build sites.** Pre-designated cells beside the path, rendered as faint
  markers. Only these cells accept a tower.
- **Palette.** A persistent HUD panel lists the four tower kinds (glyph, name,
  cost) and the player's current points.
- **Select, then place.** Click a tower kind in the palette to arm it (it
  highlights); click a build site to place it there, deducting the cost.
- **Invalid placements.** Rejected if the player lacks the points or the site
  already holds a tower. Clicking empty space (or pressing Esc) deselects.

## Roadmap

Each item is a discrete worklist item, implemented and verified in a single
session, in dependency order.

1. **`scaffold-engine`** — single `index.html` + KAPLAY + empty game loop +
   blank canvas.
   *Done when:* the page opens showing an empty grid with no console errors.

2. **`map-path-generator`** — grid/cell classes (`ENTRY`, `PATH`, `SPLIT`,
   `EXIT`, `EMPTY`, `BUILD_SITE`), random directed path, connectivity check,
   directional rendering.
   *Done when:* every generated map satisfies the five invariants and renders
   with direction visible.

3. **`traveler-classes`** — `Traveler` base + `Pilgrim`/`Merchant`/`Refugee`/
   `Postman`/`Tourist`, spawn at entry cells, move one-way along the path
   (branching at splits), circled-letter rendering.
   *Done when:* travelers appear at entries and flow toward exits along the
   directed path.

4. **`traveler-energy`** — energy-spending kinds (`Merchant`, `Refugee`) spend
   energy per step; low energy slows them, zero expires them.
   *Done when:* an energy-spending traveler visibly slows, then expires when
   depleted.

5. **`points-economy`** — player starts with points, earns points when a
   traveler exits, HUD shows the score.
   *Done when:* the score increments when a traveler reaches an exit.

6. **`tower-building`** — `Tower` base + `Hostel`/`Engineer`/`Guard`/`Medical station`, fixed
   build sites along the path, a HUD palette to select the tower kind, click a
   site to place it (spend points), rendering.
   *Done when:* the player selects a tower kind in the palette and places it at
   a build site, points decrement by its cost, and invalid placements are
   rejected.

7. **`tower-effects`** — Hostel refreshes traveler energy; Engineer dispatches
   workers to repair damage; Guard dispatches soldiers to fend off threats;
   Medical station dispatches doctors/nurses to heal the wounded/sick.
   *Done when:* each tower observably performs its effect.

8. **`danger-system`** — `Danger` classes across three kinds (mobile: wild
   animals, bandits; static: floods, collapsed bridges; status: plague,
   hunger), random spawning over time, rendering, effects on travelers (harm,
   block, infect, drain), countered by towers.
   *Done when:* dangers spawn and observably impede travelers, and the matching
   tower mitigates them.

9. **`endgame-tuning`** — win/lose conditions, score display, restart, and pull
   every magic number into the `CONFIG` object.
   *Done when:* a full game runs start-to-finish with a visible outcome and
   restart.
