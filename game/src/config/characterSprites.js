// Pili/Joe sprite frames (idle, 2-frame run cycle, jump pose), cropped from
// the reference profile-sprite sheet the couple approved (reference/*.jpeg) —
// see reference/crop.py and reference/finalize.py for how the individual
// frames were extracted and resized. Loaded as real images (BootScene.preload,
// via CHARACTER_MANIFEST below) rather than drawn procedurally; animation is
// still driven manually via FrameAnimator swapping setTexture(), no Phaser
// spritesheet/JSON needed.

const CHARACTERS = ['pili', 'joe'];
const POSES = ['idle', 'run-0', 'run-1', 'jump'];

export function textureKeyFor(char, pose) {
  return `${char}-${pose}`;
}

export function runFrameKeys(char) {
  return [textureKeyFor(char, 'run-0'), textureKeyFor(char, 'run-1')];
}

export function headKeyFor(char) {
  return `${char}-head`;
}

// Pili's 12-frame real dance-move set for Level 3 "The Wait" (GAME_SPEC.md
// §6), cropped from reference/dance01.jpeg + dance02.jpeg (see
// reference/crop_dance.py). A second batch (frames 12-20, cropped from the
// wedding site's reference/pili-good-poses.png sheet) was tried and pulled
// back out — that source renders at a visibly different pixel density/style
// than dance01/02.jpeg, so mixing the two read as inconsistent art mid-dance.
const DANCE_FRAME_COUNT = 12;

export function danceFrameKeys() {
  return Array.from({ length: DANCE_FRAME_COUNT }, (_, i) => `pili-dance-${i}`);
}

// Two of the calmer frames from the same dance set (hands on hips / hands
// clasped — no mid-move limbs) reused as a "bored, just waiting" idle sway,
// so the art style still matches the moment she actually dances.
export function boringFrameKeys() {
  const frames = danceFrameKeys();
  return [frames[0], frames[5]];
}

export const CHARACTER_MANIFEST = [
  ...CHARACTERS.flatMap((char) =>
    POSES.map((pose) => ({
      key: textureKeyFor(char, pose),
      path: `assets/sprites/characters/${char}-${pose}.png`,
    })),
  ),
  // Head-only crops (shoulders up), used where just a peek of a rider is
  // needed — e.g. Pili/Joe visible sitting inside a car/campervan.
  ...CHARACTERS.map((char) => ({
    key: headKeyFor(char),
    path: `assets/sprites/characters/${char}-head.png`,
  })),
  ...danceFrameKeys().map((key) => ({
    key,
    path: `assets/sprites/characters/${key}.png`,
  })),
];
