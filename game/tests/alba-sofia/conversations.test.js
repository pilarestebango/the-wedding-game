import { describe, it, expect } from 'vitest';
import { Dialogue } from '../../../alba-sofia/src/logic/Dialogue.js';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONVERSATIONS, CONVERSATION_STEPS, SPEAKERS, getConversation } from '../../../alba-sofia/src/config/conversations.js';
import { BOSS } from '../../../alba-sofia/src/config/tuning.js';
import { CHARACTER_MANIFEST, PLAYERS, HOSTS, setPlayer, getPlayer } from '../../../alba-sofia/src/config/characters.js';

const rounds = () => [
  { line: 'one', options: [{ text: 'a', reply: 'no' }, { text: 'b', reply: 'yes', correct: true }, { text: 'c', reply: 'nope' }] },
  { line: 'two', options: [{ text: 'd', reply: 'ok', correct: true }, { text: 'e', reply: 'no' }] },
];

describe('alba-sofia Dialogue', () => {
  it('keeps the round and crosses the option off on a wrong pick', () => {
    const d = new Dialogue(rounds());
    expect(d.choose(0)).toEqual({ reply: 'no', correct: false, done: false });
    expect(d.round.line).toBe('one');
    expect(d.isCrossed(0)).toBe(true);
    expect(d.choose(0)).toBe(null); // can't pick a crossed-off option again
  });

  it('advances on the right pick and starts the next round clean', () => {
    const d = new Dialogue(rounds());
    d.choose(2);
    expect(d.choose(1)).toEqual({ reply: 'yes', correct: true, done: false });
    expect(d.round.line).toBe('two');
    expect(d.isCrossed(2)).toBe(false);
  });

  it('reports done on the last right pick and accepts nothing after', () => {
    const d = new Dialogue(rounds());
    d.choose(1);
    expect(d.choose(0)).toEqual({ reply: 'ok', correct: true, done: true });
    expect(d.done).toBe(true);
    expect(d.round).toBe(null);
    expect(d.choose(0)).toBe(null);
  });

  it('ignores picks that do not exist', () => {
    const d = new Dialogue(rounds());
    expect(d.choose(7)).toBe(null);
    expect(d.choose(-1)).toBe(null);
  });
});

