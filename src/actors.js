export const TRAVELER_KINDS = Object.freeze({
  courier: { letter: 'C', moveInterval: 0.6, usesEnergy: false, pointValue: 1, color: '#29b6f6' },
  merchant: { letter: 'M', moveInterval: 1.0, usesEnergy: true, pointValue: 2, color: '#ffca28' },
  pilgrim: { letter: 'P', moveInterval: 0.9, usesEnergy: false, pointValue: 1, color: '#66bb6a' },
  refugee: { letter: 'R', moveInterval: 0.8, usesEnergy: true, pointValue: 1, color: '#ef5350' },
  tourist: { letter: 'T', moveInterval: 1.5, usesEnergy: false, pointValue: 1, color: '#ab47bc' },
});

export const TRAVELER_KIND_NAMES = Object.keys(TRAVELER_KINDS);

const ENERGY_START = 10; // cells a Merchant/Refugee can move before expiring
const ENERGY_PER_STEP = 1;
const ENERGY_SLOW_THRESHOLD = 3; // at or below this energy, movement slows
const ENERGY_SLOW_FACTOR = 2; // moveInterval multiplier when slowed

export class Traveler {
  constructor(kind, startCell) {
    const def = TRAVELER_KINDS[kind];
    this.kind = kind;
    this.letter = def.letter;
    this.moveInterval = def.moveInterval;
    this.usesEnergy = def.usesEnergy;
    this.pointValue = def.pointValue;
    this.color = def.color;
    this.r = startCell[0];
    this.c = startCell[1];
    this.energy = def.usesEnergy ? ENERGY_START : null;
  }

  // Advance one cell along the path; returns false once at the exit.
  step(next) {
    const out = next[this.r][this.c];
    if (out.length === 0) return false;
    [this.r, this.c] = out[Math.floor(Math.random() * out.length)];
    if (this.usesEnergy) this.energy -= ENERGY_PER_STEP;
    return true;
  }

  // Seconds per cell step, slowing once energy runs low.
  get effectiveMoveInterval() {
    if (!this.usesEnergy) return this.moveInterval;
    return this.energy <= ENERGY_SLOW_THRESHOLD
      ? this.moveInterval * ENERGY_SLOW_FACTOR
      : this.moveInterval;
  }

  get isExpired() {
    return this.usesEnergy && this.energy <= 0;
  }
}
