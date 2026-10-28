import assert from 'node:assert/strict';
import {
  MAPS,
  generateMap,
  verifyMap,
  CellType,
  GRID_ROWS,
  GRID_COLS,
} from '../src/map.js';

const SPECS = [
  { entries: [[7, 0]], exits: [[4, 20]] },
  { entries: [[4, 0], [10, 0]], exits: [[7, 20]] },
  { entries: [[7, 0], [0, 10]], exits: [[7, 20]] },
  { entries: [[7, 0]], exits: [[7, 20]] },
  { entries: [[7, 0]], exits: [[4, 20], [10, 20]] },
];

assert.equal(MAPS.length, 5, 'five static maps');

MAPS.forEach((map, i) => {
  const { grid, entries, exits } = map;

  assert.equal(verifyMap(map), true, `map ${i}: five invariants hold`);
  assert.equal(grid.length, GRID_ROWS, `map ${i}: GRID_ROWS`);
  assert.equal(grid[0].length, GRID_COLS, `map ${i}: GRID_COLS`);
  assert.deepEqual(entries, SPECS[i].entries, `map ${i}: entries`);
  assert.deepEqual(exits, SPECS[i].exits, `map ${i}: exits`);

  for (const [r, c] of entries) {
    assert.ok(r === 0 || c === 0, `map ${i}: entry ${r},${c} on left or top edge`);
    assert.equal(grid[r][c], CellType.ENTRY, `map ${i}: entry cell type`);
  }
  for (const [r, c] of exits) {
    assert.equal(c, GRID_COLS - 1, `map ${i}: exit ${r},${c} on right edge`);
    assert.equal(grid[r][c], CellType.EXIT, `map ${i}: exit cell type`);
  }
});

assert.equal(generateMap(), MAPS[0], 'generateMap() defaults to map 0');
for (let i = 0; i < MAPS.length; i++) {
  assert.equal(generateMap(i), MAPS[i], `generateMap(${i})`);
}

console.log('ok: 5 static maps satisfy all properties');
