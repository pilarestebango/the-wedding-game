// Code-drawn placeholder pixel art for the getaway game, in the site palette
// (plus the giant, the one monster with real art — MONSTER_SHEETS).
// Each sprite is a small character grid drawn as chunky square "pixels" and
// baked into a texture once (makeTexture is idempotent). These are stand-ins
// until the couple approves or replaces them — see the asset review gate in
// game/CLAUDE.md.
// Imported straight from game/ rather than via ../shared.js: that barrel also
// pulls in DOM-touching modules, and this file's grids are unit-tested in Node.
import { COLORS, PROP_COLORS } from '../../../game/src/config/palette.js';
import { makeTexture } from '../../../game/src/config/pixelArt.js';

// A blend of two palette tokens, t of the way from a to b — how every tone
// that isn't a token itself is made, here and in backdrops.js.
export function mix(a, b, t) {
  const ch = (shift) => Math.round(((a >> shift) & 0xff) * (1 - t) + ((b >> shift) & 0xff) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

// The death screen is pure black on purpose (asked for by the couple), not
// the site's purple background.
export const BLACK = 0x000000;
export const CSS_BLACK = '#000000';

// The big monster: a red box-headed imp, after a sprite the couple liked —
// big gold eyes, a jagged grin, a tiny body — with horns, a glare, a scar and
// a devil's tail added. 160px tall: deliberately taller than the player can
// jump. Two grids, one per walk frame.
const BIG_MONSTER = {
  px: 4,
  colors: {
    o: mix(COLORS.red, COLORS.background, 0.88), // outline, brows
    1: COLORS.red,
    2: mix(COLORS.red, COLORS.background, 0.3), // shadow
    3: mix(COLORS.red, COLORS.gold, 0.38), // lit edge
    4: mix(COLORS.red, COLORS.background, 0.55), // deep shadow
    5: COLORS.offWhite, // teeth, horn tips, glint
    6: mix(COLORS.offWhite, COLORS.mutedPurple, 0.5),
    7: COLORS.gold, // eyes
    8: mix(COLORS.gold, COLORS.red, 0.45), // eye rim
    9: mix(COLORS.background, COLORS.mutedPurple, 0.3), // boots
    0: COLORS.background,
  },
};

// Level 1's coin: four grids, one turn of a spin (COIN_FRAMES, in order).
const COIN = {
  px: 2,
  colors: {
    o: mix(PROP_COLORS.brown, COLORS.background, 0.45), // outline
    1: COLORS.gold,
    2: mix(COLORS.gold, COLORS.red, 0.38), // shaded side
    3: mix(COLORS.gold, COLORS.offWhite, 0.7), // lit side
    4: PROP_COLORS.brown,
    5: COLORS.offWhite, // glint
  },
};
export const COIN_FRAMES = ['coin', 'coin-2', 'coin-3', 'coin-4'];

// The boss's ship, seen head-on: a ball cockpit with a red viewport between
// two dagger-shaped wing panels (the couple asked for something evil, "like
// from Star Wars"). Hull tones are kept light enough to read against the
// boss level's black sky. Two grids: lights dim / lights lit (SHIP_FRAMES).
const SHIP = {
  px: 3,
  colors: {
    o: mix(COLORS.background, COLORS.mutedPurple, 0.12), // outline
    1: mix(COLORS.mutedPurple, COLORS.background, 0.2), // hull
    2: mix(COLORS.mutedPurple, COLORS.background, 0.5), // hull in shadow
    3: mix(COLORS.mutedPurple, COLORS.offWhite, 0.55), // lit edges
    4: mix(COLORS.mutedPurple, COLORS.background, 0.8), // ribs, viewport frame
    5: COLORS.red,
    6: mix(COLORS.red, COLORS.gold, 0.55),
    7: mix(COLORS.red, COLORS.background, 0.5),
    8: COLORS.offWhite,
  },
};
export const SHIP_FRAMES = ['saucer', 'saucer-pulse'];

// The death screen's skull: cracked, glaring, lit from the upper left. Two
// grids — jaw shut and jaw dropped — so it can laugh (SKULL_FRAMES).
// SKULL_EYES is where its pupils are, in grid pixels, for the scene's glow.
const SKULL = {
  px: 5,
  colors: {
    1: COLORS.offWhite,
    2: mix(COLORS.offWhite, COLORS.mutedPurple, 0.42), // bone in shade
    3: mix(COLORS.mutedPurple, BLACK, 0.25),
    4: mix(COLORS.mutedPurple, BLACK, 0.62), // cracks, gaps between teeth
    5: COLORS.red, // pupils
    6: mix(COLORS.red, BLACK, 0.55),
    7: COLORS.gold,
  },
};
export const SKULL_FRAMES = ['skull', 'skull-laugh'];
export const SKULL_EYES = [[10, 14], [22, 14]];

// '.' is transparent; every other character is looked up in the grid's colors.
export const GRIDS = {
  'coin': {
    ...COIN,
    rows: [
      '.......oo.......',
      '....ooo33ooo....',
      '...o33333333o...',
      '..o3522222231o..',
      '.o355211112322o.',
      '.o322114231332o.',
      '.o321114231132o.',
      'o33211142311322o',
      'o33211142311322o',
      '.o321114231132o.',
      '.o322114231332o.',
      '.o333311113322o.',
      '..o1233333322o..',
      '...o22222222o...',
      '....ooo22ooo....',
      '.......oo.......',
    ],
  },
  'coin-2': {
    ...COIN,
    rows: [
      '.......oo.......',
      '......o33o......',
      '.....o3333o.....',
      '....o322221o....',
      '....o311111o....',
      '...o32123132o...',
      '...o32123132o...',
      '...o31123112o...',
      '...o31123112o...',
      '...o32123132o...',
      '...o32123132o...',
      '....o111112o....',
      '....o133332o....',
      '.....o2222o.....',
      '......o22o......',
      '.......oo.......',
    ],
  },
  'coin-3': {
    ...COIN,
    rows: [
      '................',
      '.......oo.......',
      '......o12o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o32o......',
      '......o12o......',
      '.......oo.......',
      '................',
    ],
  },
  'coin-4': {
    ...COIN,
    rows: [
      '.......oo.......',
      '......o22o......',
      '.....o2222o.....',
      '....o133332o....',
      '....o111112o....',
      '...o32123132o...',
      '...o32123132o...',
      '...o31123112o...',
      '...o31123112o...',
      '...o32123132o...',
      '...o32123132o...',
      '....o311111o....',
      '....o322221o....',
      '.....o3333o.....',
      '......o33o......',
      '.......oo.......',
    ],
  },
  'monster-small': {
    px: 5,
    colors: { 1: COLORS.cyan, 0: COLORS.background },
    rows: [
      '..1....1..',
      '...1..1...',
      '..111111..',
      '.11011011.',
      '1111111111',
      '1.111111.1',
      '1.1....1.1',
      '...11.11..',
    ],
  },
  'monster-big': {
    ...BIG_MONSTER,
    rows: [
      '....o5o.................o5o.....',
      '....o55o...............o55o.....',
      '.....o56o.............o65o......',
      '.....o12o.............o21o......',
      '....oo112ooooooooooooo211ooo....',
      '...o131112333333333332111111o...',
      '..o13331111111111111111112222o..',
      '..o13111111114111111111112244o..',
      '..o13ooo11111411111111ooo2244o..',
      '..o13444ooo11141111ooo4442244o..',
      '..o131ooooooo1111ooooooo12244o..',
      '..o111oo8oooo1111oooo8oo12244o..',
      '..o111o85778o1111o57778o12244o..',
      '..o11o8775078o11o8750778o2244o..',
      '..o11o8770078o11o8700778o2244o..',
      '..o11o8770078o11o8700778o2244o..',
      '..o111o87008o1111o80078o12244o..',
      '..o111oo888oo1111oo888oo12244o..',
      '..o11111ooo11111111ooo1112244o..',
      '..o11111111111111111111112244o..',
      '..o1oooooooooooooooooooooo244o..',
      '..o10555055505550555055500244o..',
      '..o11050005000500050005002244o..',
      '..o11000500050005000500052244o..',
      '..o11606660666066606660662244o..',
      '..o12222222222222222222222222o..',
      '...o222222222222222222222221o...',
      '....ooooo11144444444222ooo111o..',
      '........o11111111122222o..o1o...',
      '........o11111333122222o..o1o...',
      '.......o111111111122222o.o1o....',
      '.......o111111333122222oo1o.....',
      '.......o22221111112211111o......',
      '........ooo1222222221111o.......',
      '..........o1112oo1112222o.......',
      '..........o1112o900009oo........',
      '..........o1112o999999o.........',
      '.........o900009oooooo..........',
      '.........o999999o...............',
      '..........oooooo................',
    ],
  },
  'monster-big-step': {
    ...BIG_MONSTER,
    rows: [
      '.....o...................o......',
      '....o5o.................o5o.....',
      '....o55o...............o55o.....',
      '.....o56o.............o65o......',
      '.....o12o.............o21o......',
      '....oo112ooooooooooooo211ooo....',
      '...o131112333333333332111111o...',
      '..o13331111111111111111112222o..',
      '..o13111111114111111111112244o..',
      '..o13ooo11111411111111ooo2244o..',
      '..o13444ooo11141111ooo4442244o..',
      '..o131ooooooo1111ooooooo12244o..',
      '..o111oo8oooo1111oooo8oo12244o..',
      '..o111o85778o1111o57778o12244o..',
      '..o11o8775078o11o8750778o2244o..',
      '..o11o8770078o11o8700778o2244o..',
      '..o11o8770078o11o8700778o2244o..',
      '..o111o87008o1111o80078o12244o..',
      '..o111oo888oo1111oo888oo12244o..',
      '..o11111ooo11111111ooo1112244o..',
      '..o11111111111111111111112244o..',
      '..o1oooooooooooooooooooooo244o..',
      '..o10555055505550555055500244o..',
      '..o11050005000500050005002244o..',
      '..o11000500050005000500052244o..',
      '..o11606660666066606660662244o..',
      '..o12222222222222222222222222o..',
      '...o222222222222222222222221o...',
      '....ooooo11144444444222ooooo....',
      '........o11111111122222o..o1o...',
      '........o11111333122222o..o1o...',
      '........o111111111221111oo1o....',
      '........o111113331221111o1o.....',
      '.......o11111111112222221o......',
      '.......o1111222222222oooo.......',
      '.......o22220009o1112o..........',
      '........oo999999o1112o..........',
      '..........oooooo900009o.........',
      '...............o999999o.........',
      '................oooooo..........',
    ],
  },
  'saucer': {
    ...SHIP,
    rows: [
      '......o..............................................o......',
      '.....o3o............................................o3o.....',
      '....o31o............................................o13o....',
      '....o31o.....................oo.....................o13o....',
      '...o3241o.................ooo33ooo.................o1423o...',
      '..o32241o...............oo33333331oo...............o14223o..',
      '..o32241o..............o333331111111o..............o14223o..',
      '.o3444441o............o33333111111111o............o1444443o.',
      '.o3222421o............o33334444441111o............o1242223o.',
      '.o3222421o..........oo3333455445541111oo..........o1242223o.',
      'o322224221o...oooooo33333455544555411133oooooo...o122422223o',
      'o322224221oooo33333313334555544555541221333333oooo122422223o',
      'o3211111113333111111133145555665555422211111113333111111123o',
      'o3411171112222222222231144446666444422222222222222111711143o',
      'o3411171112242242242211144446666444422222422422422111711143o',
      'o3211111112222222222211145555665555422222222222222111111123o',
      'o322224221oooo22222222111455544555422222222222oooo122422223o',
      'o322224221o...oooooo22111145544554222222oooooo...o122422223o',
      '.o3222421o..........ooo11114444442222ooo..........o1242223o.',
      '.o3222421o............o11111122222222o............o1242223o.',
      '.o3444441o.............o111122222222o.............o1444443o.',
      '..o32241o...............o1222222221o...............o14223o..',
      '..o32241o...............o12oooooo21o...............o14223o..',
      '...o3241o...............o1oo2222oo1o...............o1423o...',
      '....o31o................o1o.o77o.o1o................o13o....',
      '....o31o................o6o..oo..o6o................o13o....',
      '.....o3o.................o........o.................o3o.....',
      '......o..............................................o......',
    ],
  },
  'saucer-pulse': {
    ...SHIP,
    rows: [
      '......o..............................................o......',
      '.....o3o............................................o3o.....',
      '....o31o............................................o13o....',
      '....o31o.....................oo.....................o13o....',
      '...o3241o.................ooo33ooo.................o1423o...',
      '..o32241o...............oo33333331oo...............o14223o..',
      '..o32241o..............o333331111111o..............o14223o..',
      '.o3444441o............o33333111111111o............o1444443o.',
      '.o3222421o............o33334444441111o............o1242223o.',
      '.o3222421o..........oo3333455445541111oo..........o1242223o.',
      'o322224221o...oooooo33333455544555411133oooooo...o122422223o',
      'o322224221oooo33333313334555544555541221333333oooo122422223o',
      'o3211111113333111111133145555885555422211111113333111111123o',
      'o3411151112222222222231144448888444422222222222222111511143o',
      'o3411151112242242242211144448888444422222422422422111511143o',
      'o3211111112222222222211145555885555422222222222222111111123o',
      'o322224221oooo22222222111455544555422222222222oooo122422223o',
      'o322224221o...oooooo22111145544554222222oooooo...o122422223o',
      '.o3222421o..........ooo11114444442222ooo..........o1242223o.',
      '.o3222421o............o11111122222222o............o1242223o.',
      '.o3444441o.............o111122222222o.............o1444443o.',
      '..o32241o...............o1222222221o...............o14223o..',
      '..o32241o...............o12oooooo21o...............o14223o..',
      '...o3241o...............o1oo2222oo1o...............o1423o...',
      '....o31o................o1o.o77o.o1o................o13o....',
      '....o31o................o5o..oo..o5o................o13o....',
      '.....o3o.................o........o.................o3o.....',
      '......o..............................................o......',
    ],
  },
  skull: {
    ...SKULL,
    rows: [
      '...........111111141...........',
      '........111111111141111........',
      '.......11111111111141111.......',
      '.....111111111111114411112.....',
      '.....111111111111141141122.....',
      '....11311111111114111111222....',
      '...1111311111111114111122222...',
      '...1111311111111111111122222...',
      '...1113111111111111111222222...',
      '..111111133311111113332222233..',
      '..1111133...3111113...3322233..',
      '..11133......31113......33333..',
      '...11....6....111....6....33...',
      '...11...657...111...675...33...',
      '...11....556.11111...556..33...',
      '....11....6..11111....6..33....',
      '.....11.....111.111.....33.....',
      '....11111111111.11222222333....',
      '.....111111111...122222333.....',
      '.....11111111..3..22222333.....',
      '......4111111111122222334......',
      '.......41111111122222234.......',
      '......2.111111112222233.3......',
      '......2.333333333333333.3......',
      '......2.111411422422433.3......',
      '......2..11.11.11.22.22.3......',
      '......2..1...........1..3......',
      '......2.11.11.11.22.22..3......',
      '......2211411422423433433......',
      '.......3.1111222223333.3.......',
      '..........11222223333..........',
      '..........33333333333..........',
      '...............................',
      '...............................',
    ],
  },
  'skull-laugh': {
    ...SKULL,
    rows: [
      '...........111111141...........',
      '........111111111141111........',
      '.......11111111111141111.......',
      '.....111111111111114411112.....',
      '.....111111111111141141122.....',
      '....11311111111114111111222....',
      '...1111311111111114111122222...',
      '...1111311111111111111122222...',
      '...1113111111111111111222222...',
      '..111111133311111113332222233..',
      '..1111133...3111113...3322233..',
      '..11133......31113......33333..',
      '...11....6....111....6....33...',
      '...11...657...111...675...33...',
      '...11....556.11111...556..33...',
      '....11....6..11111....6..33....',
      '.....11.....111.111.....33.....',
      '....11111111111.11222222333....',
      '.....111111111...122222333.....',
      '.....11111111..3..22222333.....',
      '......4111111111122222334......',
      '.......41111111122222234.......',
      '......2.111111112222233.3......',
      '......2.333333333333333.3......',
      '......2.111411422422433.3......',
      '......2..11.11.11.22.22.3......',
      '......2..1...........1..3......',
      '......2.................3......',
      '......2.................3......',
      '......2.................3......',
      '......2.11.11.11.22.22..3......',
      '......2211411422423433433......',
      '.......3.1111222223333.3.......',
      '..........11222223333..........',
    ],
  },
};

// The couple's own monster art: a sprite sheet sliced from assets/site/
// finalboss.png into even frames (see the root CLAUDE.md).
// `height` is how tall each one stands in the level; `frames` are indices
// into the sheet. Paths are relative to game/, like everything Boot loads.
export const MONSTER_SHEETS = {
  // Level 2's last monster. Its frame is wide to fit the attack's tentacles,
  // so the hitbox is narrower than the frame.
  giant: {
    key: 'getaway-monster-giant',
    path: '../getaway/assets/monster-giant.webp',
    frameWidth: 400,
    frameHeight: 372,
    height: 224,
    bodyWidth: 0.6,
    walkFps: 3,
    frames: { walk: [0, 1], damage: 2, attack: 3 },
  },
};

// How big a monster stands in the level, whichever way it's drawn.
export function monsterSize(type) {
  const sheet = MONSTER_SHEETS[type];
  if (!sheet) return gridSize(`monster-${type}`);
  return { width: (sheet.frameWidth * sheet.height) / sheet.frameHeight, height: sheet.height };
}

export function monsterScale(type) {
  const sheet = MONSTER_SHEETS[type];
  return sheet ? sheet.height / sheet.frameHeight : 1;
}

export function gridSize(name) {
  const { rows, px } = GRIDS[name];
  return { width: rows[0].length * px, height: rows.length * px };
}

export function artKey(scene, name) {
  const { rows, px, colors } = GRIDS[name];
  return makeTexture(
    scene,
    `getaway-${name}`,
    (g) => {
      rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
          if (colors[ch] === undefined) return;
          g.fillStyle(colors[ch], 1);
          g.fillRect(x * px, y * px, px, px);
        });
      });
    },
    gridSize(name),
  );
}

