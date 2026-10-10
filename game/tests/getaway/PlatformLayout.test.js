import { describe, it, expect } from 'vitest';
import {
  buildPlatformLayout,
  isHopClearable,
  jumpReach,
  maxJumpHeight,
} from '../../../getaway/src/logic/PlatformLayout.js';
import { PLAYER, LEVEL1 } from '../../../getaway/src/config/tuning.js';

describe('getaway PlatformLayout', () => {
  // The tallest rise step is the hardest version of the level.
  const layout = buildPlatformLayout({ riseUnit: LEVEL1.maxRiseUnit });

  it('holds plenty more coins than the target', () => {
    expect(layout.coins.length).toBeGreaterThanOrEqual(LEVEL1.coinTarget + 30);
  });

  it('lays platforms left to right without overlapping', () => {
    layout.platforms.slice(1).forEach((p, i) => {
      const prev = layout.platforms[i];
      expect(p.x).toBeGreaterThan(prev.x + prev.width);
    });
  });

  it('makes every hop clearable with the tuned jump, in both directions', () => {
    layout.platforms.slice(1).forEach((p, i) => {
      const prev = layout.platforms[i];
      expect(isHopClearable(prev, p, PLAYER), `hop ${i} -> ${i + 1}`).toBe(true);
      // Going back for a missed coin: mirror the pair so "to" is on the right.
      const gap = p.x - (prev.x + prev.width);
      const mirroredTo = { x: p.x + p.width + gap, width: prev.width, rise: prev.rise };
      expect(isHopClearable(p, mirroredTo, PLAYER), `hop ${i + 1} -> ${i}`).toBe(true);
    });
  });

  it('keeps every coin within reach of a jump from a neighbouring platform', () => {
    const reach = maxJumpHeight(PLAYER) + 70; // feet at the apex + most of the body
    layout.coins.forEach((coin) => {
      const near = layout.platforms.filter((p) => coin.x > p.x - 160 && coin.x < p.x + p.width + 160);
      expect(near.length).toBeGreaterThan(0);
      expect(near.some((p) => coin.rise - p.rise <= reach)).toBe(true);
    });
  });

  it('puts the start and the exit on the first and last platforms', () => {
    const first = layout.platforms[0];
    const last = layout.platforms[layout.platforms.length - 1];
    expect(layout.startX).toBeGreaterThan(first.x);
    expect(layout.startX).toBeLessThan(first.x + first.width);
    expect(layout.finishX).toBeGreaterThan(last.x);
    expect(layout.finishX).toBeLessThan(last.x + last.width);
  });

  it('scales rises with the rise unit', () => {
    const small = buildPlatformLayout({ riseUnit: LEVEL1.minRiseUnit });
    expect(Math.max(...small.platforms.map((p) => p.rise))).toBe(2 * LEVEL1.minRiseUnit);
    expect(small.coins.length).toBe(layout.coins.length);
  });
});

describe('getaway jump maths', () => {
  it('computes apex height and level-ground reach', () => {
    const physics = { runSpeed: 100, jumpVelocity: -300, gravityY: 900 };
    expect(maxJumpHeight(physics)).toBe(50);
    expect(jumpReach(physics, 0)).toBeCloseTo(100 * (600 / 900));
  });

  it('reaches less far going up, further going down, nowhere above the apex', () => {
    const level = jumpReach(PLAYER, 0);
    expect(jumpReach(PLAYER, 60)).toBeLessThan(level);
    expect(jumpReach(PLAYER, -60)).toBeGreaterThan(level);
    expect(jumpReach(PLAYER, maxJumpHeight(PLAYER) + 1)).toBe(0);
  });
});
