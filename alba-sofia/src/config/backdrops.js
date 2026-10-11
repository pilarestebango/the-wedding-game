// Layered, code-drawn backdrops for this game: deep space for level 1,
// the Mars wastelands for level 2 and the boss, and a plain starfield for the
// screens in between. Placeholder art like the rest (see art.js), but built as
// several parallax layers so the levels have depth.
//
// Every tone is a palette token or a blend of two (mix()), never a new hex.
// Layers are screen-sized tileSprites pinned to the camera; update() slides
// each one's tile position by a fraction of the camera's scroll, so far
// layers creep and near ones rush. Placement is seeded, so the scenery is the
// same on every visit.
import { COLORS, PROP_COLORS } from '../../../game/src/config/palette.js';
import { makeTexture } from '../../../game/src/config/pixelArt.js';
import { mix } from './art.js';

// mulberry32: small seeded PRNG, returns () => [0, 1).
function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const between = (rng, min, max) => min + rng() * (max - min);

// A filled circle out of chunky square pixels. `shade` (0-1) darkens the
// lower-right, `test` can veto individual cells (used to cut rings/craters).
export function disc(g, cx, cy, r, px, color, { alpha = 1, shadeColor, test } = {}) {
  for (let y = -r; y < r; y += px) {
    for (let x = -r; x < r; x += px) {
      const mx = x + px / 2;
      const my = y + px / 2;
      if (mx * mx + my * my > r * r) continue;
      if (test && !test(mx, my)) continue;
      const lit = (mx + r * 0.35) ** 2 + (my + r * 0.35) ** 2 < (r * 0.95) ** 2;
      g.fillStyle(shadeColor !== undefined && !lit ? shadeColor : color, alpha);
      g.fillRect(Math.round(cx + x), Math.round(cy + y), px, px);
    }
  }
}

const sceneHeight = (scene) => Math.max(1, Math.round(scene.scale.height));

// ---------------------------------------------------------------- space ----

const STAR_COLORS = [COLORS.offWhite, COLORS.offWhite, COLORS.cyan, COLORS.gold, COLORS.mutedPurple];
const NEBULA_COLORS = [COLORS.mutedPurple, PROP_COLORS.pigPink, COLORS.cyan];

function drawStars(g, rng, width, height, count) {
  for (let i = 0; i < count; i += 1) {
    const size = rng() < 0.7 ? 2 : rng() < 0.7 ? 3 : 4;
    g.fillStyle(pick(rng, STAR_COLORS), size === 2 ? between(rng, 0.35, 0.8) : 1);
    g.fillRect(Math.floor(rng() * (width - size)), Math.floor(rng() * (height - size)), size, size);
  }
}

// Soft clouds built from many faint overlapping squares.
function drawNebulae(g, rng, width, height, count) {
  for (let n = 0; n < count; n += 1) {
    const cx = between(rng, width * 0.15, width * 0.85);
    const cy = between(rng, height * 0.1, height * 0.8);
    const color = pick(rng, NEBULA_COLORS);
    const reach = between(rng, 60, 120);
    for (let i = 0; i < 60; i += 1) {
      const size = 8 * Math.ceil(between(rng, 1, 4));
      // Summing two randoms bunches the squares toward the cloud's middle.
      const dx = (rng() + rng() - 1) * reach;
      const dy = (rng() + rng() - 1) * reach * 0.6;
      g.fillStyle(color, 0.05);
      g.fillRect(Math.round((cx + dx) / 8) * 8, Math.round((cy + dy) / 8) * 8, size, size);
    }
  }
}

function starfieldKey(scene) {
  const height = sceneHeight(scene);
  const width = 640;
  return makeTexture(
    scene,
    `getaway-bg-starfield-${height}`,
    (g) => {
      const rng = seeded(7);
      g.fillStyle(COLORS.background, 1);
      g.fillRect(0, 0, width, height);
      drawNebulae(g, rng, width, height, 4);
      drawStars(g, rng, width, height, Math.round(height * 0.3));
    },
    { width, height },
  );
}

function planetsKey(scene) {
  const height = sceneHeight(scene);
  const width = 1600;
  return makeTexture(
    scene,
    `getaway-bg-planets-${height}`,
    (g) => {
      // A ringed gas giant, high up.
      const gx = 330;
      const gy = height * 0.27;
      const gr = 48;
      const ring = (mx, my) => Math.abs((mx / (gr * 2)) ** 2 + (my / (gr * 0.42)) ** 2 - 1) < 0.22;
      disc(g, gx, gy, gr * 2.2, 4, COLORS.mutedPurple, { test: (mx, my) => ring(mx, my) && my < 0 });
      disc(g, gx, gy, gr, 4, COLORS.gold, { shadeColor: mix(COLORS.gold, COLORS.background, 0.55) });
      disc(g, gx, gy, gr, 4, COLORS.red, { alpha: 0.35, test: (_mx, my) => Math.floor((my + gr) / 12) % 3 === 0 });
      disc(g, gx, gy, gr * 2.2, 4, COLORS.offWhite, { test: (mx, my) => ring(mx, my) && my >= 0 });

      // A cratered red planet.
      const rx = 1010;
      const ry = height * 0.5;
      disc(g, rx, ry, 34, 4, COLORS.red, { shadeColor: mix(COLORS.red, COLORS.background, 0.6) });
      [[-12, -8, 7], [10, 6, 9], [-4, 16, 5]].forEach(([dx, dy, r]) => {
        disc(g, rx + dx, ry + dy, r, 4, mix(COLORS.red, COLORS.background, 0.4));
      });

      // A small cyan moon.
      disc(g, 1370, height * 0.16, 16, 4, COLORS.cyan, { shadeColor: mix(COLORS.cyan, COLORS.background, 0.6) });
    },
    { width, height },
  );
}

