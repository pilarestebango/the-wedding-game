import { describe, it, expect } from 'vitest';
import { FrameAnimator } from '../src/logic/FrameAnimator.js';

describe('FrameAnimator', () => {
  it('starts on the first frame', () => {
    const a = new FrameAnimator({ frames: ['a', 'b', 'c'], frameDurationMs: 100 });
    expect(a.currentFrame).toBe('a');
  });

  it('advances one frame per full duration elapsed, looping', () => {
    const a = new FrameAnimator({ frames: ['a', 'b', 'c'], frameDurationMs: 100 });
    expect(a.update(60)).toBe('a');
    expect(a.update(40)).toBe('b');
    expect(a.update(100)).toBe('c');
    expect(a.update(100)).toBe('a');
  });

  it('carries over leftover elapsed time across frame boundaries', () => {
    const a = new FrameAnimator({ frames: ['a', 'b', 'c'], frameDurationMs: 100 });
    a.update(250); // two full frames plus 50ms carried over
    expect(a.currentFrame).toBe('c');
    expect(a.update(50)).toBe('a');
  });

  it('never advances with a single frame', () => {
    const a = new FrameAnimator({ frames: ['only'], frameDurationMs: 100 });
    expect(a.update(500)).toBe('only');
  });

  it('reset returns to the first frame with no elapsed time', () => {
    const a = new FrameAnimator({ frames: ['a', 'b', 'c'], frameDurationMs: 100 });
    a.update(150);
    a.reset();
    expect(a.currentFrame).toBe('a');
    expect(a.update(60)).toBe('a');
  });

  it('advance() jumps to the next frame immediately and restarts the timer', () => {
    const a = new FrameAnimator({ frames: ['a', 'b', 'c'], frameDurationMs: 100 });
    a.update(90); // 90ms into frame "a", not yet advanced
    expect(a.advance()).toBe('b');
    // the 90ms elapsed before advance() should not carry over
    expect(a.update(10)).toBe('b');
  });

  it('advance() loops back to the first frame from the last', () => {
    const a = new FrameAnimator({ frames: ['a', 'b'], frameDurationMs: 100 });
    a.advance();
    expect(a.advance()).toBe('a');
  });
});
