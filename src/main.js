import kaplay from 'https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs';
import { generateMap, CellType, GRID_ROWS, GRID_COLS, CELL_SIZE } from './map.js';
import { Traveler, TRAVELER_KIND_NAMES } from './actors.js';

const { add, rect, pos, color, circle, outline, anchor, text, vec2, polygon, onUpdate, dt } =
  kaplay({
    background: '#1a1a1a',
    width: GRID_COLS * CELL_SIZE,
    height: GRID_ROWS * CELL_SIZE,
  });

const { grid, next, entries } = generateMap();

const CELL_COLORS = {
  [CellType.ENTRY]: '#29b6f6',
  [CellType.PATH]: '#4a4a4a',
  [CellType.SPLIT]: '#ffa726',
  [CellType.EXIT]: '#00e676',
  [CellType.EMPTY]: '#000000',
  [CellType.BUILD_SITE]: '#5c6bc0',
};

for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    add([
      rect(CELL_SIZE - 2, CELL_SIZE - 2),
      pos(c * CELL_SIZE + 1, r * CELL_SIZE + 1),
      color(CELL_COLORS[grid[r][c]]),
    ]);
  }
}

function cellCenter(r, c) {
  return { x: c * CELL_SIZE + CELL_SIZE / 2, y: r * CELL_SIZE + CELL_SIZE / 2 };
}

// Direction overlay: a thin edge plus an arrowhead, both in pixels.
const DIRECTION_COLOR = '#ffffff';
const EDGE_THICKNESS = 1;
const ARROW_LEN = 6;
const ARROW_HALF = 3;

function drawEdge(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy * EDGE_THICKNESS;
  const py = ux * EDGE_THICKNESS;
  const ax = -uy * ARROW_HALF;
  const ay = ux * ARROW_HALF;

  add([
    polygon([
      vec2(from.x + px, from.y + py),
      vec2(from.x - px, from.y - py),
      vec2(to.x - px, to.y - py),
      vec2(to.x + px, to.y + py),
    ]),
    color(DIRECTION_COLOR),
  ]);

  add([
    polygon([
      vec2(to.x, to.y),
      vec2(to.x - ux * ARROW_LEN + ax, to.y - uy * ARROW_LEN + ay),
      vec2(to.x - ux * ARROW_LEN - ax, to.y - uy * ARROW_LEN - ay),
    ]),
    color(DIRECTION_COLOR),
  ]);
}

for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    for (const [nr, nc] of next[r][c]) {
      drawEdge(cellCenter(r, c), cellCenter(nr, nc));
    }
  }
}

const TRAVELER_RADIUS = CELL_SIZE / 2 - 4; // inset so circles sit inside their cells
const TRAVELER_TEXT_SIZE = CELL_SIZE / 2;
const SPAWN_INTERVAL = 1; // seconds between traveler spawns

const travelers = [];

function spawnTraveler() {
  const kind = TRAVELER_KIND_NAMES[Math.floor(Math.random() * TRAVELER_KIND_NAMES.length)];
  const traveler = new Traveler(kind, entries[0]);
  const { x, y } = cellCenter(traveler.r, traveler.c);
  traveler.sprites = [
    add([
      circle(TRAVELER_RADIUS),
      color(traveler.color),
      outline(2, '#000000'),
      pos(x, y),
      anchor('center'),
    ]),
    add([
      text(traveler.letter, { size: TRAVELER_TEXT_SIZE }),
      color('#ffffff'),
      pos(x, y),
      anchor('center'),
    ]),
  ];
  traveler.timer = 0;
  travelers.push(traveler);
}

function reposition(traveler) {
  const { x, y } = cellCenter(traveler.r, traveler.c);
  for (const sprite of traveler.sprites) sprite.pos = vec2(x, y);
}

spawnTraveler();
let spawnTimer = 0;

onUpdate(() => {
  spawnTimer += dt();
  if (spawnTimer >= SPAWN_INTERVAL) {
    spawnTimer = 0;
    spawnTraveler();
  }

  for (let i = travelers.length - 1; i >= 0; i--) {
    const traveler = travelers[i];
    traveler.timer += dt();
    if (traveler.timer < traveler.moveInterval) continue;
    traveler.timer = 0;
    if (traveler.step(next)) {
      reposition(traveler);
    } else {
      travelers.splice(i, 1);
      for (const sprite of traveler.sprites) sprite.destroy();
    }
  }
});