function asteroidsKey(scene) {
  const height = sceneHeight(scene);
  const width = 1100;
  return makeTexture(
    scene,
    `getaway-bg-asteroids-${height}`,
    (g) => {
      const rng = seeded(21);
      const rock = mix(PROP_COLORS.brown, COLORS.mutedPurple, 0.45);
      for (let i = 0; i < 16; i += 1) {
        const r = between(rng, 6, 18);
        const x = between(rng, 40, width - 40);
        const y = between(rng, 60, height - 40);
        disc(g, x, y, r, 3, rock, { shadeColor: mix(rock, COLORS.background, 0.6) });
        disc(g, x - r * 0.25, y - r * 0.2, r * 0.3, 3, mix(rock, COLORS.background, 0.45));
      }
    },
    { width, height },
  );
}

// --------------------------------------------------------------- mars -----

const MARS = {
  far: mix(COLORS.background, COLORS.red, 0.3),
  farEdge: mix(COLORS.background, COLORS.red, 0.45),
  mid: mix(COLORS.background, COLORS.red, 0.55),
  midEdge: mix(COLORS.red, COLORS.gold, 0.25),
  midDark: mix(COLORS.background, COLORS.red, 0.4),
  near: mix(PROP_COLORS.brown, COLORS.background, 0.45),
  nearEdge: mix(PROP_COLORS.brown, COLORS.red, 0.5),
  plant: mix(COLORS.mutedPurple, COLORS.background, 0.45),
  soilDark: mix(PROP_COLORS.brown, COLORS.background, 0.4),
  soilLight: mix(PROP_COLORS.brown, COLORS.gold, 0.25),
};

// Sky: clear and starry at the top, stepping down into a red dust haze with a
// thin glowing line at the horizon. One texture, exactly as tall as the sky.
function marsSkyKey(scene, groundY) {
  const height = Math.max(1, Math.round(groundY));
  const width = 640;
  return makeTexture(
    scene,
    `getaway-bg-mars-sky-${height}`,
    (g) => {
      const rng = seeded(3);
      g.fillStyle(COLORS.background, 1);
      g.fillRect(0, 0, width, height);
      drawStars(g, rng, width, height * 0.45, Math.round(height * 0.12));

      const hazeTop = height * 0.3;
      const bands = 12;
      const bandHeight = (height - hazeTop) / bands;
      for (let i = 0; i < bands; i += 1) {
        const y = Math.round(hazeTop + i * bandHeight);
        const tone = mix(COLORS.background, COLORS.red, ((i + 1) / bands) * 0.5);
        g.fillStyle(tone, 1);
        g.fillRect(0, y, width, Math.ceil(bandHeight) + 1);
        // A dithered row softens each step into the one above it.
        for (let x = (i % 2) * 4; x < width; x += 8) g.fillRect(x, y - 4, 4, 4);
      }
      g.fillStyle(mix(COLORS.red, COLORS.gold, 0.35), 0.5);
      g.fillRect(0, height - 6, width, 6);
      for (let x = 0; x < width; x += 8) g.fillRect(x, height - 10, 4, 4);
    },
    { width, height },
  );
}

const SUN_SIZE = 120;

function marsSunKey(scene) {
  return makeTexture(
    scene,
    'getaway-bg-mars-sun',
    (g) => {
      const c = SUN_SIZE / 2;
      // Solid rings, not translucent ones: a faint fill on a transparent
      // texture comes out as a dark smudge against the haze.
      disc(g, c, c, 30, 4, mix(COLORS.red, COLORS.gold, 0.5));
      disc(g, c, c, 26, 4, COLORS.gold);
      disc(g, c, c, 20, 4, COLORS.offWhite);
    },
    { width: SUN_SIZE, height: SUN_SIZE },
  );
}

function marsMoonKey(scene) {
  return makeTexture(
    scene,
    'getaway-bg-mars-moon',
    (g) => {
      const tone = mix(COLORS.mutedPurple, COLORS.offWhite, 0.25);
      disc(g, 20, 20, 18, 4, tone, { shadeColor: mix(tone, COLORS.background, 0.6) });
      disc(g, 14, 16, 5, 4, mix(tone, COLORS.background, 0.35));
    },
    { width: 40, height: 40 },
  );
}

// Far mountain range: a few sine waves whose periods divide the tile width,
// so the ridge line wraps without a seam, snapped to chunky steps.
const FAR_SIZE = { width: 1024, height: 200 };

