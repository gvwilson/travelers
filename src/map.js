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

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDistinct(n, max) {
  const pool = Array.from({ length: max }, (_, i) => i);
  shuffle(pool);
  return pool.slice(0, n);
}

export function generateMap(rows = GRID_ROWS, cols = GRID_COLS) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const map = buildMap(rows, cols);
    if (verifyMap(map)) return map;
  }
  throw new Error('map generation failed to satisfy the invariants');
}

// Builds a directed path network flowing left→right, so acyclicity holds by
// construction: every edge moves to a strictly higher column index. The
// network fans out from 1–2 entries and funnels into 1–2 exits.
function buildMap(rows, cols) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(CellType.EMPTY));
  const next = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => []),
  );

  const entryRows = pickDistinct(Math.random() < 0.5 ? 1 : 2, rows);
  const exitRows = pickDistinct(Math.random() < 0.5 ? 1 : 2, rows);

  for (const r of entryRows) grid[r][0] = CellType.ENTRY;
  for (const r of exitRows) grid[r][cols - 1] = CellType.EXIT;

  for (let c = 0; c < cols - 1; c++) {
    for (let r = 0; r < rows; r++) {
      const type = grid[r][c];
      if (type !== CellType.ENTRY && type !== CellType.PATH && type !== CellType.SPLIT) {
        continue;
      }
      if (c + 1 === cols - 1) {
        for (const er of exitRows) {
          next[r][c].push([er, cols - 1]);
        }
        continue;
      }
      const candidates = [r - 1, r, r + 1].filter((nr) => nr >= 0 && nr < rows);
      const targetCount = 1 + Math.floor(Math.random() * candidates.length);
      for (const nr of shuffle(candidates).slice(0, targetCount)) {
        next[r][c].push([nr, c + 1]);
        if (grid[nr][c + 1] === CellType.EMPTY) {
          grid[nr][c + 1] = CellType.PATH;
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (grid[r][c] === CellType.PATH && next[r][c].length > 1) {
        grid[r][c] = CellType.SPLIT;
      }
    }
  }

  const entries = [];
  const exits = [];
  for (let r = 0; r < rows; r++) {
    if (grid[r][0] === CellType.ENTRY) entries.push([r, 0]);
    if (grid[r][cols - 1] === CellType.EXIT) exits.push([r, cols - 1]);
  }

  return { grid, next, entries, exits };
}

// Verifies the four map invariants from PLAN.md. Returns true only when all
// hold; generateMap re-rolls (up to a bounded number of attempts) on failure.
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

  return true;
}
