import { CONFIG } from './config.js';

export const TRAVELER_KINDS = CONFIG.traveler;
export const TRAVELER_KIND_NAMES = Object.keys(TRAVELER_KINDS);

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
    this.energy = def.usesEnergy ? CONFIG.energy.start : null;
    this.wounded = false;
    this.sick = false;
    this.sickFor = 0;
  }

  // Advance one cell along the path; returns false once at the exit.
  step(next) {
    const out = next[this.r][this.c];
    if (out.length === 0) return false;
    [this.r, this.c] = out[Math.floor(Math.random() * out.length)];
    if (this.usesEnergy) this.energy -= CONFIG.energy.perStep;
    return true;
  }

  // Seconds per cell step, slowing when low on energy or wounded.
  get effectiveMoveInterval() {
    let interval = this.moveInterval;
    if (this.usesEnergy && this.energy <= CONFIG.energy.slowThreshold) {
      interval *= CONFIG.energy.slowFactor;
    }
    if (this.wounded) interval *= CONFIG.status.woundedSlowFactor;
    return interval;
  }

  get isExpired() {
    if (this.usesEnergy && this.energy <= 0) return true;
    if (this.sick && this.sickFor >= CONFIG.status.sickTimeToExpire) return true;
    return false;
  }
}
