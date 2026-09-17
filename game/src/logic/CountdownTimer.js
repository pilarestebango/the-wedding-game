// Backs the 17s Pili "Wait" scene — zero input, just a ticking countdown.

export class CountdownTimer {
  constructor({ seconds = 17 } = {}) {
    this.totalMs = seconds * 1000;
    this.remainingMs = this.totalMs;
    this.isComplete = false;
  }

  update(deltaMs) {
    if (this.isComplete) return this.remainingMs;
    this.remainingMs = Math.max(0, this.remainingMs - deltaMs);
    if (this.remainingMs <= 0) this.isComplete = true;
    return this.remainingMs;
  }

  get remainingSeconds() {
    return Math.ceil(this.remainingMs / 1000);
  }

  get percent() {
    return 1 - this.remainingMs / this.totalMs;
  }

  reset() {
    this.remainingMs = this.totalMs;
    this.isComplete = false;
  }
}
