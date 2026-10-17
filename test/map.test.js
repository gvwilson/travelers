import assert from 'node:assert/strict';
import {
  generateMap,
  verifyMap,
  CellType,
  GRID_ROWS,
  GRID_COLS,
} from '../src/map.js';

const ITERATIONS = 10000;
const isNode = (type) =>
  type === CellType.ENTRY ||
  type === CellType.PATH ||
  type === CellType.SPLIT ||
  type === CellType.EXIT;

function walkPath(map) {
  const { next, entries } = map;
  const cells = [];
  const seen = new Set();
  let [r, c] = entries[0];
  while (true) {
    const k = r * GRID_COLS + c;
    assert.ok(!seen.has(k), 'path must not revisit a cell');
    seen.add(k);
    cells.push([r, c]);
    const out = next[r][c];
    if (out.length === 0) break;
    [r, c] = out[0];
  }
  return cells;
}

for (let i = 0; i < ITERATIONS; i++) {
  const map = generateMap();
  const { grid, entries, exits } = map;

  assert.equal(entries.length, 1, `map ${i}: one entry`);
  assert.equal(exits.length, 1, `map ${i}: one exit`);
  assert.equal(entries[0][1], 0, `map ${i}: entry on left edge`);
  assert.equal(exits[0][1], GRID_COLS - 1, `map ${i}: exit on right edge`);

  const cells = walkPath(map);

  let nodeCount = 0;
  for (let r = 0; r < GRID_ROWS; r++)
    for (let c = 0; c < GRID_COLS; c++) if (isNode(grid[r][c])) nodeCount++;
  assert.equal(cells.length, nodeCount, `map ${i}: one simple path through all cells`);
  assert.deepEqual(cells[cells.length - 1], exits[0], `map ${i}: path ends at exit`);

  const entryKey = `${entries[0][0]},${entries[0][1]}`;
  const exitKey = `${exits[0][0]},${exits[0][1]}`;
  for (const [r, c] of cells) {
    const key = `${r},${c}`;
    if (key === entryKey || key === exitKey) continue;
    assert.ok(r >= 1 && r <= GRID_ROWS - 2, `map ${i}: interior row off border`);
    assert.ok(c >= 1 && c <= GRID_COLS - 2, `map ${i}: interior column off border`);
  }

  for (let j = 1; j < cells.length; j++) {
    const [pr, pc] = cells[j - 1];
    const [r, c] = cells[j];
    assert.equal(Math.abs(pr - r) + Math.abs(pc - c), 1, `map ${i}: orthogonal step`);
  }

  assert.equal(verifyMap(map), true, `map ${i}: five invariants hold`);
}

console.log(`ok: ${ITERATIONS} maps satisfy all properties`);
