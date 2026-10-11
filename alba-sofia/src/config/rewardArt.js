// The planets shown on the "level cleared" screen that follows each of the
// first two conversations: a ringed red planet after level 1 and a purple
// planet with a city on it after level 2. Each is drawn at a fixed size
// around (0, 0) into a container the scene positions and scales.
import { COLORS, PROP_COLORS } from '../shared.js';
import { mix } from './art.js';
import { disc } from './backdrops.js';

export const ART_WIDTH = 220;
export const ART_HEIGHT = 150;

const PX = 4; // one chunky pixel

// A Mars-like planet, cratered and ice-capped, with a tilted ring that passes
// behind it at the top and in front of it at the bottom.
export function drawRingedPlanet(scene, into) {
  const g = scene.add.graphics();
  const r = 50;
  const dark = mix(COLORS.red, COLORS.background, 0.6);
  const tilt = -0.32;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  // Where (mx, my) falls across the ring: 1 is its outer edge, and `side` is
  // negative for the half that passes behind the planet.
  const across = (mx, my) => {
    const along = mx * cos + my * sin;
    const side = -mx * sin + my * cos;
    return { band: (along / (r * 2.05)) ** 2 + (side / (r * 0.5)) ** 2, side };
  };
  const ring = (from, to, front) => (mx, my) => {
    const { band, side } = across(mx, my);
    return band >= from && band < to && side >= 0 === front;
  };
  const drawRing = (front) => {
    const fade = front ? 0 : 0.35; // the far half sits a little in shadow
    disc(g, 0, 0, r * 2.1, PX, mix(COLORS.gold, COLORS.background, fade), { test: ring(0.5, 0.7, front) });
    disc(g, 0, 0, r * 2.1, PX, mix(COLORS.offWhite, COLORS.background, fade), { test: ring(0.78, 1, front) });
  };

  drawRing(false);
  disc(g, 0, 0, r, PX, COLORS.red, { shadeColor: dark });
  // Dust bands, craters and a polar cap.
  disc(g, 0, 0, r, PX, mix(COLORS.red, COLORS.gold, 0.4), { alpha: 0.55, test: (mx, my) => my > -22 && my < -12 && mx < 26 });
  disc(g, 0, 0, r, PX, dark, { alpha: 0.5, test: (mx, my) => my > 8 && my < 16 + mx * 0.08 });
  [[-22, -4, 9], [10, -26, 6], [18, 24, 8], [-10, 30, 5]].forEach(([dx, dy, cr]) => {
    disc(g, dx, dy, cr, PX, mix(COLORS.red, COLORS.background, 0.45));
    disc(g, dx - 2, dy - 2, cr * 0.5, PX, mix(COLORS.red, COLORS.background, 0.7));
  });
  disc(g, 0, 0, r, PX, COLORS.offWhite, { test: (mx, my) => my < -r * 0.8 + Math.abs(mx) * 0.12 });
  drawRing(true);

  // A small moon, off to one side.
  disc(g, 88, -50, 8, PX, COLORS.offWhite, { shadeColor: COLORS.mutedPurple });
  into.add(g);
}

// A purple planet with a futuristic city: a skyline of lit towers standing on
// its horizon, and the lights of more city spread over its dark side.
export function drawCityPlanet(scene, into) {
  const g = scene.add.graphics();
  const r = 50;
  const cy = 22; // the planet sits low, leaving the sky above it to the towers
  const blue = mix(COLORS.cyan, COLORS.mutedPurple, 0.45);
  const pink = mix(PROP_COLORS.pigPink, COLORS.red, 0.2);
  const lilac = mix(COLORS.mutedPurple, COLORS.offWhite, 0.4);
  const horizon = (x) => cy - Math.sqrt(Math.max(0, r * r - x * x));

  // [left edge, width, height above the horizon, colour, has a spire]
  const towers = [
    [-40, 8, 12, lilac],
    [-32, 8, 24, blue],
    [-24, 12, 36, pink, true],
    [-12, 8, 20, lilac],
    [-4, 12, 46, blue, true],
    [8, 8, 30, pink],
    [16, 12, 38, lilac, true],
    [28, 8, 22, blue],
    [36, 8, 10, pink],
  ];
  towers.forEach(([x, w, h, color, spire]) => {
    const base = Math.round(Math.max(horizon(x), horizon(x + w)) / PX) * PX;
    const top = base - h;
    g.fillStyle(color, 1);
    g.fillRect(x, top, w, h + 12); // runs on down behind the planet's edge
    g.fillStyle(mix(color, COLORS.background, 0.45), 1);
    g.fillRect(x + w - PX, top, PX, h + 12); // shaded side
    g.fillStyle(COLORS.gold, 1);
    // Lit windows: one column, or two staggered ones on the wide towers.
    for (let wy = top + PX, i = 0; wy < base - PX; wy += PX * 2, i += 1) {
      g.fillRect(x + (w > 8 && i % 2 ? PX : 0), wy, PX, PX);
    }
    if (spire) {
      g.fillStyle(color, 1);
      g.fillRect(x + w / 2 - PX / 2, top - 12, PX, 12);
      g.fillStyle(COLORS.cyan, 1);
      g.fillRect(x + w / 2 - PX / 2, top - 16, PX, PX);
    }
  });

  disc(g, 0, cy, r, PX, COLORS.mutedPurple, { shadeColor: mix(COLORS.mutedPurple, COLORS.background, 0.6) });
  // Bands of cloud, then the grid of streets glowing through them.
  disc(g, 0, cy, r, PX, lilac, { alpha: 0.5, test: (mx, my) => my > -30 && my < -22 && mx < 20 });
  disc(g, 0, cy, r, PX, pink, { alpha: 0.4, test: (mx, my) => my > 2 && my < 10 });
  disc(g, 0, cy, r, PX, COLORS.background, { alpha: 0.35, test: (mx, my) => my > 22 && my < 30 });
  const lights = [
    [-30, -8, COLORS.gold], [-22, -12, COLORS.cyan], [-14, -8, COLORS.gold], [-18, 0, COLORS.gold],
    [-2, -14, COLORS.gold], [6, -6, COLORS.cyan], [14, -10, COLORS.gold], [22, 14, COLORS.gold],
    [26, -2, COLORS.gold], [10, 18, COLORS.cyan], [-6, 14, COLORS.gold], [-26, 18, COLORS.cyan],
    [18, 30, COLORS.gold], [30, 22, COLORS.cyan], [2, 34, COLORS.gold], [-14, 32, COLORS.gold],
    [34, 10, COLORS.gold], [-34, 6, COLORS.gold],
  ];
  lights.forEach(([x, y, color]) => {
    g.fillStyle(color, 1);
    g.fillRect(x, cy + y, PX, PX);
  });

  // A ship's lights crossing the sky.
  g.fillStyle(COLORS.cyan, 1);
  g.fillRect(72, -44, 8, PX);
  g.fillStyle(COLORS.offWhite, 1);
  g.fillRect(80, -44, PX, PX);
  into.add(g);
}