function marsFarKey(scene) {
  const { width, height } = FAR_SIZE;
  return makeTexture(
    scene,
    'getaway-bg-mars-far',
    (g) => {
      const rng = seeded(11);
      const waves = [[3, 34], [7, 22], [13, 12], [29, 6]].map(([cycles, amp]) => ({ cycles, amp, phase: rng() * Math.PI * 2 }));
      for (let x = 0; x < width; x += 8) {
        const raw = waves.reduce((sum, w) => sum + Math.sin((x / width) * Math.PI * 2 * w.cycles + w.phase) * w.amp, 110);
        const h = Math.round(raw / 8) * 8;
        g.fillStyle(MARS.far, 1);
        g.fillRect(x, height - h, 8, h);
        g.fillStyle(MARS.farEdge, 1);
        g.fillRect(x, height - h, 8, 4);
      }
    },
    FAR_SIZE,
  );
}

// Mid distance: flat-topped mesas with stepped shoulders and rock strata.
const MID_SIZE = { width: 1400, height: 150 };

function marsMidKey(scene) {
  const { width, height } = MID_SIZE;
  return makeTexture(
    scene,
    'getaway-bg-mars-mid',
    (g) => {
      const rng = seeded(5);
      const slab = (x, w, h) => {
        g.fillStyle(MARS.mid, 1);
        g.fillRect(x, height - h, w, h);
        g.fillStyle(MARS.midEdge, 1);
        g.fillRect(x, height - h, w, 4);
        g.fillStyle(MARS.midDark, 1);
        for (let y = height - h + 16; y < height; y += 18) g.fillRect(x + 4, y, w - 8, 3);
      };
      // Evenly spread with jitter, and kept off the edges so none is cut by the tile seam.
      const count = 6;
      for (let i = 0; i < count; i += 1) {
        const w = Math.round(between(rng, 70, 190) / 4) * 4;
        const h = Math.round(between(rng, 50, 130) / 4) * 4;
        const x = Math.round((60 + (i + rng() * 0.5) * ((width - 320) / count)) / 4) * 4;
        slab(x - 28, w + 56, Math.round((h * 0.3) / 4) * 4);
        slab(x - 12, w + 24, Math.round((h * 0.65) / 4) * 4);
        slab(x, w, h);
      }
    },
    MID_SIZE,
  );
}

// Foreground, right on the ground line: boulders and spiky alien plants.
const NEAR_SIZE = { width: 900, height: 72 };

function marsNearKey(scene) {
  const { width, height } = NEAR_SIZE;
  return makeTexture(
    scene,
    'getaway-bg-mars-near',
    (g) => {
      const rng = seeded(17);
      for (let i = 0; i < 9; i += 1) {
        const x = between(rng, 40, width - 40);
        if (rng() < 0.6) {
          const r = between(rng, 10, 26);
          disc(g, x, height, r, 4, MARS.nearEdge, { shadeColor: MARS.near, test: (_mx, my) => my < 0 });
        } else {
          // A spire: stacked blocks narrowing upward, with a couple of side spikes.
          const tall = Math.round(between(rng, 28, 64) / 4) * 4;
          for (let y = 0; y < tall; y += 4) {
            const w = Math.max(4, Math.round((12 * (1 - y / tall)) / 4) * 4);
            g.fillStyle(MARS.plant, 1);
            g.fillRect(Math.round(x - w / 2), height - y - 4, w, 4);
          }
          g.fillRect(Math.round(x) - 12, height - tall * 0.5, 8, 4);
          g.fillRect(Math.round(x) + 6, height - tall * 0.7, 8, 4);
        }
      }
    },
    NEAR_SIZE,
  );
}

export const MARS_GROUND_HEIGHT = 24;

function marsSurfaceKey(scene) {
  return makeTexture(
    scene,
    'getaway-mars-surface',
    (g) => {
      g.fillStyle(PROP_COLORS.brown, 1);
      g.fillRect(0, 0, 128, MARS_GROUND_HEIGHT);
      g.fillStyle(COLORS.red, 1);
      g.fillRect(0, 0, 128, 8);
      g.fillStyle(mix(COLORS.red, COLORS.gold, 0.3), 1);
      g.fillRect(0, 0, 128, 2);
      // Ragged lower edge of the red crust, then pebbles.
      g.fillStyle(COLORS.red, 1);
      [[4, 12], [28, 8], [52, 16], [84, 8], [104, 12]].forEach(([x, w]) => g.fillRect(x, 8, w, 4));
      g.fillStyle(MARS.soilDark, 1);
      [[14, 16, 8], [44, 14, 12], [70, 18, 8], [98, 16, 12], [120, 14, 8]].forEach(([x, y, w]) => g.fillRect(x, y, w, 4));
    },
    { width: 128, height: MARS_GROUND_HEIGHT },
  );
}

function marsSoilKey(scene) {
  return makeTexture(
    scene,
    'getaway-mars-soil',
    (g) => {
      const rng = seeded(9);
      g.fillStyle(PROP_COLORS.brown, 1);
      g.fillRect(0, 0, 128, 64);
      for (let i = 0; i < 22; i += 1) {
        g.fillStyle(pick(rng, [MARS.soilDark, MARS.soilDark, MARS.soilLight, COLORS.red]), 1);
        const w = 4 * Math.ceil(between(rng, 0.5, 3));
        g.fillRect(Math.floor(between(rng, 0, 31)) * 4, Math.floor(between(rng, 0, 15)) * 4, w, 4);
      }
    },
    { width: 128, height: 64 },
  );
}

