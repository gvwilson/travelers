export const CellType = Object.freeze({
  ENTRY: 'entry',
  PATH: 'path',
  SPLIT: 'split',
  EXIT: 'exit',
  EMPTY: 'empty',
  BUILD_SITE: 'build_site',
});

export const GRID_ROWS = 15;
export const GRID_COLS = 21;
export const CELL_SIZE = 32;

// Five hand-authored static maps. Each definition is a set of ordered walks
// from an entry to an exit, with entries and exits listed explicitly. A walk
// is a full entry-to-exit route, so a split cell appears in more than one
// route and a join cell is shared by more than one route; the builder dedupes
// outgoing edges so a join stays a single-outgoing PATH cell.
const MAP_DEFS = [
  {
    name: 'simple-path',
    entries: [[7, 0]],
    exits: [[4, 20]],
    routes: [
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [4, 3], [4, 4],
        [4, 5], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [9, 7],
        [9, 8], [9, 9], [8, 9], [7, 9], [6, 9], [5, 9], [5, 10], [5, 11],
        [5, 12], [6, 12], [7, 12], [8, 12], [8, 13], [8, 14], [8, 15],
        [7, 15], [6, 15], [5, 15], [4, 15], [4, 16], [4, 17], [4, 18],
        [4, 19], [4, 20],
      ],
    ],
  },
  {
    name: 'two-entrances-join',
    entries: [[4, 0], [10, 0]],
    exits: [[7, 20]],
    routes: [
      [
        [4, 0], [4, 1], [4, 2], [4, 3], [5, 3], [6, 3], [6, 4], [6, 5],
        [6, 6], [6, 7], [5, 7], [4, 7], [4, 8], [4, 9], [4, 10], [5, 10],
        [6, 10], [7, 10], [7, 11], [7, 12], [7, 13], [6, 13], [5, 13],
        [5, 14], [5, 15], [5, 16], [6, 16], [7, 16], [7, 17], [7, 18],
        [7, 19], [7, 20],
      ],
      [
        [10, 0], [10, 1], [10, 2], [10, 3], [9, 3], [8, 3], [8, 4], [8, 5],
        [8, 6], [8, 7], [9, 7], [10, 7], [10, 8], [10, 9], [10, 10], [9, 10],
        [8, 10], [7, 10], [7, 11], [7, 12], [7, 13], [6, 13], [5, 13],
        [5, 14], [5, 15], [5, 16], [6, 16], [7, 16], [7, 17], [7, 18],
        [7, 19], [7, 20],
      ],
    ],
  },
  {
    name: 'left-and-top-join',
    entries: [[7, 0], [0, 10]],
    exits: [[7, 20]],
    routes: [
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5],
        [5, 6], [5, 7], [5, 8], [6, 8], [7, 8], [7, 9], [7, 10], [7, 11],
        [7, 12], [7, 13], [8, 13], [9, 13], [9, 14], [9, 15], [9, 16],
        [8, 16], [7, 16], [7, 17], [7, 18], [7, 19], [7, 20],
      ],
      [
        [0, 10], [1, 10], [2, 10], [2, 11], [2, 12], [3, 12], [4, 12],
        [5, 12], [5, 11], [5, 10], [6, 10], [7, 10], [7, 11], [7, 12],
        [7, 13], [8, 13], [9, 13], [9, 14], [9, 15], [9, 16], [8, 16],
        [7, 16], [7, 17], [7, 18], [7, 19], [7, 20],
      ],
    ],
  },
  {
    name: 'split-then-join',
    entries: [[7, 0]],
    exits: [[7, 20]],
    routes: [
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5],
        [6, 5], [7, 5], [7, 6], [7, 7], [6, 7], [5, 7], [5, 8], [5, 9],
        [5, 10], [4, 10], [4, 11], [4, 12], [4, 13], [4, 14], [5, 14],
        [6, 14], [7, 14], [7, 15], [7, 16], [6, 16], [5, 16], [5, 17],
        [5, 18], [6, 18], [7, 18], [7, 19], [7, 20],
      ],
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5],
        [6, 5], [7, 5], [7, 6], [7, 7], [8, 7], [9, 7], [9, 8], [9, 9],
        [9, 10], [10, 10], [10, 11], [10, 12], [10, 13], [10, 14], [9, 14],
        [8, 14], [7, 14], [7, 15], [7, 16], [6, 16], [5, 16], [5, 17],
        [5, 18], [6, 18], [7, 18], [7, 19], [7, 20],
      ],
    ],
  },
  {
    name: 'split-to-two-exits',
    entries: [[7, 0]],
    exits: [[4, 20], [10, 20]],
    routes: [
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5],
        [6, 5], [7, 5], [7, 6], [7, 7], [6, 7], [5, 7], [5, 8], [5, 9],
        [5, 10], [4, 10], [4, 11], [4, 12], [4, 13], [4, 14], [4, 15],
        [4, 16], [5, 16], [5, 17], [5, 18], [4, 18], [4, 19], [4, 20],
      ],
      [
        [7, 0], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [5, 4], [5, 5],
        [6, 5], [7, 5], [7, 6], [7, 7], [8, 7], [9, 7], [9, 8], [9, 9],
        [9, 10], [10, 10], [10, 11], [10, 12], [10, 13], [10, 14], [10, 15],
        [10, 16], [9, 16], [9, 17], [9, 18], [10, 18], [10, 19], [10, 20],
      ],
    ],
  },
];

