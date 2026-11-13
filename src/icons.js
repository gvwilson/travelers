import { CONFIG } from './config.js';

// Simple cartoon icons drawn from KAPLAY primitives. Coordinates are
// normalized to the cell (1.0 = one cell), centered at (0, 0), so they scale
// with CELL_SIZE. Each spec is one shape:
//   { t: 'circle', x, y, r, color }
//   { t: 'rect',   x, y, w, h, color }
//   { t: 'poly',   points: [[x,y], ...], color }
const WHITE = '#ffffff';
const DARK = '#1a1a1a';
const SACK = '#6d4c41';

// A little figure: a head and a body, plus distinguishing props.
function person(color, extras) {
  return [
    { t: 'circle', x: 0, y: -0.17, r: 0.12, color },
    { t: 'circle', x: 0, y: 0.1, r: 0.16, color },
    ...extras,
  ];
}

export const ICONS = {
  courier: person(CONFIG.traveler.courier.color, [
    { t: 'rect', x: 0.22, y: 0.05, w: 0.16, h: 0.12, color: WHITE },
  ]),
  merchant: person(CONFIG.traveler.merchant.color, [
    { t: 'circle', x: -0.22, y: 0.1, r: 0.1, color: SACK },
  ]),
  pilgrim: person(CONFIG.traveler.pilgrim.color, [
    { t: 'rect', x: 0, y: -0.26, w: 0.28, h: 0.06, color: DARK },
  ]),
  refugee: person(CONFIG.traveler.refugee.color, [
    { t: 'rect', x: 0.24, y: -0.05, w: 0.05, h: 0.26, color: DARK },
    { t: 'circle', x: 0.28, y: -0.18, r: 0.06, color: WHITE },
  ]),
  tourist: person(CONFIG.traveler.tourist.color, [
    { t: 'rect', x: 0.02, y: 0.1, w: 0.16, h: 0.12, color: DARK },
    { t: 'circle', x: 0.02, y: 0.1, r: 0.04, color: WHITE },
  ]),

  engineer: [
    { t: 'circle', x: 0, y: 0, r: 0.16, color: CONFIG.towers.kinds.engineer.color },
    { t: 'rect', x: 0, y: -0.22, w: 0.08, h: 0.08, color: CONFIG.towers.kinds.engineer.color },
    { t: 'rect', x: 0, y: 0.22, w: 0.08, h: 0.08, color: CONFIG.towers.kinds.engineer.color },
    { t: 'rect', x: -0.22, y: 0, w: 0.08, h: 0.08, color: CONFIG.towers.kinds.engineer.color },
    { t: 'rect', x: 0.22, y: 0, w: 0.08, h: 0.08, color: CONFIG.towers.kinds.engineer.color },
    { t: 'circle', x: 0, y: 0, r: 0.05, color: DARK },
  ],
  guard: [
    { t: 'poly', points: [[-0.2, -0.2], [0.2, -0.2], [0.2, 0.05], [0, 0.25], [-0.2, 0.05]], color: CONFIG.towers.kinds.guard.color },
    { t: 'rect', x: 0, y: -0.1, w: 0.08, h: 0.16, color: WHITE },
  ],
  hostel: [
    { t: 'rect', x: 0, y: 0.02, w: 0.34, h: 0.22, color: CONFIG.towers.kinds.hostel.color },
    { t: 'poly', points: [[-0.22, -0.06], [0, -0.24], [0.22, -0.06]], color: DARK },
    { t: 'rect', x: 0, y: 0.12, w: 0.08, h: 0.12, color: DARK },
  ],
  medical: [
    { t: 'rect', x: 0, y: 0, w: 0.36, h: 0.36, color: CONFIG.towers.kinds.medical.color },
    { t: 'rect', x: 0, y: 0, w: 0.1, h: 0.26, color: WHITE },
    { t: 'rect', x: 0, y: 0, w: 0.26, h: 0.1, color: WHITE },
  ],

  bandit: [
    { t: 'circle', x: 0, y: 0, r: 0.2, color: CONFIG.dangers.kinds.bandit.color },
    { t: 'rect', x: 0, y: -0.02, w: 0.4, h: 0.08, color: DARK },
    { t: 'circle', x: -0.08, y: -0.02, r: 0.025, color: WHITE },
    { t: 'circle', x: 0.08, y: -0.02, r: 0.025, color: WHITE },
  ],
  wildAnimal: [
    { t: 'circle', x: 0, y: 0.03, r: 0.16, color: CONFIG.dangers.kinds.wildAnimal.color },
    { t: 'poly', points: [[-0.16, -0.08], [-0.1, -0.22], [-0.03, -0.1]], color: CONFIG.dangers.kinds.wildAnimal.color },
    { t: 'poly', points: [[0.16, -0.08], [0.1, -0.22], [0.03, -0.1]], color: CONFIG.dangers.kinds.wildAnimal.color },
    { t: 'circle', x: -0.06, y: 0.03, r: 0.03, color: DARK },
    { t: 'circle', x: 0.06, y: 0.03, r: 0.03, color: DARK },
  ],
  flood: [
    { t: 'rect', x: -0.1, y: -0.1, w: 0.22, h: 0.06, color: CONFIG.dangers.kinds.flood.color },
    { t: 'rect', x: 0.08, y: 0, w: 0.22, h: 0.06, color: CONFIG.dangers.kinds.flood.color },
    { t: 'rect', x: -0.06, y: 0.1, w: 0.22, h: 0.06, color: CONFIG.dangers.kinds.flood.color },
  ],
  collapsedBridge: [
    { t: 'rect', x: -0.16, y: -0.02, w: 0.08, h: 0.24, color: CONFIG.dangers.kinds.collapsedBridge.color },
    { t: 'rect', x: 0.16, y: -0.02, w: 0.08, h: 0.24, color: CONFIG.dangers.kinds.collapsedBridge.color },
    { t: 'rect', x: -0.12, y: -0.14, w: 0.14, h: 0.06, color: CONFIG.dangers.kinds.collapsedBridge.color },
    { t: 'rect', x: 0.12, y: -0.14, w: 0.14, h: 0.06, color: CONFIG.dangers.kinds.collapsedBridge.color },
  ],
};
