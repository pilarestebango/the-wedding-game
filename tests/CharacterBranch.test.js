import { describe, it, expect } from 'vitest';
import { resolveLevel3Scene, resolveLevel3Slug } from '../src/logic/CharacterBranch.js';
import { JOURNEY_STAGES, nextStage, stageIndexById } from '../src/logic/JourneyStages.js';

describe('CharacterBranch', () => {
  it('routes joe to the Rings branch', () => {
    expect(resolveLevel3Scene('joe')).toBe('Level3Rings');
    expect(resolveLevel3Slug('joe')).toBe('level3-rings');
  });

  it('routes pili (and any other value) to the Wait branch', () => {
    expect(resolveLevel3Scene('pili')).toBe('Level3Wait');
    expect(resolveLevel3Scene(undefined)).toBe('Level3Wait');
  });
});

describe('JourneyStages', () => {
  it('has the 6 stages in the spec order', () => {
    expect(JOURNEY_STAGES.map((s) => s.id)).toEqual([
      'car',
      'tent',
      'plane',
      'island',
      'campervan',
      'house',
    ]);
  });

  it('nextStage walks forward and returns null at the end', () => {
    expect(nextStage('car').id).toBe('tent');
    expect(nextStage('house')).toBe(null);
  });

  it('stageIndexById finds the right index', () => {
    expect(stageIndexById('island')).toBe(3);
    expect(stageIndexById('nonexistent')).toBe(-1);
  });
});
