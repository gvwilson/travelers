import assert from 'node:assert/strict';
import { generateMap } from '../src/map.js';
import { Traveler, TRAVELER_KINDS, TRAVELER_KIND_NAMES } from '../src/actors.js';

const ITERATIONS = 1000;

function pathCells(map) {
  const { next, entries } = map;
  const cells = [];
  let [r, c] = entries[0];
  while (true) {
    cells.push([r, c]);
    const out = next[r][c];
    if (out.length === 0) break;
    [r, c] = out[0];
  }
  return cells;
}

for (let i = 0; i < ITERATIONS; i++) {
  const map = generateMap();
  const expected = pathCells(map);

  for (const kind of TRAVELER_KIND_NAMES) {
    const traveler = new Traveler(kind, map.entries[0]);
    const visited = [[traveler.r, traveler.c]];
    while (traveler.step(map.next)) {
      visited.push([traveler.r, traveler.c]);
    }
    assert.deepEqual(visited, expected, `map ${i} ${kind}: follows path entry-to-exit`);
  }
}

assert.equal(TRAVELER_KINDS.courier.letter, 'C');
assert.equal(TRAVELER_KINDS.merchant.letter, 'M');
assert.equal(TRAVELER_KINDS.pilgrim.letter, 'P');
assert.equal(TRAVELER_KINDS.refugee.letter, 'R');
assert.equal(TRAVELER_KINDS.tourist.letter, 'T');

console.log(`ok: ${ITERATIONS} maps, every kind follows the path entry-to-exit`);
