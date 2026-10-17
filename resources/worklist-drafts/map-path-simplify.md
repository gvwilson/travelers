# Before

`src/map.js` fans the path out from 1–2 entries and funnels it into 1–2 exits,
with `SPLIT` cells wherever a cell has several next-cells. The result puts
parallel strands side by side — two path cells that touch but are not
connected — so the trail reads as a 2+-cell-wide road and leaves no clean
margin for build sites. The `PLAN.md` "Generation" bullet documents the 1-or-2
entry/exit split.

# After

`src/map.js` generates one non-branching path:

- exactly one `ENTRY` cell on the left edge and one `EXIT` cell on the right edge;
- consecutive cells connect orthogonally (edge-to-edge, never corner-to-corner);
- only the `ENTRY` and `EXIT` cells sit on the grid border — every interior cell
  stays at least one cell away from it;
- no two path cells are orthogonally adjacent unless one is the next cell after
  the other — the path never runs alongside itself.

`verifyMap` adds a fifth invariant encoding that adjacency rule. `shuffle` and
`pickDistinct` are removed as unused. `PLAN.md` updates the invariants list
(adds the rule) and the "Generation" bullet. A `test/map.test.js` property test
asserts a single entry/exit, orthogonal step-by-step connectivity, off-border
interior cells, and that every generated map satisfies the five invariants. The
`SPLIT` cell type stays in the enum for the later branching roadmap item but is
not produced yet.
