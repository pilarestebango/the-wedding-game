// Pixel-art assets for every obstacle/prop/set-piece, cropped from the
// reference sheets the couple approved (reference/*.jpeg) — see
// reference/crop.py and reference/finalize.py for how the individual sprites
// were extracted and resized. Loaded as real images (BootScene.preload, via
// PROP_MANIFEST below) rather than drawn procedurally.

const PROP_FILES = {
  beer: 'assets/sprites/props/beer.png',
  kangaroo: 'assets/sprites/props/kangaroo.png',
  book: 'assets/sprites/props/book.png',
  mountain: 'assets/sprites/props/mountain.png',
  heart: 'assets/sprites/props/heart.png',
  ring: 'assets/sprites/props/ring.png',
  'speech-bubble': 'assets/sprites/props/speech-bubble.png',
  star: 'assets/sprites/props/star.png',
  tent: 'assets/sprites/props/tent.png',
  car: 'assets/sprites/props/car.png',
  plane: 'assets/sprites/props/plane.png',
  island: 'assets/sprites/props/island.png',
  campervan: 'assets/sprites/props/campervan.png',
  house: 'assets/sprites/props/house.png',
  piggybank: 'assets/sprites/props/piggybank.png',
};

// 6-frame beer-emptying sequence (reference/beer.jpeg) — index 0 is full,
// index 5 is empty. Swapped by fill percent rather than a growing mask, see
// Level1BossScene's drink phase.
const BEER_FRAME_COUNT = 6;

export function textureKeyFor(type) {
  return `prop-${type}`;
}

export function beerFrameKey(index) {
  return `prop-beer-${index}`;
}

export function beerFrameForPercent(percent) {
  // percent=0 (not drunk yet) -> frame 0 (full); percent=1 -> frame 5 (empty)
  const index = Math.min(BEER_FRAME_COUNT - 1, Math.floor(percent * BEER_FRAME_COUNT));
  return beerFrameKey(index);
}

const BEER_FRAMES = Array.from({ length: BEER_FRAME_COUNT }, (_, i) => ({
  key: beerFrameKey(i),
  path: `assets/sprites/props/beer-${i}.png`,
}));

export const PROP_MANIFEST = [
  ...Object.entries(PROP_FILES).map(([type, path]) => ({ key: textureKeyFor(type), path })),
  ...BEER_FRAMES,
];
