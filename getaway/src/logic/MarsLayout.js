// Level 2's layout, as plain data (no Phaser): the ground, the platforms and
// the monster line-up. Fixed (not random) so it's testable and the same for
// every guest.
//
// The level plays on three heights: the ground (tier 0) and two tiers of rock
// platforms above it. The ground is broken by lava pits that can only be
// crossed over the platforms; falling in is a death. Small monsters can be
// jumped or shot; big ones are taller than a jump and have to be shot down,
// so they stand on open ground with no platform nearby to slip past on. The
// level ends on one giant, which takes many more shots.

// Stretches of solid ground, [x, width]. The gaps between them are lava.
export const GROUND = [
  [0, 2100],
  [3000, 1300],
  [5400, 2900],
];

// The way across each pit, in order, as [x, width, tier]. CROSSINGS[i] spans
// the pit between GROUND[i] and GROUND[i + 1].
export const CROSSINGS = [
  [
    [2180, 220, 1],
    [2500, 260, 2],
    [2850, 200, 1],
  ],
  [
    [4380, 180, 1],
    [4660, 200, 2],
    [4980, 240, 2],
    [5270, 180, 1],
  ],
];

// Optional platforms over solid ground — a first go at the tiers before the
// pits make them compulsory.
export const EXTRA_PLATFORMS = [
  [1000, 300, 1],
  [1380, 300, 2],
];

// [type, x, tier]
export const MONSTERS = [
  ['small', 700, 0],
  ['small', 1150, 1],
  ['small', 1200, 0],
  ['small', 1700, 0],
  ['small', 2630, 2],
  ['small', 3250, 0],
  ['big', 3650, 0],
  ['small', 4000, 0],
  ['small', 5080, 2],
  ['big', 6050, 0],
  ['small', 6350, 0],
  ['big', 6750, 0],
  ['giant', 7350, 0],
];

const FINISH_X = 7900;
const EDGE_MARGIN = 30; // how close to a surface's edge a monster walks
const BIG_ADVANCE = 260; // how far a big monster or the giant comes forward to meet the player

const span = ([x, width, tier = 0]) => ({ x, width, tier });

// tierRise: px between tiers — the scene shrinks it on a short screen.
export function buildMarsLevel({ tierRise = 85 } = {}) {
  const withRise = (s) => ({ ...s, rise: s.tier * tierRise });
  const ground = GROUND.map(span).map(withRise);
  const crossings = CROSSINGS.map((crossing) => crossing.map(span).map(withRise));
  const platforms = [...EXTRA_PLATFORMS.map(span).map(withRise), ...crossings.flat()];
  const surfaces = [...ground, ...platforms];

  const monsters = MONSTERS.map(([type, x, tier], index) => {
    const surface = surfaces.find((s) => s.tier === tier && x >= s.x && x <= s.x + s.width);
    const left = surface.x + EDGE_MARGIN;
    const right = surface.x + surface.width - EDGE_MARGIN;
    let patrol;
    if (type !== 'small') {
      patrol = [Math.max(left, x - BIG_ADVANCE), x];
    } else if (tier > 0) {
      // Keeps to the far end of its platform, so there's room to land on the near end.
      patrol = [surface.x + surface.width * 0.45, right];
    } else {
      patrol = [Math.max(left, x - 300), Math.min(right, x + 100)];
    }
    return { index, type, x, tier, rise: tier * tierRise, patrol };
  });

  const last = ground[ground.length - 1];
  return { ground, crossings, platforms, monsters, finishX: FINISH_X, width: last.x + last.width };
}
