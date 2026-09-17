// Simple flat parallax-strip background textures (GAME_SPEC.md §4), tiled via
// Phaser tileSprite for the scrolling side-scroller levels.
//
// Textures are generated on demand, sized to the SCENE's actual height at the
// time they're requested (not a fixed constant) — the game now runs at
// whatever resolution fills the device viewport (portrait phones included,
// see main.js), so a hardcoded height would make these tile vertically and
// repeat their gradient bands. Each size gets its own cached texture key.

import { makeTexture } from './pixelArt.js';
import { COLORS, PROP_COLORS } from './palette.js';

const TILE_WIDTH = 96;
const GROUND_SIZE = { width: 64, height: 24 };

function drawSky(g, height) {
  g.fillStyle(COLORS.background, 1);
  g.fillRect(0, 0, TILE_WIDTH, height);
  g.fillStyle(PROP_COLORS.sky, 1);
  g.fillRect(0, height * 0.55, TILE_WIDTH, height * 0.3);
  g.fillStyle(PROP_COLORS.skyLight, 1);
  g.fillRect(0, height * 0.82, TILE_WIDTH, height * 0.18);
  // scattered "stars" / sparkle dots, spread across the upper two-thirds —
  // original positions were authored against a 540px-tall canvas, so they're
  // stored here as fractions of height (x stays absolute: it's just tiling width).
  g.fillStyle(COLORS.cyan, 1);
  [
    [10, 30], [40, 70], [70, 20], [20, 120], [60, 160],
    [85, 100], [15, 220], [55, 260], [30, 320], [75, 300],
  ].forEach(([x, y]) => {
    g.fillRect(x, (y / 540) * height, 4, 4);
  });
  g.fillStyle(COLORS.gold, 1);
  [
    [25, 50], [65, 140], [45, 200], [80, 240], [10, 280],
  ].forEach(([x, y]) => {
    g.fillRect(x, (y / 540) * height, 4, 4);
  });
}

function drawGround(g) {
  g.fillStyle(PROP_COLORS.brown, 1);
  g.fillRect(0, 0, GROUND_SIZE.width, GROUND_SIZE.height);
  g.fillStyle(COLORS.mutedPurple, 1);
  g.fillRect(0, 0, GROUND_SIZE.width, 6);
  g.fillStyle(COLORS.gold, 1);
  for (let x = 0; x < GROUND_SIZE.width; x += 16) {
    g.fillRect(x, GROUND_SIZE.height / 2 - 1, 8, 2);
  }
}

// Full-screen sky-over-road backdrop for Level 2's "hold to advance" stages
// (car, camper van) — same full-height approach as drawSky so it tiles cleanly
// horizontally without repeating bands vertically.
function drawRoadScene(g, height) {
  drawSky(g, height);
  g.fillStyle(PROP_COLORS.brown, 1);
  g.fillRect(0, height * 0.88, TILE_WIDTH, height * 0.12);
  g.fillStyle(COLORS.gold, 1);
  for (let x = 0; x < TILE_WIDTH; x += 20) {
    g.fillRect(x, height * 0.93, 10, 3);
  }
}

function drawOcean(g, height) {
  g.fillStyle(COLORS.background, 1);
  g.fillRect(0, 0, TILE_WIDTH, height * 0.35);
  g.fillStyle(PROP_COLORS.sea, 1);
  g.fillRect(0, height * 0.35, TILE_WIDTH, height * 0.65);
  g.fillStyle(COLORS.offWhite, 1);
  const waveYs = [height * 0.42, height * 0.55, height * 0.7, height * 0.85];
  waveYs.forEach((y, row) => {
    const offset = row % 2 === 0 ? 0 : 12;
    for (let x = -offset; x < TILE_WIDTH; x += 24) {
      g.fillRect(x + offset, y, 10, 3);
    }
  });
}

const RECIPES = {
  sky: drawSky,
  ocean: drawOcean,
  'road-scene': drawRoadScene,
};

// Ground is a fixed small tile, independent of screen height — one texture,
// generated once and reused forever.
export function groundBgKey(scene) {
  return makeTexture(scene, 'bg-ground', drawGround, GROUND_SIZE);
}

// Sky/ocean/road-scene textures are exactly one screen tall so a tileSprite
// only ever repeats them horizontally. Keyed by name+height so switching
// device orientation (a new scene height) generates a fresh correctly-sized
// texture instead of stretching/tiling the old one.
export function bgKey(scene, name) {
  const height = Math.max(1, Math.round(scene.scale.height));
  const key = `bg-${name}-${height}`;
  return makeTexture(scene, key, (g) => RECIPES[name](g, height), { width: TILE_WIDTH, height });
}