function buildStaticMap(def) {
  const grid = Array.from({ length: GRID_ROWS }, () =>
    new Array(GRID_COLS).fill(CellType.EMPTY),
  );
  const next = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => []),
  );

  for (const route of def.routes) {
    for (let i = 0; i < route.length - 1; i++) {
      const [r, c] = route[i];
      const [nr, nc] = route[i + 1];
      if (!next[r][c].some(([er, ec]) => er === nr && ec === nc)) {
        next[r][c].push([nr, nc]);
      }
    }
  }

  for (const [r, c] of def.entries) grid[r][c] = CellType.ENTRY;
  for (const [r, c] of def.exits) grid[r][c] = CellType.EXIT;
  for (const route of def.routes) {
    for (const [r, c] of route) {
      if (grid[r][c] !== CellType.EMPTY) continue;
      grid[r][c] = next[r][c].length >= 2 ? CellType.SPLIT : CellType.PATH;
    }
  }

  return { grid, next, entries: def.entries, exits: def.exits };
}

export const MAPS = MAP_DEFS.map(buildStaticMap);

export function generateMap(index = 0) {
  return MAPS[index];
}

// Verifies the five map invariants from PLAN.md: every entry reaches an exit,
// every path cell is reachable from an entry and reaches an exit, the graph is
// acyclic, and no two path cells are adjacent unless one follows the other.
export function verifyMap(map) {
  const { grid, next, entries, exits } = map;
  const rows = grid.length;
  const cols = grid[0].length;
  const key = (r, c) => r * cols + c;

  const isNode = (r, c) => {
    const type = grid[r][c];
    return (
      type === CellType.ENTRY ||
      type === CellType.PATH ||
      type === CellType.SPLIT ||
      type === CellType.EXIT
    );
  };

  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isNode(r, c)) nodes.push([r, c]);
    }
  }

  const exitKeys = new Set(exits.map(([r, c]) => key(r, c)));

  const reachable = (start) => {
    const seen = new Set([key(start[0], start[1])]);
    const stack = [start];
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      for (const [nr, nc] of next[r][c]) {
        const k = key(nr, nc);
        if (!seen.has(k)) {
          seen.add(k);
          stack.push([nr, nc]);
        }
      }
    }
    return seen;
  };

  // Invariant 1: every entry reaches at least one exit; invariant 2: every
  // path cell is reachable from some entry.
  const fromEntries = new Set();
  for (const entry of entries) {
    const seen = reachable(entry);
    for (const k of seen) fromEntries.add(k);
    if (![...exitKeys].some((k) => seen.has(k))) return false;
  }
  for (const [r, c] of nodes) {
    if (!fromEntries.has(key(r, c))) return false;
  }

  // Invariant 3: every path cell reaches some exit.
  for (const [r, c] of nodes) {
    if (![...exitKeys].some((k) => reachable([r, c]).has(k))) return false;
  }

  // Invariant 4: acyclic, via depth-first search with coloring.
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const visit = (r, c) => {
    const k = key(r, c);
    color.set(k, GRAY);
    for (const [nr, nc] of next[r][c]) {
      const nk = key(nr, nc);
      const state = color.get(nk) ?? WHITE;
      if (state === GRAY) return false;
      if (state === WHITE && !visit(nr, nc)) return false;
    }
    color.set(k, BLACK);
    return true;
  };
  for (const [r, c] of nodes) {
    if ((color.get(key(r, c)) ?? WHITE) === WHITE && !visit(r, c)) return false;
  }

  // Invariant 5: no two path cells share an edge unless one is the other's
  // next cell — the path never runs alongside itself.
  for (const [r, c] of nodes) {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (!isNode(nr, nc)) continue;
      const linked =
        next[r][c].some(([er, ec]) => er === nr && ec === nc) ||
        next[nr][nc].some(([er, ec]) => er === r && ec === c);
      if (!linked) return false;
    }
  }

  return true;
}
