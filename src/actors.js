export const TRAVELER_KINDS = Object.freeze({
  courier: { letter: 'C', moveInterval: 0.3, usesEnergy: false, pointValue: 1, color: '#29b6f6' },
  merchant: { letter: 'M', moveInterval: 0.55, usesEnergy: true, pointValue: 2, color: '#ffca28' },
  pilgrim: { letter: 'P', moveInterval: 0.45, usesEnergy: false, pointValue: 1, color: '#66bb6a' },
  refugee: { letter: 'R', moveInterval: 0.4, usesEnergy: true, pointValue: 1, color: '#ef5350' },
  tourist: { letter: 'T', moveInterval: 0.8, usesEnergy: false, pointValue: 1, color: '#ab47bc' },
});

export const TRAVELER_KIND_NAMES = Object.keys(TRAVELER_KINDS);

export class Traveler {
  constructor(kind, startCell) {
    const def = TRAVELER_KINDS[kind];
    this.kind = kind;
    this.letter = def.letter;
    this.moveInterval = def.moveInterval; // seconds per cell step
    this.usesEnergy = def.usesEnergy;
    this.pointValue = def.pointValue;
    this.color = def.color;
    this.r = startCell[0];
    this.c = startCell[1];
  }

  // Advance one cell along the path; returns false once at the exit.
  step(next) {
    const out = next[this.r][this.c];
    if (out.length === 0) return false;
    [this.r, this.c] = out[0];
    return true;
  }
}
