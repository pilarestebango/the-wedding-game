// Cycles an array of texture keys on a timer. Backs the code-drawn character
// run cycle (setTexture swap) without needing a Phaser spritesheet/JSON.

export class FrameAnimator {
  constructor({ frames = [], frameDurationMs = 140 } = {}) {
    this.frames = frames;
    this.frameDurationMs = frameDurationMs;
    this.elapsedMs = 0;
    this.index = 0;
  }

  get currentFrame() {
    return this.frames[this.index];
  }

  update(deltaMs) {
    if (this.frames.length <= 1) return this.currentFrame;
    this.elapsedMs += deltaMs;
    while (this.elapsedMs >= this.frameDurationMs) {
      this.elapsedMs -= this.frameDurationMs;
      this.index = (this.index + 1) % this.frames.length;
    }
    return this.currentFrame;
  }

  reset() {
    this.elapsedMs = 0;
    this.index = 0;
  }

  // Skip straight to the next frame (e.g. on player input) and restart the
  // timer, so the automatic cycle doesn't immediately re-advance on top of it.
  advance() {
    if (this.frames.length === 0) return this.currentFrame;
    this.elapsedMs = 0;
    this.index = (this.index + 1) % this.frames.length;
    return this.currentFrame;
  }
}
