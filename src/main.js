import kaplay from 'https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs';
import { generateMap, MAPS, CellType, GRID_ROWS, GRID_COLS, CELL_SIZE } from './map.js';
import { Traveler, TRAVELER_KIND_NAMES } from './actors.js';
import { Tower, TOWER_KIND_NAMES } from './towers.js';
import { Danger, DANGER_KIND_NAMES } from './dangers.js';
import { CONFIG } from './config.js';

const {
  add, rect, pos, color, circle, outline, anchor, text, vec2,
  onUpdate, dt, onClick, mousePos, onKeyPress,
} = kaplay({
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
const { grid, next, entries, buildSites } = generateMap(mapIndex);

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

// ---- Game state -----------------------------------------------------------

let points = CONFIG.points.start;
let lives = CONFIG.endgame.startLives;
let spawnCount = 0;
let armedTower = null;
let gameOver = false;
let won = false;

const travelers = [];
const towers = [];
const dangers = [];

const TRAVELER_RADIUS = CELL_SIZE / 2 - 4;
const TRAVELER_TEXT_SIZE = CELL_SIZE / 2;

// ---- Helpers ---------------------------------------------------------------

function isBlocked(r, c) {
  return dangers.some((d) => d.type === 'static' && d.r === r && d.c === c);
}

function updateHUD() {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = `Points: ${points}`;
  const livesEl = document.getElementById('lives');
  if (livesEl) livesEl.textContent = `Lives: ${lives}`;
  for (const btn of document.querySelectorAll('#tower-palette button')) {
    const cost = CONFIG.towers.kinds[btn.dataset.kind].cost;
    btn.disabled = points < cost;
    btn.classList.toggle('armed', armedTower === btn.dataset.kind);
  }
}

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
  spawnCount += 1;
}

function removeTraveler(i) {
  const traveler = travelers[i];
  for (const sprite of traveler.sprites) sprite.destroy();
  travelers.splice(i, 1);
}

function reposition(traveler) {
  const { x, y } = cellCenter(traveler.r, traveler.c);
  for (const sprite of traveler.sprites) sprite.pos = vec2(x, y);
}

function placeTower(kind, r, c) {
  const def = CONFIG.towers.kinds[kind];
  if (points < def.cost) return;
  if (grid[r][c] !== CellType.BUILD_SITE) return;
  if (towers.some((t) => t.r === r && t.c === c)) return;
  const tower = new Tower(kind, r, c);
  const { x, y } = cellCenter(r, c);
  tower.sprites = [
    add([
      rect(CELL_SIZE - 6, CELL_SIZE - 6),
      color(tower.color),
      outline(2, '#000000'),
      pos(x, y),
      anchor('center'),
    ]),
    add([
      text(tower.letter, { size: TRAVELER_TEXT_SIZE }),
      color('#000000'),
      pos(x, y),
      anchor('center'),
    ]),
  ];
  towers.push(tower);
  points -= def.cost;
  updateHUD();
}

function spawnDanger() {
  const kind = DANGER_KIND_NAMES[Math.floor(Math.random() * DANGER_KIND_NAMES.length)];
  const def = CONFIG.dangers.kinds[kind];
  let r;
  let c;
  if (def.type === 'mobile') {
    const entry = entries[Math.floor(Math.random() * entries.length)];
    r = entry[0];
    c = entry[1];
  } else {
    const pathCells = [];
    for (let rr = 0; rr < GRID_ROWS; rr++) {
      for (let cc = 0; cc < GRID_COLS; cc++) {
        const t = grid[rr][cc];
        if ((t === CellType.PATH || t === CellType.SPLIT) && !isBlocked(rr, cc)) {
          pathCells.push([rr, cc]);
        }
      }
    }
    if (pathCells.length === 0) return;
    [r, c] = pathCells[Math.floor(Math.random() * pathCells.length)];
  }
  const danger = new Danger(kind, r, c);
  const { x, y } = cellCenter(r, c);
  danger.sprite = add([
    circle(TRAVELER_RADIUS),
    color(danger.color),
    outline(2, '#000000'),
    pos(x, y),
    anchor('center'),
  ]);
  danger.label = add([
    text(danger.letter, { size: TRAVELER_TEXT_SIZE }),
    color('#ffffff'),
    pos(x, y),
    anchor('center'),
  ]);
  dangers.push(danger);
}

function removeDanger(i) {
  const danger = dangers[i];
  danger.sprite.destroy();
  danger.label.destroy();
  dangers.splice(i, 1);
}

function repositionDanger(danger) {
  const { x, y } = cellCenter(danger.r, danger.c);
  danger.sprite.pos = vec2(x, y);
  danger.label.pos = vec2(x, y);
}

function stepMobileDanger(danger) {
  const def = CONFIG.dangers.kinds[danger.kind];
  if (def.onPath) {
    const out = next[danger.r][danger.c];
    if (out.length > 0) [danger.r, danger.c] = out[Math.floor(Math.random() * out.length)];
  } else {
    const options = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      .map(([dr, dc]) => [danger.r + dr, danger.c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS);
    if (options.length > 0) [danger.r, danger.c] = options[Math.floor(Math.random() * options.length)];
  }
  repositionDanger(danger);
}

function manhattan(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

function applyTowerEffects() {
  for (const tower of towers) {
    if (tower.kind === 'hostel') {
      for (const traveler of travelers) {
        if (traveler.usesEnergy && manhattan(tower, traveler) <= CONFIG.towers.range) {
          traveler.energy = CONFIG.energy.start;
        }
      }
    } else if (tower.kind === 'guard') {
      for (let i = dangers.length - 1; i >= 0; i--) {
        if (dangers[i].type === 'mobile' && manhattan(tower, dangers[i]) <= CONFIG.towers.range) {
          removeDanger(i);
        }
      }
    } else if (tower.kind === 'engineer') {
      for (let i = dangers.length - 1; i >= 0; i--) {
        if (dangers[i].type === 'static' && manhattan(tower, dangers[i]) <= CONFIG.towers.range) {
          removeDanger(i);
        }
      }
    } else if (tower.kind === 'medical') {
      for (const traveler of travelers) {
        if (manhattan(tower, traveler) <= CONFIG.towers.range) {
          traveler.wounded = false;
          traveler.sick = false;
          traveler.sickFor = 0;
        }
      }
    }
  }
}

let plagueTimer = 0;
let hungerTimer = 0;

function handleStatusEvents(delta) {
  plagueTimer += delta;
  if (plagueTimer >= CONFIG.dangers.plagueInterval) {
    plagueTimer = 0;
    const candidates = travelers.filter((t) => !t.sick);
    if (candidates.length > 0) {
      candidates[Math.floor(Math.random() * candidates.length)].sick = true;
    }
  }
  hungerTimer += delta;
  if (hungerTimer >= CONFIG.dangers.hungerInterval) {
    hungerTimer = 0;
    for (const traveler of travelers) {
      if (traveler.usesEnergy) traveler.energy -= CONFIG.dangers.hungerDrain;
    }
  }
}

function spreadPlague() {
  const toInfect = new Set();
  for (const traveler of travelers) {
    if (!traveler.sick) continue;
    for (const other of travelers) {
      if (other === traveler || other.sick) continue;
      if (Math.abs(other.r - traveler.r) + Math.abs(other.c - traveler.c) <= 1) {
        if (Math.random() < CONFIG.dangers.plagueSpreadChance) toInfect.add(other);
      }
    }
  }
  for (const traveler of toInfect) traveler.sick = true;
}

function endGame(win) {
  gameOver = true;
  won = win;
  const endScreen = document.getElementById('end-screen');
  if (endScreen) {
    endScreen.style.display = 'block';
    const msg = document.getElementById('end-message');
    if (msg) msg.textContent = win
      ? 'You kept the travelers safe. Victory!'
      : 'Too many travelers were lost.';
  }
}

// ---- Palette and input -----------------------------------------------------

function setupPalette() {
  const palette = document.getElementById('tower-palette');
  if (!palette) return;
  for (const kind of TOWER_KIND_NAMES) {
    const def = CONFIG.towers.kinds[kind];
    const btn = document.createElement('button');
    btn.textContent = `${def.letter} ${kind} (${def.cost})`;
    btn.dataset.kind = kind;
    btn.addEventListener('click', () => {
      armedTower = armedTower === kind ? null : kind;
      updateHUD();
    });
    palette.appendChild(btn);
  }
}

onClick(() => {
  if (gameOver || !armedTower) return;
  const p = mousePos();
  const c = Math.floor(p.x / CELL_SIZE);
  const r = Math.floor(p.y / CELL_SIZE);
  if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return;
  if (grid[r][c] === CellType.BUILD_SITE) {
    placeTower(armedTower, r, c);
  } else {
    armedTower = null;
    updateHUD();
  }
});

onKeyPress('escape', () => {
  armedTower = null;
  updateHUD();
});

// ---- Main loop -------------------------------------------------------------

spawnTraveler();
let spawnTimer = 0;
let dangerSpawnTimer = 0;

onUpdate(() => {
  const delta = dt();
  if (gameOver) return;

  spawnTimer += delta;
  if (spawnTimer >= CONFIG.spawn.interval) {
    spawnTimer = 0;
    spawnTraveler();
  }

  dangerSpawnTimer += delta;
  if (dangerSpawnTimer >= CONFIG.dangers.spawnInterval) {
    dangerSpawnTimer = 0;
    spawnDanger();
  }

  handleStatusEvents(delta);

  // Move travelers: score on exit, or step along an unblocked edge.
  for (let i = travelers.length - 1; i >= 0; i--) {
    const traveler = travelers[i];
    traveler.timer += delta;
    if (traveler.timer < traveler.effectiveMoveInterval) continue;
    traveler.timer = 0;
    const out = next[traveler.r][traveler.c];
    if (out.length === 0) {
      points += traveler.pointValue;
      removeTraveler(i);
      continue;
    }
    const options = out.filter(([nr, nc]) => !isBlocked(nr, nc));
    if (options.length === 0) continue;
    [traveler.r, traveler.c] = options[Math.floor(Math.random() * options.length)];
    if (traveler.usesEnergy) traveler.energy -= CONFIG.energy.perStep;
    reposition(traveler);
  }

  // Age and expire travelers (energy depletion, sickness).
  for (let i = travelers.length - 1; i >= 0; i--) {
    const traveler = travelers[i];
    if (traveler.sick) traveler.sickFor += delta;
    if (traveler.isExpired) {
      lives -= 1;
      removeTraveler(i);
    }
  }

  // Move mobile dangers and wound travelers they touch.
  for (const danger of dangers) {
    if (danger.type !== 'mobile') continue;
    danger.moveTimer += delta;
    const def = CONFIG.dangers.kinds[danger.kind];
    if (danger.moveTimer >= def.moveInterval) {
      danger.moveTimer = 0;
      stepMobileDanger(danger);
    }
    for (const traveler of travelers) {
      if (traveler.r === danger.r && traveler.c === danger.c) traveler.wounded = true;
    }
  }

  // Recede timed static dangers.
  for (let i = dangers.length - 1; i >= 0; i--) {
    const danger = dangers[i];
    if (danger.type !== 'static') continue;
    danger.age += delta;
    if (danger.age >= CONFIG.dangers.kinds[danger.kind].duration) removeDanger(i);
  }

  spreadPlague();
  applyTowerEffects();

  if (lives <= 0) {
    endGame(false);
    return;
  }
  if (spawnCount >= CONFIG.endgame.winAfterSpawns) {
    endGame(true);
    return;
  }

  updateHUD();
});

setupPalette();
updateHUD();
