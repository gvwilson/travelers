import { CONFIG } from './config.js';

export const DANGER_KINDS = CONFIG.dangers.kinds;
export const DANGER_KIND_NAMES = Object.keys(DANGER_KINDS);

export class Danger {
  constructor(kind, r, c) {
    const def = DANGER_KINDS[kind];
    this.kind = kind;
    this.letter = def.letter;
    this.color = def.color;
    this.type = def.type; // 'mobile' | 'static'
    this.r = r;
    this.c = c;
    this.moveTimer = 0;
    this.age = 0;
  }
}
