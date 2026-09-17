import { describe, it, expect } from 'vitest';
import { MashMeter } from '../src/logic/MashMeter.js';

describe('MashMeter', () => {
  it('fills toward 100 as presses accumulate', () => {
    const m = new MashMeter({ target: 4, max: 100 });
    expect(m.value).toBe(0);
    m.press();
    expect(m.value).toBe(25);
    m.press();
    m.press();
    expect(m.value).toBe(75);
    expect(m.complete).toBe(false);
  });

  it('marks complete once target presses reached, clamped at max', () => {
    const m = new MashMeter({ target: 3, max: 100 });
    m.press();
    m.press();
    m.press();
    expect(m.value).toBe(100);
    expect(m.complete).toBe(true);
    expect(m.percent).toBe(1);
  });

  it('ignores presses after completion', () => {
    const m = new MashMeter({ target: 2, max: 100 });
    m.press();
    m.press();
    const valueAtComplete = m.value;
    m.press();
    m.press();
    expect(m.value).toBe(valueAtComplete);
    expect(m.presses).toBe(2);
  });

  it('reset returns to initial state', () => {
    const m = new MashMeter({ target: 2, max: 100 });
    m.press();
    m.press();
    m.reset();
    expect(m.value).toBe(0);
    expect(m.presses).toBe(0);
    expect(m.complete).toBe(false);
  });
});