describe('alba-sofia conversation script', () => {
  const all = [];
  Object.entries(CONVERSATIONS).forEach(([lang, script]) => {
    Object.entries(script).forEach(([step, conversation]) => all.push({ lang, step, conversation }));
  });
  const rightIndexes = (conversation) => conversation.map((r) => r.options.findIndex((o) => o.correct));

  it('covers both languages and all three reveals', () => {
    expect(all.length).toBe(2 * 3);
    ['en', 'es'].forEach((lang) => expect(Object.keys(CONVERSATIONS[lang])).toEqual(CONVERSATION_STEPS));
  });

  it('has Pili after level 1, Joe after level 2 and both after the boss', () => {
    expect(SPEAKERS).toEqual({ date: ['pili'], location: ['joe'], full: ['pili', 'joe'] });
  });

  it('says who is talking on every line only where there are two hosts', () => {
    all.forEach(({ lang, step, conversation }) => {
      const where = `${lang}/${step}`;
      const tags = conversation.flatMap((r) => [r.who, ...r.options.map((o) => o.who)]);
      if (SPEAKERS[step].length === 1) {
        tags.forEach((who) => expect(who, where).toBeUndefined());
      } else {
        tags.forEach((who) => expect(SPEAKERS[step], where).toContain(who));
        SPEAKERS[step].forEach((host) => expect(tags, where).toContain(host));
      }
    });
  });

  it('gives the same host each line in English and Spanish', () => {
    CONVERSATION_STEPS.forEach((step) => {
      const tags = (conversation) => conversation.map((r) => [r.who, ...r.options.map((o) => o.who)]);
      expect(tags(CONVERSATIONS.es[step])).toEqual(tags(CONVERSATIONS.en[step]));
    });
  });

  it('has three rounds of three or four options, exactly one of them right, nothing empty', () => {
    all.forEach(({ lang, step, conversation }) => {
      const where = `${lang}/${step}`;
      expect(conversation.length, where).toBe(3);
      conversation.forEach((r) => {
        expect(r.line.trim().length, where).toBeGreaterThan(0);
        expect(r.options.length, where).toBeGreaterThanOrEqual(3);
        expect(r.options.length, where).toBeLessThanOrEqual(4);
        expect(r.options.filter((o) => o.correct).length, where).toBe(1);
        r.options.forEach((o) => {
          expect(o.text.trim().length, where).toBeGreaterThan(0);
          expect(o.reply.trim().length, where).toBeGreaterThan(0);
        });
        expect(new Set(r.options.map((o) => o.text)).size, where).toBe(r.options.length);
      });
    });
  });

  it('does not always put the right option in the same place', () => {
    all.forEach(({ lang, step, conversation }) => {
      expect(new Set(rightIndexes(conversation)).size, `${lang}/${step}`).toBeGreaterThan(1);
    });
  });

  it('gives English and Spanish the same shape', () => {
    CONVERSATION_STEPS.forEach((step) => {
      const en = CONVERSATIONS.en[step];
      const es = CONVERSATIONS.es[step];
      expect(rightIndexes(es)).toEqual(rightIndexes(en));
      expect(es.map((r) => r.options.length)).toEqual(en.map((r) => r.options.length));
    });
  });

  // The last answer of the first two says what to do in the level that
  // follows, so it has to match how that level really plays.
  it('opens with thanks and ends by saying what to do next', () => {
    const lastReply = (conversation) => conversation[2].options.find((o) => o.correct).reply;
    all.forEach(({ lang, step, conversation }) => {
      const where = `${lang}/${step}`;
      expect(conversation[0].line, where).toMatch(/thank|gracias/i);
      const reveal = lastReply(conversation);
      if (step === 'date') {
        expect(reveal, where).toMatch(/lava/i);
        expect(reveal, where).toMatch(/jump|s[aá]lta/i);
        expect(reveal, where).toMatch(/blue|azul/i);
        expect(reveal, where).toMatch(/giant|gigante/i);
      }
      if (step === 'location') {
        expect(reveal, where).toMatch(/shoot up|dispara hacia arriba/i);
        expect(reveal, where).toMatch(/dodge|esquiva/i);
        expect(reveal, where).toMatch(new RegExp(`${BOSS.playerHearts} (hearts|corazones)`));
      }
    });
  });

  it('keeps the getaway out of it: no dates, no place', () => {
    all.forEach(({ lang, step, conversation }) => {
      const text = conversation.flatMap((r) => [r.line, ...r.options.flatMap((o) => [o.text, o.reply])]).join(' ');
      expect(text, `${lang}/${step}`).not.toMatch(/2027|septe?iembre|september|Robledo|Madrid|getaway|escapada/i);
    });
  });

  it('can be played start to finish through Dialogue', () => {
    all.forEach(({ conversation }) => {
      const d = new Dialogue(conversation);
      let guard = 0;
      while (!d.done && guard < 50) {
        const index = d.round.options.findIndex((o, i) => !d.isCrossed(i)); // always the first one left
        d.choose(index);
        guard += 1;
      }
      expect(d.done).toBe(true);
    });
  });

  it('falls back to English for an unknown language', () => {
    expect(getConversation('date', 'fr')).toBe(CONVERSATIONS.en.date);
    expect(getConversation('full', 'es')).toBe(CONVERSATIONS.es.full);
  });
});

describe('alba-sofia characters', () => {
  it('has a file for every image in the manifest', () => {
    const root = fileURLToPath(new URL('../../../alba-sofia/', import.meta.url));
    CHARACTER_MANIFEST.forEach(({ path }) => expect(existsSync(root + path), path).toBe(true));
  });

  it('loads a run cycle and a portrait for both players, and Pili and Joe to wait at the flags', () => {
    const keys = CHARACTER_MANIFEST.map((entry) => entry.key);
    PLAYERS.forEach((char) => ['idle', 'run-0', 'run-1', 'jump', 'portrait'].forEach((pose) => expect(keys).toContain(`${char}-${pose}`)));
    HOSTS.forEach((char) => ['idle', 'portrait'].forEach((pose) => expect(keys).toContain(`${char}-${pose}`)));
    expect(new Set(keys).size).toBe(keys.length);
  });

  // The physics body hangs off the sprite's feet, so a pose in a shorter
  // frame would drop it into the floor (Alba once fell through level 1).
  it('draws every pose of a player in a frame of the same height', () => {
    const root = fileURLToPath(new URL('../../../alba-sofia/', import.meta.url));
    PLAYERS.forEach((char) => {
      const heights = CHARACTER_MANIFEST.filter(({ key }) => key.startsWith(`${char}-`) && !key.endsWith('portrait')).map(
        ({ path }) => readFileSync(root + path).readUInt32BE(20), // a PNG's height, in its IHDR chunk
      );
      expect(heights.length, char).toBe(4);
      expect(new Set(heights).size, char).toBe(1);
    });
  });

  it('only lets Sofia or Alba be picked, Sofia by default', () => {
    expect(getPlayer()).toBe('sofia');
    setPlayer('pili');
    expect(getPlayer()).toBe('sofia');
    setPlayer('alba');
    expect(getPlayer()).toBe('alba');
  });
});
