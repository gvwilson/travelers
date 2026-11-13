// Central tuning: every gameplay number lives here so playtesting tweaks are
// one-line edits (PLAN.md "centralized tuning" / "endgame-tuning").
export const CONFIG = Object.freeze({
  grid: { rows: 15, cols: 21, cellSize: 48 },

  points: { start: 100 },

  spawn: { interval: 1.0 },

  traveler: {
    courier:  { letter: 'C', moveInterval: 0.6, usesEnergy: false, pointValue: 1, color: '#29b6f6' },
    merchant: { letter: 'M', moveInterval: 1.0, usesEnergy: true,  pointValue: 2, color: '#ffca28' },
    pilgrim:  { letter: 'P', moveInterval: 0.9, usesEnergy: false, pointValue: 1, color: '#66bb6a' },
    refugee:  { letter: 'R', moveInterval: 0.8, usesEnergy: true,  pointValue: 1, color: '#ef5350' },
    tourist:  { letter: 'T', moveInterval: 1.5, usesEnergy: false, pointValue: 1, color: '#ab47bc' },
  },

  energy: { start: 10, perStep: 1, slowThreshold: 3, slowFactor: 2 },

  status: { woundedSlowFactor: 2, sickTimeToExpire: 10 },

  towers: {
    range: 3,
    kinds: {
      engineer: { letter: 'E', cost: 75, color: '#00bcd4' },
      guard:    { letter: 'G', cost: 60, color: '#ff5722' },
      hostel:   { letter: 'H', cost: 50, color: '#ffc107' },
      medical:  { letter: 'A', cost: 60, color: '#26a69a' },
    },
  },

  dangers: {
    spawnInterval: 4.0,
    plagueInterval: 9.0,
    plagueSpreadChance: 0.4,
    hungerInterval: 7.0,
    hungerDrain: 1,
    kinds: {
      bandit:          { letter: 'B', color: '#e53935', type: 'mobile', onPath: true,  moveInterval: 1.6 },
      wildAnimal:      { letter: 'W', color: '#795548', type: 'mobile', onPath: false, moveInterval: 1.2 },
      flood:           { letter: 'F', color: '#1e88e5', type: 'static', duration: 8 },
      collapsedBridge: { letter: 'X', color: '#546e7a', type: 'static', duration: Infinity },
    },
  },

  endgame: { startLives: 10, winAfterSpawns: 40 },
});