// ------------------------------------------------------------ assembly ----

// A screen-sized strip pinned to the camera; `factor` is how much of the
// camera's scroll it follows (0 = fixed like the sky, 1 = moves with the level).
function addLayer(scene, key, { factor, y = 0, height, drift = 0 }) {
  const strip = scene.add.tileSprite(0, y, scene.scale.width, height, key).setOrigin(0, 0).setScrollFactor(0);
  strip.parallax = factor;
  strip.drift = drift; // px/s of its own motion, so the scene isn't frozen when the player stands still
  return strip;
}

function makeBackdrop(scene, layers) {
  return {
    update() {
      const scroll = scene.cameras.main.scrollX;
      const seconds = scene.time.now / 1000;
      layers.forEach((strip) => {
        strip.tilePositionX = scroll * strip.parallax + seconds * strip.drift;
      });
    },
  };
}

function addTwinkles(scene, maxY) {
  const rng = seeded(41);
  const { width } = scene.scale;
  for (let i = 0; i < 10; i += 1) {
    const star = scene.add
      .rectangle(rng() * width, rng() * maxY, 4, 4, pick(rng, [COLORS.offWhite, COLORS.cyan, COLORS.gold]))
      .setScrollFactor(0);
    scene.tweens.add({ targets: star, alpha: 0.1, duration: between(rng, 500, 1400), yoyo: true, repeat: -1, delay: rng() * 1000 });
  }
}

// Stars and nebulae only — for the screens between levels.
export function addStarfield(scene) {
  const strip = addLayer(scene, starfieldKey(scene), { factor: 0, height: scene.scale.height, drift: 4 });
  addTwinkles(scene, scene.scale.height);
  return makeBackdrop(scene, [strip]);
}

// Level 1: starfield, far planets, nearer drifting asteroids, shooting stars.
export function addSpaceBackdrop(scene) {
  const { width, height } = scene.scale;
  const layers = [
    addLayer(scene, starfieldKey(scene), { factor: 0.04, height, drift: 3 }),
    addLayer(scene, planetsKey(scene), { factor: 0.12, height }),
    addLayer(scene, asteroidsKey(scene), { factor: 0.3, height, drift: 10 }),
  ];
  addTwinkles(scene, height);

  scene.time.addEvent({
    delay: 3200,
    loop: true,
    callback: () => {
      const streak = scene.add
        .rectangle(Math.random() * width, Math.random() * height * 0.4, 28, 3, COLORS.offWhite)
        .setScrollFactor(0)
        .setRotation(0.5)
        .setDepth(-1);
      scene.tweens.add({
        targets: streak,
        x: streak.x + 260,
        y: streak.y + 140,
        alpha: 0,
        duration: 650,
        onComplete: () => streak.destroy(),
      });
    },
  });
  return makeBackdrop(scene, layers);
}

// Level 2 and the boss: hazy sky with a sun and a moon, mountains, mesas and
// foreground rocks, with dust blowing across.
export function addMarsBackdrop(scene, groundY) {
  const { width } = scene.scale;
  const layers = [addLayer(scene, marsSkyKey(scene, groundY), { factor: 0, height: groundY })];
  addTwinkles(scene, groundY * 0.35);
  scene.add.image(width * 0.78, groundY * 0.3, marsSunKey(scene)).setScrollFactor(0);
  scene.add.image(width * 0.2, groundY * 0.2, marsMoonKey(scene)).setScrollFactor(0);

  // Each band stands on the ground line. On a short screen they're squeezed
  // so the mountains don't climb into the HUD.
  const squeeze = Math.min(1, groundY / 460);
  [
    [marsFarKey(scene), FAR_SIZE, 0.1],
    [marsMidKey(scene), MID_SIZE, 0.3],
    [marsNearKey(scene), NEAR_SIZE, 0.65],
  ].forEach(([key, size, factor]) => {
    const strip = addLayer(scene, key, { factor, y: groundY - size.height * squeeze, height: size.height });
    strip.setScale(1, squeeze);
    layers.push(strip);
  });

  const rng = seeded(29);
  for (let i = 0; i < 8; i += 1) {
    const y = groundY * between(rng, 0.55, 0.98);
    const dust = scene.add.rectangle(width + 20, y, between(rng, 6, 16), 2, MARS.midEdge, 0.5).setScrollFactor(0);
    scene.tweens.add({ targets: dust, x: -20, duration: between(rng, 2600, 5200), repeat: -1, delay: rng() * 4000 });
  }
  return makeBackdrop(scene, layers);
}

// One stretch of Mars floor from `x`, `width` wide: a strip of crust along the
// top, textured soil down to the bottom of the screen, and the static body
// the player stands on (returned).
export function addMarsGround(scene, groundY, x, width) {
  const { height } = scene.scale;
  scene.add.tileSprite(x, groundY, width, height - groundY, marsSoilKey(scene)).setOrigin(0, 0);
  scene.add.tileSprite(x, groundY, width, MARS_GROUND_HEIGHT, marsSurfaceKey(scene)).setOrigin(0, 0);
  const body = scene.add.rectangle(x + width / 2, groundY + MARS_GROUND_HEIGHT / 2, width, MARS_GROUND_HEIGHT, 0, 0);
  scene.physics.add.existing(body, true);
  return body;
}

