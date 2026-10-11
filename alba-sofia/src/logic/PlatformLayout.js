// Level 1's platforms and coins, as plain data (no Phaser) so the layout can
// be unit-tested: enough coins to reach the target, and every hop possible
// with the tuned jump.
//
// A segment is [gap before it, width, rise], where gap/width are px and rise
// is in "rise units" above the base line — the scene picks the unit's size in
// px from the screen height, so the same layout fits a short landscape phone.

export const SEGMENTS = [
  [0, 460, 0],
  [110, 300, 0],
  [120, 260, 1],
  [130, 300, 0],
  [110, 220, 1],
  [120, 220, 2],
  [140, 340, 1],
  [130, 260, 0],
  [150, 300, 1],
  [110, 180, 2],
  [120, 180, 1],
  [140, 380, 0],
  [130, 260, 1],
  [120, 260, 2],
  [150, 300, 1],
  [130, 220, 0],
  [140, 300, 1],
  [120, 340, 0],
  [130, 260, 1],
  [120, 520, 0],
];

const COIN_SPACING = 44;
const COIN_EDGE_MARGIN = 30; // keep coins off a platform's very edges
const COIN_ABOVE_PLATFORM = 34; // px above the platform top — inside a standing player
const COIN_ABOVE_GAP = 50; // px above the higher of the two platforms either side
const COINS_PER_GAP = 2;

// rise in the returned platforms/coins is in px above the base line.
export function buildPlatformLayout({ segments = SEGMENTS, riseUnit = 60 } = {}) {
  const platforms = [];
  const coins = [];
  let cursor = 0;

  segments.forEach(([gap, width, rise], i) => {
    const prev = platforms[i - 1];
    cursor += gap;
    const platform = { index: i, x: cursor, width, rise: rise * riseUnit };
    platforms.push(platform);

    // An arc of coins over the gap just crossed.
    if (prev) {
      const top = Math.max(prev.rise, platform.rise) + COIN_ABOVE_GAP;
      for (let n = 1; n <= COINS_PER_GAP; n += 1) {
        coins.push({ x: cursor - gap + (gap * n) / (COINS_PER_GAP + 1), rise: top });
      }
    }

    // A row along the platform — none on the first (the start) and only the
    // near half of the last (the exit stands on the far half).
    const isFirst = i === 0;
    const isLast = i === segments.length - 1;
    if (!isFirst) {
      const usable = (isLast ? width / 2 : width) - COIN_EDGE_MARGIN * 2;
      const count = Math.max(0, Math.floor(usable / COIN_SPACING));
      const rowWidth = (count - 1) * COIN_SPACING;
      const startX = cursor + COIN_EDGE_MARGIN + (usable - rowWidth) / 2;
      for (let n = 0; n < count; n += 1) {
        coins.push({ x: startX + n * COIN_SPACING, rise: platform.rise + COIN_ABOVE_PLATFORM });
      }
    }

    cursor += width;
  });

  const last = platforms[platforms.length - 1];
  return {
    platforms,
    coins,
    startX: 100,
    finishX: last.x + last.width - 90,
    width: cursor,
  };
}

// Highest a jump lifts the player's feet.
export function maxJumpHeight({ jumpVelocity, gravityY }) {
  return (jumpVelocity * jumpVelocity) / (2 * gravityY);
}

// How far the player travels horizontally before coming back down to a
// platform `riseDelta` px above (negative = below) the one they jumped from.
// Returns 0 if the jump can't get that high.
export function jumpReach({ runSpeed, jumpVelocity, gravityY }, riseDelta = 0) {
  const v = Math.abs(jumpVelocity);
  const discriminant = v * v - 2 * gravityY * riseDelta;
  if (discriminant < 0) return 0;
  const airTime = (v + Math.sqrt(discriminant)) / gravityY;
  return runSpeed * airTime;
}

// `safety` leaves slack for an imperfectly timed jump.
export function isHopClearable(from, to, physics, safety = 0.85) {
  const gap = to.x - (from.x + from.width);
  const riseDelta = to.rise - from.rise;
  if (riseDelta > maxJumpHeight(physics) * safety) return false;
  return gap <= jumpReach(physics, riseDelta) * safety;
}
