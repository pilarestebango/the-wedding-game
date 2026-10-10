import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { Health } from '../../../getaway/src/logic/Health.js';
import { buildMarsLevel } from '../../../getaway/src/logic/MarsLayout.js';
import { SCENES, entryForSlug, keyForSlug } from '../../../getaway/src/config/sceneRegistry.js';
import { maxJumpHeight, jumpReach, isHopClearable } from '../../../getaway/src/logic/PlatformLayout.js';
import { GRIDS, gridSize, monsterSize, MONSTER_SHEETS } from '../../../getaway/src/config/art.js';
import { PLAYER, LEVEL2 } from '../../../getaway/src/config/tuning.js';
import { InputActions } from '../../src/logic/InputActions.js';

describe('getaway Health', () => {
  it('counts down to dead and never below zero', () => {
    const h = new Health(3);
    expect(h.fraction).toBe(1);
    expect(h.isDead).toBe(false);
    h.hit();
    expect(h.current).toBe(2);
    h.hit(5);
    expect(h.current).toBe(0);
    expect(h.isDead).toBe(true);
    expect(h.fraction).toBe(0);
  });
});

describe('getaway MarsLayout', () => {
  // The tallest tier step is the hardest version of the level.
  const level = buildMarsLevel({ tierRise: LEVEL2.maxTierRise });
  const end = (s) => s.x + s.width;

  it('plays on three heights', () => {
    expect(new Set([...level.ground, ...level.platforms].map((s) => s.tier))).toEqual(new Set([0, 1, 2]));
    expect(new Set(level.monsters.map((m) => m.tier))).toEqual(new Set([0, 1, 2]));
  });

  it('breaks the ground with pits too wide to jump', () => {
    expect(level.ground.length).toBeGreaterThan(1);
    level.ground.slice(1).forEach((g, i) => {
      expect(g.x - end(level.ground[i])).toBeGreaterThan(jumpReach(PLAYER, 0));
    });
  });

  it('gives every pit a crossing whose every hop is clearable', () => {
    expect(level.crossings.length).toBe(level.ground.length - 1);
    level.crossings.forEach((crossing, i) => {
      const path = [level.ground[i], ...crossing, level.ground[i + 1]];
      path.slice(1).forEach((to, n) => {
        expect(isHopClearable(path[n], to, PLAYER), `pit ${i}, hop ${n}`).toBe(true);
      });
    });
  });

  it('stands every monster on a surface and keeps its patrol on it', () => {
    const surfaces = [...level.ground, ...level.platforms];
    level.monsters.forEach((m) => {
      const surface = surfaces.find((s) => s.tier === m.tier && m.x >= s.x && m.x <= end(s));
      expect(surface, `monster ${m.index}`).toBeDefined();
      const [min, max] = m.patrol;
      expect(min).toBeLessThan(max);
      expect(min).toBeGreaterThanOrEqual(surface.x);
      expect(max).toBeLessThanOrEqual(end(surface));
    });
  });

  it('leaves a landing spot on any platform that has a monster', () => {
    level.monsters.filter((m) => m.tier > 0).forEach((m) => {
      const platform = level.platforms.find((p) => p.tier === m.tier && m.x >= p.x && m.x <= end(p));
      expect(m.patrol[0] - platform.x).toBeGreaterThan(gridSize('monster-small').width + 40);
    });
  });

  it('keeps platforms away from big monsters, so they cannot be bypassed', () => {
    level.monsters.filter((m) => m.type !== 'small').forEach((m) => {
      expect(m.tier).toBe(0);
      level.platforms.forEach((p) => {
        const clear = p.x > m.patrol[1] + 300 || end(p) < m.patrol[0] - 300;
        expect(clear, `monster ${m.index} vs platform at ${p.x}`).toBe(true);
      });
    });
  });

  it('ends on a single giant with the most health, then the exit', () => {
    const giants = level.monsters.filter((m) => m.type === 'giant');
    const last = level.monsters[level.monsters.length - 1];
    expect(giants).toEqual([last]);
    expect(LEVEL2.giant.hp).toBeGreaterThan(LEVEL2.big.hp);
    expect(level.finishX).toBeGreaterThan(last.x);
    expect(level.width).toBeGreaterThan(level.finishX);
  });
});

describe('getaway art grids', () => {
  it('are rectangular and only use characters that have a colour', () => {
    Object.entries(GRIDS).forEach(([name, { rows, colors }]) => {
      rows.forEach((row) => {
        expect(row.length, `${name}: "${row}"`).toBe(rows[0].length);
        [...row].forEach((ch) => expect(ch === '.' || colors[ch] !== undefined, `${name}: "${ch}"`).toBe(true));
      });
    });
  });

  it('makes small monsters jumpable and big monsters not', () => {
    const apex = maxJumpHeight(PLAYER);
    expect(gridSize('monster-small').height).toBeLessThan(apex * 0.6);
    expect(monsterSize('big').height).toBeGreaterThan(apex * 1.2);
    expect(monsterSize('giant').height).toBeGreaterThan(monsterSize('big').height);
  });

  // A lossless .webp keeps its size in 28 bits after the "VP8L" chunk header.
  it('slices each monster sheet into whole frames that cover every pose', () => {
    Object.entries(MONSTER_SHEETS).forEach(([type, sheet]) => {
      const file = readFileSync(new URL(`../../${sheet.path}`, import.meta.url));
      expect(file.toString('latin1', 12, 16), type).toBe('VP8L');
      const bits = file.readUInt32LE(21);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      expect(height, type).toBe(sheet.frameHeight);
      expect(width % sheet.frameWidth, type).toBe(0);
      const used = Object.values(sheet.frames).flat();
      expect(Math.max(...used), type).toBe(width / sheet.frameWidth - 1);
    });
  });

  it('keeps level 2 shots low enough to hit a small monster', () => {
    expect(LEVEL2.bulletHeight).toBeLessThan(gridSize('monster-small').height);
  });
});

describe('getaway sceneRegistry', () => {
  it('has unique slugs and resolves them', () => {
    const slugs = SCENES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(keyForSlug('level2')).toBe('Level2Mars');
    expect(entryForSlug('talk-location').data).toEqual({ step: 'location' });
    expect(keyForSlug('talk-full')).toBe('Conversation');
    expect(keyForSlug('nope')).toBe(null);
  });
});

describe('InputActions (actions added for the getaway game)', () => {
  it('emits move-left and shoot to their listeners', () => {
    const actions = new InputActions();
    const seen = [];
    ['moveLeftStart', 'moveLeftEnd', 'shoot'].forEach((name) => actions.on(name, () => seen.push(name)));
    actions.moveLeftStart();
    actions.moveLeftEnd();
    actions.shoot();
    expect(seen).toEqual(['moveLeftStart', 'moveLeftEnd', 'shoot']);
  });
});