// Lava along the bottom of the level; the ground is drawn over it, so it only
// shows in the pits.
export function addLava(scene, groundY, worldWidth) {
  const { height } = scene.scale;
  const top = groundY + 30;
  scene.add.rectangle(0, groundY, worldWidth, height - groundY, mix(COLORS.background, COLORS.red, 0.25)).setOrigin(0, 0);
  scene.add.tileSprite(0, top, worldWidth, height - top, lavaKey(scene)).setOrigin(0, 0);
}

function lavaKey(scene) {
  return makeTexture(
    scene,
    'getaway-mars-lava',
    (g) => {
      g.fillStyle(COLORS.red, 1);
      g.fillRect(0, 0, 64, 64);
      g.fillStyle(mix(COLORS.red, COLORS.gold, 0.6), 1);
      g.fillRect(0, 0, 64, 4);
      [[8, 12, 16], [40, 20, 12], [20, 34, 20], [48, 48, 12], [4, 52, 12]].forEach(([x, y, w]) => g.fillRect(x, y, w, 4));
      g.fillStyle(COLORS.gold, 1);
      [[0, 0, 12], [28, 0, 8], [48, 0, 12]].forEach(([x, y, w]) => g.fillRect(x, y, w, 4));
    },
    { width: 64, height: 64 },
  );
}

// Rock ledge for level 2's platform tiers.
export const MARS_PLATFORM_HEIGHT = 20;

export function marsPlatformKey(scene) {
  return makeTexture(
    scene,
    'getaway-mars-platform',
    (g) => {
      // Lighter than the mesas behind it, with a bright lip, so a ledge
      // stands out from the scenery.
      g.fillStyle(PROP_COLORS.brown, 1);
      g.fillRect(0, 0, 32, MARS_PLATFORM_HEIGHT);
      g.fillStyle(COLORS.red, 1);
      g.fillRect(0, 0, 32, 6);
      g.fillStyle(mix(COLORS.red, COLORS.gold, 0.6), 1);
      g.fillRect(0, 0, 32, 2);
      g.fillStyle(MARS.soilDark, 1);
      g.fillRect(6, 10, 8, 4);
      g.fillRect(20, 14, 8, 4);
    },
    { width: 32, height: MARS_PLATFORM_HEIGHT },
  );
}

// ---------------------------------------------------------------- city ----
// The boss arena: a retro sci-fi city at dusk, after a reference picture the
// couple supplied — a black, starry sky with several big moons, a sunset
// burning purple -> red -> gold along the horizon, and a skyline of needle
// spires and domes with small yellow windows. Original code-drawn art in the
// site palette (every tone below is a mix of palette tokens).
//
// Two rows of towers only, the front one dark, so the player still reads
// clearly: earlier, busier versions (neon signs, billboards, traffic,
// searchlights) were too much to play against.

const SHADOW = 0x000000; // only ever mixed into a palette colour, to darken it
const BLUE = mix(COLORS.cyan, COLORS.mutedPurple, 0.55);
const MAGENTA = mix(PROP_COLORS.pigPink, COLORS.red, 0.35);
const CITY = {
  skyTop: mix(COLORS.background, SHADOW, 0.55),
  cloud: mix(COLORS.background, COLORS.mutedPurple, 0.22),
  window: COLORS.gold,
  // Tower colours for each row: the far row keeps some colour, the front
  // row is the same hues sunk most of the way into shadow.
  far: [BLUE, COLORS.mutedPurple, MAGENTA, mix(BLUE, COLORS.mutedPurple, 0.5)].map((c) => mix(c, COLORS.background, 0.55)),
  front: [BLUE, COLORS.mutedPurple, MAGENTA].map((c) => mix(mix(c, COLORS.background, 0.8), SHADOW, 0.25)),
  near: mix(COLORS.background, SHADOW, 0.5),
  metal: mix(COLORS.background, COLORS.mutedPurple, 0.45),
  metalDark: mix(COLORS.background, COLORS.mutedPurple, 0.25),
  metalLight: mix(COLORS.mutedPurple, COLORS.offWhite, 0.2),
};

// Sunset colour stops, from high in the sky down to the horizon.
const SUNSET = [
  CITY.skyTop,
  mix(COLORS.background, COLORS.mutedPurple, 0.3),
  mix(COLORS.mutedPurple, MAGENTA, 0.5),
  mix(MAGENTA, COLORS.red, 0.6),
  COLORS.red,
  mix(COLORS.red, COLORS.gold, 0.5),
  mix(COLORS.red, COLORS.gold, 0.85),
];

const snap4 = (v) => Math.round(v / 4) * 4;

function sunsetColor(t) {
  const scaled = Math.min(0.9999, Math.max(0, t)) * (SUNSET.length - 1);
  const i = Math.floor(scaled);
  return mix(SUNSET[i], SUNSET[i + 1], scaled - i);
}

