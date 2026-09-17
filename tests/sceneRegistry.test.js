import { describe, it, expect } from 'vitest';
import { SCENES, keyForSlug, slugForKey } from '../src/config/sceneRegistry.js';

describe('sceneRegistry', () => {
  it('has unique slugs and unique keys', () => {
    const slugs = SCENES.map((s) => s.slug);
    const keys = SCENES.map((s) => s.key);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('round-trips slug -> key -> slug', () => {
    SCENES.forEach(({ slug, key }) => {
      expect(keyForSlug(slug)).toBe(key);
      expect(slugForKey(key)).toBe(slug);
    });
  });

  it('returns null for unknown slugs/keys', () => {
    expect(keyForSlug('not-a-real-scene')).toBe(null);
    expect(slugForKey('NotARealKey')).toBe(null);
  });

  it('includes every scene from the game flow', () => {
    const slugs = SCENES.map((s) => s.slug);
    [
      'boot',
      'char-select',
      'level1',
      'level1-boss',
      'level2',
      'level2-boss',
      'level3-wait',
      'level3-rings',
      'final-boss',
      'ending',
    ].forEach((expected) => expect(slugs).toContain(expected));
  });
});
