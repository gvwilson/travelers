import { CONFIG } from './config.js';

export const TOWER_KINDS = CONFIG.towers.kinds;
export const TOWER_KIND_NAMES = Object.keys(TOWER_KINDS);

export class Tower {
  constructor(kind, r, c) {
    const def = TOWER_KINDS[kind];
    this.kind = kind;
    this.letter = def.letter;
    this.cost = def.cost;
    this.color = def.color;
    this.r = r;
    this.c = c;
  }
}
