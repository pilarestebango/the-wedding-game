// Every "not fully specified in GAME_SPEC.md" number lives here so balance changes
// are a one-line edit, not a code change. Defaults chosen to feel snappy but not
// trivial; tune freely.

export const MASH = {
  drinkTarget: 16, // presses to fill the "drink" meter to 100%
  talkTarget: 16, // presses to grow the "talk" speech bubble to full
  payTarget: 27, // presses to fill the house "pay" meter
  proposeTarget: 20, // presses to fill the kneel/propose meter
  tentTarget: 14, // presses to pop the tent
  islandTarget: 14, // presses to leave the island
};

export const LEVEL1 = {
  obstacleSpacing: 480, // px between obstacles
  startX: 700, // px from world start to first obstacle
  runSpeed: 220, // px/s player auto-run speed
  jumpVelocity: -420,
  gravityY: 900,
  stumbleDurationMs: 500, // no-fail stumble animation length on obstacle hit
};

export const RINGS = {
  count: 7,
  spacing: 420,
  startX: 600,
  runSpeed: 220,
  jumpVelocity: -420,
  gravityY: 900,
};

export const ADVANCE = {
  distance: 1000, // "distance units" to cross each hold-to-advance stage
  speedPerMs: 0.45,
};

export const LEVEL3_WAIT_SECONDS = 17;

export const BOSS_LOOPS = {
  firstDateLoops: 3, // drink -> talk, repeated this many times
};

export const FRAME_ANIM = {
  runFrameDurationMs: 140,
  danceFrameDurationMs: 260,
  boringFrameDurationMs: 900, // slow alternation between her two "just waiting" poses
};

// The RSVP page now lives at the site root, one level up from game/index.html.
export const RSVP_URL = '../rsvp/';

// The wedding site's landing page, where the character-select EXIT link goes.
export const SITE_URL = '../';
