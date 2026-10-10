import { describe, it, expect } from 'vitest';
import { Dialogue } from '../../../getaway/src/logic/Dialogue.js';
import { CONVERSATIONS, CONVERSATION_STEPS, getConversation } from '../../../getaway/src/config/conversations.js';

const rounds = () => [
  { line: 'one', options: [{ text: 'a', reply: 'no' }, { text: 'b', reply: 'yes', correct: true }, { text: 'c', reply: 'nope' }] },
  { line: 'two', options: [{ text: 'd', reply: 'ok', correct: true }, { text: 'e', reply: 'no' }] },
];

describe('getaway Dialogue', () => {
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

describe('getaway conversation script', () => {
  const all = [];
  Object.entries(CONVERSATIONS).forEach(([lang, script]) => {
    Object.entries(script).forEach(([char, steps]) => {
      Object.entries(steps).forEach(([step, conversation]) => all.push({ lang, char, step, conversation }));
    });
  });
  const rightIndexes = (conversation) => conversation.map((r) => r.options.findIndex((o) => o.correct));

  it('covers both languages, both characters and all three reveals', () => {
    expect(all.length).toBe(2 * 2 * 3);
    ['en', 'es'].forEach((lang) => ['pili', 'joe'].forEach((char) => {
      expect(Object.keys(CONVERSATIONS[lang][char])).toEqual(CONVERSATION_STEPS);
    }));
  });

  it('has three rounds of three or four options, exactly one of them right, nothing empty', () => {
    all.forEach(({ lang, char, step, conversation }) => {
      const where = `${lang}/${char}/${step}`;
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
    all.forEach(({ lang, char, step, conversation }) => {
      expect(new Set(rightIndexes(conversation)).size, `${lang}/${char}/${step}`).toBeGreaterThan(1);
    });
  });

  it('gives English and Spanish the same shape', () => {
    ['pili', 'joe'].forEach((char) => CONVERSATION_STEPS.forEach((step) => {
      const en = CONVERSATIONS.en[char][step];
      const es = CONVERSATIONS.es[char][step];
      expect(rightIndexes(es)).toEqual(rightIndexes(en));
      expect(es.map((r) => r.options.length)).toEqual(en.map((r) => r.options.length));
    }));
  });

  it('opens with thanks and ends by giving the right facts', () => {
    const lastReply = (conversation) => conversation[2].options.find((o) => o.correct).reply;
    all.forEach(({ lang, char, step, conversation }) => {
      const where = `${lang}/${char}/${step}`;
      expect(conversation[0].line, where).toMatch(/thank|gracias/i);
      const reveal = lastReply(conversation);
      if (step === 'date') {
        expect(reveal, where).toMatch(/13/);
        expect(reveal, where).toMatch(/18/);
        expect(reveal, where).toMatch(/2027/);
        expect(reveal, where).toMatch(/septe?iembre|september/i);
      }
      if (step === 'location') {
        expect(reveal, where).toMatch(/Robledo de Chavela/);
        expect(reveal, where).toMatch(/55 min/);
        expect(reveal, where).toMatch(/Madrid/);
      }
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

  it('falls back to English and to Pili for unknown input', () => {
    expect(getConversation('joe', 'date', 'fr')).toBe(CONVERSATIONS.en.joe.date);
    expect(getConversation('nobody', 'full', 'es')).toBe(CONVERSATIONS.es.pili.full);
  });
});
