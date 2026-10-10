// Every balance number for the getaway game, so tuning is a one-line edit.

export const PLAYER = {
  runSpeed: 240, // px/s
  jumpVelocity: -460,
  gravityY: 900,
  fireCooldownMs: 250,
};

export const LEVEL1 = {
  coinTarget: 69, // coins needed at the exit; the level holds far more, on purpose (see PlatformLayout.js)
  maxRiseUnit: 60, // px per "rise" step between platforms on a tall screen
  minRiseUnit: 16, // ...and on a short landscape phone
  fallMargin: 100, // px below the screen before a fall counts as a death
};

export const LEVEL2 = {
  // Where things are is in logic/MarsLayout.js; these are the numbers around it.
  maxTierRise: 85, // px between the ground and each platform tier on a tall screen
  minTierRise: 30, // ...and on a short landscape phone
  fallMargin: 100, // px below the screen before a fall into the lava counts as a death
  bulletSpeed: 520,
  bulletHeight: 28, // px above the player's feet — low enough to hit a small monster
  // Small monsters can't be shot: a hit splits one into two (once). Jump them.
  small: { speed: 50, splitOffset: 60 },
  big: { hp: 3, speed: 25 },
  // The one at the very end. It fires back now and then: a slow shot along
  // the ground that has to be jumped.
  giant: { hp: 10, speed: 18, shotEveryMs: 2800, shotSpeed: 220, shotHeight: 22 },
};

export const BOSS = {
  hp: 20,
  playerHearts: 3,
  invulnerableMs: 1200, // after the player is hit
  // Fast shots and a slow sweep, so firing from right under the saucer lands.
  // Below half health the ship gets a little angrier (`secondHalf`). Keep that
  // step small: an earlier, steeper second half was too hard for guests.
  bulletSpeed: 1000,
  speed: 120, // saucer sweep, px/s
  boltSpeed: 260,
  boltEveryMs: 900,
  // Second half: once its health is at or below `below`, it sweeps a bit
  // faster and fires a bit more often. Its shots travel at the same speed.
  secondHalf: { below: 0.5, speed: 140, boltEveryMs: 760 },
};

export const GAME_OVER = {
  inputDelayMs: 600, // so a held/mashed FIRE doesn't skip the death screen
};

// Where the last screen's FULL DETAILS button goes (relative to getaway/index.html).
export const DETAILS_URL = 'details/';