function rectTexture(scene, key, width, height, draw) {
  return makeTexture(scene, key, draw, { width, height });
}

export const PLATFORM_HEIGHT = 20;

export function platformKey(scene) {
  return rectTexture(scene, 'getaway-platform', 32, PLATFORM_HEIGHT, (g) => {
    g.fillStyle(COLORS.mutedPurple, 1);
    g.fillRect(0, 0, 32, PLATFORM_HEIGHT);
    g.fillStyle(COLORS.cyan, 1);
    g.fillRect(0, 0, 32, 4);
    g.fillStyle(COLORS.background, 1);
    g.fillRect(6, 10, 8, 4);
    g.fillRect(22, 12, 6, 4);
  });
}

// Exit marker for levels 1 and 2: a Jolly Roger rippling on a wooden pole.
// Drawn on a 36x60 grid of 2px pixels, once per frame of the ripple: each
// column of cloth is shifted up or down along a wave that travels away from
// the pole (and grows toward the free end), and lit by which way it leans.
const FLAG_PX = 2;
const FLAG_CLOTH = { x: 4, y: 5, width: 30, height: 20 }; // in grid pixels
export const FLAG_SIZE = { width: 36 * FLAG_PX, height: 60 * FLAG_PX };
export const FLAG_FRAME_COUNT = 6;