function citySkyKey(scene, groundY) {
  const height = Math.max(1, Math.round(groundY));
  const width = 960;
  return makeTexture(
    scene,
    `getaway-bg-city-sky-${height}`,
    (g) => {
      const rng = seeded(101);
      g.fillStyle(CITY.skyTop, 1);
      g.fillRect(0, 0, width, height);

      // The sunset: stepped bands with a dithered row between each pair.
      const top = height * 0.34;
      const bands = 18;
      const bandHeight = (height - top) / bands;
      for (let i = 0; i < bands; i += 1) {
        const y = Math.round(top + i * bandHeight);
        g.fillStyle(sunsetColor((i + 1) / bands), 1);
        g.fillRect(0, y, width, Math.ceil(bandHeight) + 1);
        for (let x = (i % 2) * 4; x < width; x += 8) g.fillRect(x, y - 4, 4, 4);
      }

      // Long dark clouds lying across it.
      for (let i = 0; i < 16; i += 1) {
        const y = snap4(between(rng, height * 0.36, height * 0.78));
        const w = snap4(between(rng, 50, 180));
        const x = snap4(between(rng, 0, width - w));
        g.fillStyle(CITY.cloud, 1);
        g.fillRect(x, y, w, 4);
        g.fillRect(x + 12, y - 4, snap4(w * 0.6), 4);
        g.fillRect(x + 8, y + 4, snap4(w * 0.75), 4);
      }

      // Stars, thick at the top and thinning out into the glow.
      for (let i = 0; i < 420; i += 1) {
        const y = (rng() * rng()) * height * 0.75;
        const size = rng() < 0.75 ? 2 : rng() < 0.7 ? 3 : 4;
        g.fillStyle(pick(rng, [COLORS.offWhite, COLORS.offWhite, COLORS.cyan, PROP_COLORS.pigPink, COLORS.gold]), between(rng, 0.5, 1));
        g.fillRect(Math.floor(rng() * (width - size)), Math.floor(y), size, size);
      }
    },
    { width, height },
  );
}

// A moon: shaded, with a few craters.
function moonKey(scene, name, radius, color) {
  const size = radius * 2 + 8;
  return makeTexture(
    scene,
    `getaway-bg-city-moon-${name}`,
    (g) => {
      const rng = seeded(radius * 7);
      const c = size / 2;
      const px = radius > 30 ? 4 : 2;
      disc(g, c, c, radius, px, color, { shadeColor: mix(color, CITY.skyTop, 0.7) });
      for (let i = 0; i < Math.round(radius / 7); i += 1) {
        const angle = rng() * Math.PI * 2;
        const dist = rng() * radius * 0.6;
        disc(g, c + Math.cos(angle) * dist - radius * 0.15, c + Math.sin(angle) * dist - radius * 0.15, between(rng, radius * 0.08, radius * 0.2), px, mix(color, CITY.skyTop, 0.3));
      }
    },
    { width: size, height: size },
  );
}

// One row of towers as a tileable texture. Shapes do the work: slabs, stepped
// setbacks, domes, and tall needle spires, each in one of `colors`, with a lit
// left edge and a grid of small windows of which `windowChance` are on.
function skylineKey(scene, name, { seed, width, height, minW, maxW, minH, maxH, colors, windowChance, needle }) {
  return makeTexture(
    scene,
    `getaway-bg-city-${name}`,
    (g) => {
      const rng = seeded(seed);
      let x = 0;
      while (x < width) {
        let w = snap4(between(rng, minW, maxW));
        if (width - x - w < minW) w = width - x;
        // Mostly modest heights, with the occasional tower that dominates.
        const tall = rng() < 0.22;
        const h = snap4(tall ? between(rng, maxH * 0.7, maxH) : between(rng, minH, maxH * 0.6));
        const top = height - h;
        const cx = x + snap4(w / 2);
        const color = pick(rng, colors);
        const lit = mix(color, COLORS.offWhite, 0.18);
        const roof = tall ? pick(rng, ['needle', 'needle', 'setback']) : pick(rng, ['flat', 'dome', 'dome', 'setback', 'needle']);

        g.fillStyle(color, 1);
        g.fillRect(x, top, w, h);
        let peak = top;
        if (roof === 'setback' || roof === 'needle') {
          // Two narrowing tiers, then (for a needle) a long thin mast.
          const w1 = snap4(w * 0.66);
          const w2 = Math.max(4, snap4(w * 0.36));
          g.fillRect(cx - w1 / 2, top - 16, w1, 16);
          g.fillRect(cx - w2 / 2, top - 32, w2, 16);
          peak = top - 32;
          if (roof === 'needle') {
            const mast = snap4(between(rng, needle * 0.5, needle));
            g.fillRect(cx - 2, peak - 12, 4, 12);
            g.fillStyle(lit, 1);
            g.fillRect(cx - 1, peak - mast, 2, mast);
          }
        } else if (roof === 'dome') {
          disc(g, cx, top, snap4(w * 0.44), 4, color, { shadeColor: mix(color, SHADOW, 0.3), test: (_mx, my) => my < 0 });
        }
        g.fillStyle(lit, 1);
        g.fillRect(x, top, 2, h);

        if (windowChance > 0) {
          for (let wy = top + 8; wy < height - 8; wy += 8) {
            for (let wx = x + 6; wx < x + w - 6; wx += 6) {
              if (rng() >= windowChance) continue;
              g.fillStyle(CITY.window, between(rng, 0.45, 0.9));
              g.fillRect(wx, wy, 2, 4);
            }
          }
        }
        x += w;
      }
    },
    { width, height },
  );
}

