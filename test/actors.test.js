import assert from 'node:assert/strict';
import { MAPS } from '../src/map.js';
import { Traveler, TRAVELER_KINDS, TRAVELER_KIND_NAMES } from '../src/actors.js';

for (const [i, map] of MAPS.entries()) {
  for (const entry of map.entries) {
    for (const kind of TRAVELER_KIND_NAMES) {
      const traveler = new Traveler(kind, entry);
      while (traveler.step(map.next)) {
        // step until the exit (step returns false there)
      }
      const atExit = map.exits.some(([r, c]) => r === traveler.r && c === traveler.c);
      assert.ok(atExit, `map ${i} ${kind} from ${entry}: reaches an exit`);
    }
  }
}

assert.equal(TRAVELER_KINDS.courier.letter, 'C');
assert.equal(TRAVELER_KINDS.merchant.letter, 'M');
assert.equal(TRAVELER_KINDS.pilgrim.letter, 'P');
assert.equal(TRAVELER_KINDS.refugee.letter, 'R');
assert.equal(TRAVELER_KINDS.tourist.letter, 'T');

console.log('ok: every kind follows the path from every entry to an exit on all 5 maps');
