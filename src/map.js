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

const VERTICAL_STEP_CHANCE = 0.6; // bias toward winding over straight runs

export function generateMap(rows = GRID_ROWS, cols = GRID_COLS) {
  return buildMap(rows, cols);
}

// Single non-branching path: monotone in columns (never left), so it is acyclic
// and can never get stuck — a right step is always available. A vertical step
// is taken only when the target cell is clear of every earlier cell but its
// predecessor, which keeps the path from running alongside itself.
function buildMap(rows, cols) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(CellType.EMPTY));
  const next = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => []),
  );
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));

  const isClear = (r, c, fromR, fromC) => {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (nr === fromR && nc === fromC) continue;
      if (visited[nr][nc]) return false;
    }
    return true;
  };

  // Interior rows only (1..rows-2): the top and bottom borders stay empty.
  let r = 1 + Math.floor(Math.random() * (rows - 2));
  let c = 0;
  const cells = [[r, c]];
  visited[r][c] = true;

  while (c < cols - 1) {
    if (c > 0) {
      const steps = [];
      if (r - 1 >= 1 && !visited[r - 1][c] && isClear(r - 1, c, r, c)) steps.push(r - 1);
      if (r + 1 <= rows - 2 && !visited[r + 1][c] && isClear(r + 1, c, r, c)) steps.push(r + 1);
      if (steps.length > 0 && Math.random() < VERTICAL_STEP_CHANCE) {
        r = steps[Math.floor(Math.random() * steps.length)];
        visited[r][c] = true;
        cells.push([r, c]);
      }
    }
    c += 1;
    visited[r][c] = true;
    cells.push([r, c]);
  }

  for (let i = 0; i < cells.length; i++) {
    const [rr, cc] = cells[i];
    grid[rr][cc] =
      i === 0 ? CellType.ENTRY : i === cells.length - 1 ? CellType.EXIT : CellType.PATH;
    if (i < cells.length - 1) next[rr][cc].push(cells[i + 1]);
  }

  return {
    grid,
    next,
    entries: [cells[0]],
    exits: [cells[cells.length - 1]],
  };
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