const FAR_CITY = { seed: 61, width: 960, height: 400, minW: 24, maxW: 56, minH: 90, maxH: 300, colors: CITY.far, windowChance: 0.1, needle: 90 };
const FRONT_CITY = { seed: 73, width: 960, height: 300, minW: 44, maxW: 104, minH: 50, maxH: 220, colors: CITY.front, windowChance: 0.14, needle: 60 };

// The carpet of street lights at the foot of the city.
const LIGHTS_SIZE = { width: 640, height: 28 };

function cityLightsKey(scene) {
  const { width, height } = LIGHTS_SIZE;
  return makeTexture(
    scene,
    'getaway-bg-city-lights',
    (g) => {
      const rng = seeded(87);
      g.fillStyle(CITY.near, 1);
      g.fillRect(0, 8, width, height - 8);
      for (let x = 0; x < width; x += snap4(between(rng, 24, 70))) g.fillRect(x, 0, snap4(between(rng, 16, 40)), 8);
      for (let i = 0; i < 150; i += 1) {
        g.fillStyle(pick(rng, [COLORS.gold, COLORS.gold, COLORS.cyan, PROP_COLORS.pigPink]), between(rng, 0.4, 0.9));
        g.fillRect(Math.floor(rng() * width), 10 + Math.floor(rng() * (height - 12)), 2, 2);
      }
    },
    LIGHTS_SIZE,
  );
}

export function addCityBackdrop(scene, groundY) {
  const { width } = scene.scale;
  const layers = [addLayer(scene, citySkyKey(scene, groundY), { factor: 0, height: groundY })];
  addTwinkles(scene, groundY * 0.3);

  // Moons, sized to the screen so a phone gets the same composition.
  const unit = Math.min(1, width / 900);
  [
    ['big', 74, MAGENTA, 0.24, 0.3],
    ['blue', 46, BLUE, 0.86, 0.14],
    ['mid', 36, mix(MAGENTA, COLORS.mutedPurple, 0.5), 0.68, 0.3],
    ['small', 16, PROP_COLORS.pigPink, 0.06, 0.1],
  ].forEach(([name, radius, color, fx, fy]) => {
    scene.add.image(width * fx, groundY * fy, moonKey(scene, name, radius, color)).setScale(unit);
  });

  // Two ships crossing high up, each drawing a long thin trail.
  [[0.22, 9000], [0.3, 13000]].forEach(([fy, duration], i) => {
    const ship = scene.add.container(-200, groundY * fy, [
      scene.add.rectangle(-70, 0, 140, 1, COLORS.offWhite, 0.45),
      scene.add.rectangle(0, 0, 22, 3, COLORS.offWhite),
      scene.add.rectangle(4, -2, 8, 2, COLORS.cyan),
    ]);
    ship.setRotation(-0.12);
    scene.tweens.add({ targets: ship, x: width + 200, y: ship.y - (width + 400) * 0.12, duration, repeat: -1, delay: i * 4000 });
  });

  // Squeezed on a short screen so the towers don't climb into the HUD.
  const squeeze = Math.min(1, groundY / 620);
  [['far', FAR_CITY], ['front', FRONT_CITY]].forEach(([name, size]) => {
    const strip = addLayer(scene, skylineKey(scene, name, size), {
      factor: 0,
      y: groundY - size.height * squeeze,
      height: size.height,
    });
    strip.setScale(1, squeeze);
    layers.push(strip);
  });
  layers.push(addLayer(scene, cityLightsKey(scene), { factor: 0, y: groundY - LIGHTS_SIZE.height, height: LIGHTS_SIZE.height }));
  return makeBackdrop(scene, layers);
}

// The rooftop the boss fight happens on: metal deck plates with a neon lip,
// panelling below, and the static body the player stands on (returned).
export function addCityGround(scene, groundY, x, width) {
  const { height } = scene.scale;
  const panelsKey = makeTexture(
    scene,
    'getaway-city-panels',
    (g) => {
      g.fillStyle(CITY.metalDark, 1);
      g.fillRect(0, 0, 96, 48);
      g.fillStyle(CITY.near, 1);
      g.fillRect(0, 0, 2, 48);
      g.fillRect(0, 46, 96, 2);
      g.fillRect(48, 0, 2, 24);
      g.fillStyle(CITY.metal, 1);
      for (let y = 30; y < 44; y += 4) g.fillRect(58, y, 28, 2); // vent slats
      [[8, 6], [40, 6], [56, 6], [88, 6], [8, 40], [40, 40]].forEach(([px, py]) => g.fillRect(px, py, 2, 2)); // rivets
    },
    { width: 96, height: 48 },
  );
  const deckKey = makeTexture(
    scene,
    'getaway-city-deck',
    (g) => {
      g.fillStyle(CITY.metal, 1);
      g.fillRect(0, 0, 96, MARS_GROUND_HEIGHT);
      g.fillStyle(COLORS.cyan, 1);
      g.fillRect(0, 0, 96, 3);
      g.fillStyle(mix(COLORS.cyan, COLORS.background, 0.5), 1);
      g.fillRect(0, 3, 96, 2);
      g.fillStyle(CITY.metalLight, 1);
      g.fillRect(0, 8, 96, 2);
      g.fillStyle(CITY.near, 1);
      g.fillRect(0, 10, 2, 14);
      g.fillRect(48, 10, 2, 14);
    },
    { width: 96, height: MARS_GROUND_HEIGHT },
  );
  scene.add.tileSprite(x, groundY, width, height - groundY, panelsKey).setOrigin(0, 0);
  scene.add.tileSprite(x, groundY, width, MARS_GROUND_HEIGHT, deckKey).setOrigin(0, 0);
  const body = scene.add.rectangle(x + width / 2, groundY + MARS_GROUND_HEIGHT / 2, width, MARS_GROUND_HEIGHT, 0, 0);
  scene.physics.add.existing(body, true);
  return body;
}

