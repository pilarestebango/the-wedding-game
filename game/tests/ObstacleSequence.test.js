import { describe, it, expect } from 'vitest';
import {
  getObstacleSequence,
  buildObstacleLayout,
  PILI_OBSTACLES,
  JOE_OBSTACLES,
} from '../src/logic/ObstacleSequence.js';
import { buildRingLayout } from '../src/logic/RingSequence.js';
import { RINGS } from '../src/config/tuning.js';

describe('ObstacleSequence', () => {
  it('returns the fixed 7-obstacle Pili sequence by default', () => {
    expect(getObstacleSequence('pili')).toEqual(PILI_OBSTACLES);
    expect(getObstacleSequence('pili')).toHaveLength(7);
  });

  it('returns the fixed 7-obstacle Joe sequence', () => {
    expect(getObstacleSequence('joe')).toEqual(JOE_OBSTACLES);
    expect(getObstacleSequence('joe')).toHaveLength(7);
  });

  it('builds a layout with increasing x positions and cleared=false', () => {
    const layout = buildObstacleLayout(['beer', 'kangaroo'], { spacingPx: 100, startX: 500 });
    expect(layout).toEqual([
      { type: 'beer', x: 500, cleared: false },
      { type: 'kangaroo', x: 600, cleared: false },
    ]);
  });
});

describe('RingSequence', () => {
  it('builds the default single-ring layout', () => {
    const rings = buildRingLayout();
    expect(rings).toHaveLength(1);
    expect(rings[0].collected).toBe(false);
  });

  it('builds a layout with increasing x positions for a custom count', () => {
    const rings = buildRingLayout({ count: 3, spacing: 100, startX: 500 });
    expect(rings).toHaveLength(3);
    expect(rings[2].x).toBeGreaterThan(rings[0].x);
  });

  it('Level 3 (Joe) is configured to collect 7 rings', () => {
    expect(RINGS.count).toBe(7);
    const rings = buildRingLayout({ count: RINGS.count, spacing: RINGS.spacing, startX: RINGS.startX });
    expect(rings).toHaveLength(7);
  });
});
