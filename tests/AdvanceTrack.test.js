import { describe, it, expect } from 'vitest';
import { AdvanceTrack } from '../src/logic/AdvanceTrack.js';
import { CountdownTimer } from '../src/logic/CountdownTimer.js';
import { LoopSequencer } from '../src/logic/LoopSequencer.js';

describe('AdvanceTrack', () => {
  it('only progresses while held', () => {
    const t = new AdvanceTrack({ distance: 100, speedPerMs: 1 });
    t.update(50);
    expect(t.progress).toBe(0);
    t.setHeld(true);
    t.update(50);
    expect(t.progress).toBe(50);
    t.setHeld(false);
    t.update(50);
    expect(t.progress).toBe(50);
  });

  it('completes once progress reaches distance, clamped', () => {
    const t = new AdvanceTrack({ distance: 100, speedPerMs: 1 });
    t.setHeld(true);
    t.update(200);
    expect(t.progress).toBe(100);
    expect(t.isComplete).toBe(true);
    expect(t.percent).toBe(1);
  });
});

describe('CountdownTimer', () => {
  it('counts down to zero and completes', () => {
    const timer = new CountdownTimer({ seconds: 17 });
    expect(timer.remainingSeconds).toBe(17);
    timer.update(10000);
    expect(timer.isComplete).toBe(false);
    timer.update(10000);
    expect(timer.remainingMs).toBe(0);
    expect(timer.isComplete).toBe(true);
  });
});

describe('LoopSequencer', () => {
  it('cycles through phases and loops the configured number of times', () => {
    const seq = new LoopSequencer({ phases: ['drink', 'talk'], loops: 3 });
    expect(seq.currentPhase).toBe('drink');
    expect(seq.loopNumber).toBe(1);
    expect(seq.advance()).toBe('talk');
    expect(seq.advance()).toBe('drink'); // loop 2
    expect(seq.loopNumber).toBe(2);
    seq.advance(); // talk, loop 2
    seq.advance(); // drink, loop 3
    expect(seq.loopNumber).toBe(3);
    seq.advance(); // talk, loop 3
    expect(seq.advance()).toBe(null); // done after 3 loops
    expect(seq.done).toBe(true);
  });
});