// ---------------------------------------------------------- black hole ----
// What the pair stand in on the intro and on the "you did it" screen: a black disc that bleeds into purple and then
// dark blue at its edge, inside a slowly turning spiral aura of the same tones.

const HOLE = {
  core: SHADOW, // pure black on purpose, it's a black hole
  purple: mix(COLORS.mutedPurple, COLORS.background, 0.3),
  blue: mix(PROP_COLORS.sea, COLORS.background, 0.35),
  rim: mix(PROP_COLORS.sea, COLORS.mutedPurple, 0.4),
};
const HOLE_PX = 4;
const HOLE_REACH = 1.75; // how far the aura spreads, in disc radii

// Black -> purple -> dark blue, for t in 0-1.
const holeTone = (t) => (t < 0.5 ? mix(HOLE.core, HOLE.purple, t * 2) : mix(HOLE.purple, HOLE.blue, t * 2 - 1));

// Calls paint(x, y, distance, angle) for every chunky pixel of a `size` square.
function eachHoleCell(size, paint) {
  const c = size / 2;
  for (let y = 0; y < size; y += HOLE_PX) {
    for (let x = 0; x < size; x += HOLE_PX) {
      const dx = x + HOLE_PX / 2 - c;
      const dy = y + HOLE_PX / 2 - c;
      paint(x, y, Math.hypot(dx, dy), Math.atan2(dy, dx));
    }
  }
}

function holeAuraKey(scene, r) {
  const size = Math.ceil((r * HOLE_REACH * 2) / HOLE_PX) * HOLE_PX;
  return makeTexture(
    scene,
    `getaway-hole-aura-${r}`,
    (g) => {
      const rng = seeded(23);
      eachHoleCell(size, (x, y, d, angle) => {
        const t = (d - r * 0.9) / (size / 2 - r * 0.9);
        if (t < 0 || t > 1) return;
        // Three arms that trail behind as they get further out.
        const arm = 0.5 + 0.5 * Math.sin(angle * 3 - t * 7);
        const strength = (1 - t) ** 1.6 * (0.45 + 0.55 * arm);
        if (rng() > strength * 1.6) return; // dither the edge away instead of blurring it
        g.fillStyle(holeTone(0.45 + t * 0.55), Math.min(1, 0.25 + strength));
        g.fillRect(x, y, HOLE_PX, HOLE_PX);
      });
      // A few stars caught in the arms.
      for (let i = 0; i < 26; i += 1) {
        const d = between(rng, r * 1.08, size / 2 - 8);
        const angle = rng() * Math.PI * 2;
        g.fillStyle(pick(rng, [COLORS.offWhite, COLORS.cyan, COLORS.mutedPurple]), between(rng, 0.5, 1));
        g.fillRect(Math.round(size / 2 + Math.cos(angle) * d), Math.round(size / 2 + Math.sin(angle) * d), HOLE_PX, HOLE_PX);
      }
    },
    { width: size, height: size },
  );
}

function holeDiscKey(scene, r) {
  const size = Math.ceil((r * 2) / HOLE_PX) * HOLE_PX;
  return makeTexture(
    scene,
    `getaway-hole-disc-${r}`,
    (g) => {
      const bands = 7;
      eachHoleCell(size, (x, y, d) => {
        const t = d / r;
        if (t > 1) return;
        // Black out to 60%, then stepped bands so the gradient stays pixel-y.
        const edge = Math.max(0, (t - 0.6) / 0.4);
        g.fillStyle(t > 0.965 ? HOLE.rim : holeTone(Math.floor(edge * bands) / bands), 1);
        g.fillRect(x, y, HOLE_PX, HOLE_PX);
      });
    },
    { width: size, height: size },
  );
}

export function addBlackHole(scene, x, y, radius) {
  const r = Math.max(HOLE_PX * 4, Math.round(radius));
  const aura = scene.add.image(x, y, holeAuraKey(scene, r));
  scene.tweens.add({ targets: aura, angle: 360, duration: 90000, repeat: -1 });
  scene.tweens.add({ targets: aura, scale: 1.05, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return [aura, scene.add.image(x, y, holeDiscKey(scene, r))];
}
