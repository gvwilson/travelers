# Before

No implementation plan exists. `README.md` describes "Travelers" at a high level
(a tower-defense-shaped game where the player helps travelers reach their
destination), but there is no breakdown into discrete, independently-implementable
steps. Development will span multiple sessions, one worklist item at a time.

The sibling project `../humans` ("Save the Humans!") used the same engine and
workflow: a `PLAN.md` roadmap plus one worklist item per step, implemented in
`src/main.js`, `src/map.js`, `src/actors.js`, and `src/config.js`. Its structure
and idioms are the reference for this project.

# After

Create `PLAN.md` capturing the implementation roadmap so it survives across
sessions and is the source of truth for sequencing. It will contain:

- **Engine:** KAPLAY (formerly Kaboom.js), loaded via a pinned CDN for now (no
  vendored copy — avoids committing a large opaque minified blob; npm + bundler
  deferred to the later packaging step, per the README).
- **Design assumptions:**
  - Grid-based, one-way path movement: the map is a one-cell-wide directed path
    network; travelers move in one direction through each cell (splits branch),
    modeled as a DAG of entry → split/join → exit.
  - Continuous time (`onUpdate` + per-kind move intervals), as in `../humans`.
  - All tunables centralized in one config object (speeds, energy costs, point
    values, tower costs, danger rates) for easy playtesting.
  - Single `index.html` loads all JS files as ES modules; no bundler.
  - Circled-character rendering for every entity (graphics later).
- **Domain model:** 5 traveler kinds (pilgrim, merchant, refugee, postman,
  tourist), 4 towers (hostel, engineer, guard, medical station), 6 dangers (wild animals, bandits,
  floods, collapsed bridges, plagues, hunger).
- **Nine worklist items** in dependency order, each with a one-line goal and a
  "done when" acceptance check:

1. `scaffold-engine` — single `index.html` + KAPLAY + empty game loop + blank canvas.
2. `map-path-generator` — grid/cell classes, random directed path network (fully connected, splits/joins, entries reach exits), connectivity check, directional rendering.
3. `traveler-classes` — `Traveler` base + 5 kinds, spawn at entries, move one-way along the path (branch at splits), circled-letter rendering.
4. `traveler-energy` — some kinds spend energy per step; low energy slows, zero expires.
5. `points-economy` — start with points, earn on exit, HUD.
6. `tower-building` — `Tower` base + hostel/engineer/guard/medical station, fixed build sites, click to build (spend points).
7. `tower-effects` — hostel refreshes energy, engineer repairs, guard fends off, medical station heals.
8. `danger-system` — danger classes (mobile/static/status), spawning, effects on travelers, tower counters.
9. `endgame-tuning` — win/lose, score, restart, centralize tunables.
