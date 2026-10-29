import kaplay from 'https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs';
import { generateMap, MAPS, CellType, GRID_ROWS, GRID_COLS, CELL_SIZE } from './map.js';
import { Traveler, TRAVELER_KIND_NAMES } from './actors.js';

const { add, rect, pos, color, circle, outline, anchor, text, vec2, onUpdate, dt } =
  kaplay({
    background: '#1a1a1a',
    width: GRID_COLS * CELL_SIZE,
    height: GRID_ROWS * CELL_SIZE,
  });

function readMapIndex() {
  const raw = new URLSearchParams(window.location.search).get('map');
  const n = Number.parseInt(raw ?? '0', 10);
  return Number.isInteger(n) && n >= 0 && n < MAPS.length ? n : 0;
}

const mapIndex = readMapIndex();
const { grid, next, entries } = generateMap(mapIndex);

const mapSelect = document.getElementById('map-select');
if (mapSelect) {
  mapSelect.value = String(mapIndex);
  mapSelect.addEventListener('change', () => {
    window.location.search = `?map=${mapSelect.value}`;
  });
}

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

const TRAVELER_RADIUS = CELL_SIZE / 2 - 4; // inset so circles sit inside their cells
const TRAVELER_TEXT_SIZE = CELL_SIZE / 2;
const SPAWN_INTERVAL = 1; // seconds between traveler spawns

const travelers = [];

function spawnTraveler() {
  const kind = TRAVELER_KIND_NAMES[Math.floor(Math.random() * TRAVELER_KIND_NAMES.length)];
  const entry = entries[Math.floor(Math.random() * entries.length)];
  const traveler = new Traveler(kind, entry);
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
    if (traveler.timer < traveler.effectiveMoveInterval) continue;
    traveler.timer = 0;
    if (traveler.step(next) && !traveler.isExpired) {
      reposition(traveler);
    } else {
      travelers.splice(i, 1);
      for (const sprite of traveler.sprites) sprite.destroy();
    }
  }
});