// 1 bone, 2 bone in shadow, 0 the cloth showing through (eyes, nose, teeth).
const FLAG_EMBLEM = [
  '...1111111...',
  '..111111112..',
  '..100111002..',
  '..100111002..',
  '..111101112..',
  '...1111122...',
  '11..10101..11',
  '112.......112',
  '..112...112..',
  '....11122....',
  '..112...112..',
  '112.......112',
  '11.........22',
];
// Bites out of the free edge, as [column from the edge, row].
const FLAG_TATTERS = [[0, 4], [0, 5], [1, 5], [0, 11], [0, 16], [0, 17], [1, 17]];

export function flagKey(scene, frame = 0) {
  return rectTexture(scene, `getaway-pirate-flag-${frame}`, FLAG_SIZE.width, FLAG_SIZE.height, (g) => {
    const dot = (x, y, color) => {
      g.fillStyle(color, 1);
      g.fillRect(x * FLAG_PX, y * FLAG_PX, FLAG_PX, FLAG_PX);
    };
    const cloth = FLAG_CLOTH;
    const fold = mix(BLACK, COLORS.mutedPurple, 0.16);
    const crest = mix(BLACK, COLORS.mutedPurple, 0.36);
    const hem = mix(BLACK, COLORS.mutedPurple, 0.62); // lighter edge, so the black reads against a dark sky
    const boneShade = mix(COLORS.offWhite, COLORS.mutedPurple, 0.5);
    const emblemX = Math.floor((cloth.width - FLAG_EMBLEM[0].length) / 2);
    const emblemY = Math.floor((cloth.height - FLAG_EMBLEM.length) / 2);
    const phase = (frame / FLAG_FRAME_COUNT) * Math.PI * 2;

    for (let cx = 0; cx < cloth.width; cx += 1) {
      const angle = cx * 0.3 - phase;
      const lift = Math.round(Math.sin(angle) * (0.4 + (2 * cx) / cloth.width));
      const lean = Math.cos(angle);
      const base = lean > 0.6 ? crest : lean < -0.6 ? BLACK : fold;
      for (let cy = 0; cy < cloth.height; cy += 1) {
        if (FLAG_TATTERS.some(([fromEdge, row]) => cx === cloth.width - 1 - fromEdge && cy === row)) continue;
        const onEdge = cy === 0 || cy === cloth.height - 1 || cx === cloth.width - 1;
        const mark = FLAG_EMBLEM[cy - emblemY]?.[cx - emblemX];
        let color = onEdge ? hem : base;
        if (mark === '1') color = COLORS.offWhite;
        else if (mark === '2') color = boneShade;
        else if (mark === '0') color = BLACK;
        dot(cloth.x + cx, cloth.y + cy + lift, color);
      }
    }

    // Pole: three tones of wood with a darker band every few pixels.
    const wood = [mix(PROP_COLORS.brown, BLACK, 0.45), PROP_COLORS.brown, mix(PROP_COLORS.brown, COLORS.gold, 0.4)];
    for (let y = 4; y < 60; y += 1) {
      wood.forEach((tone, i) => dot(1 + i, y, y % 9 === 3 ? wood[0] : tone));
    }
    // The two ties holding the cloth, and a gold ball on top.
    [cloth.y, cloth.y + cloth.height - 1].forEach((y) => [1, 2, 3].forEach((x) => dot(x, y, COLORS.offWhite)));
    ['.111.', '13111', '11112', '11122', '.122.'].forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.') return;
        dot(x, y, ch === '3' ? COLORS.offWhite : ch === '2' ? mix(COLORS.gold, COLORS.red, 0.45) : COLORS.gold);
      });
    });
  });
}

// One texture per frame of the ripple, for an animation's `frames`.
export function flagFrames(scene) {
  return Array.from({ length: FLAG_FRAME_COUNT }, (_, frame) => ({ key: flagKey(scene, frame) }));
}

// The player's shot (cyan) and the saucer's bolt (red). `vertical` picks the
// orientation: level 2 fires sideways, the boss fight fires up and down.
export function shotKey(scene, { vertical = false, color = COLORS.cyan, name = 'shot' } = {}) {
  const [width, height] = vertical ? [6, 16] : [16, 6];
  return rectTexture(scene, `getaway-${name}-${vertical ? 'v' : 'h'}`, width, height, (g) => {
    g.fillStyle(color, 1);
    g.fillRect(0, 0, width, height);
  });
}

// The saucer's bolt: red with a white casing, so it still shows against the
// red and gold of the boss arena's sunset.
export function boltKey(scene) {
  return rectTexture(scene, 'getaway-saucer-bolt', 10, 20, (g) => {
    g.fillStyle(COLORS.offWhite, 1);
    g.fillRect(0, 0, 10, 20);
    g.fillStyle(COLORS.red, 1);
    g.fillRect(2, 2, 6, 16);
  });
}
