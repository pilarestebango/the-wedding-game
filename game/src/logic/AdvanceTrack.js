// Backs "hold direction to advance" stages (car, plane, camper van). Driven by
// the same moveStart/moveEnd actions as Level 1 running — not a new input idiom.

export class AdvanceTrack {
  constructor({ distance = 1000, speedPerMs = 0.4 } = {}) {
    this.distance = distance;
    this.speedPerMs = speedPerMs;
    this.progress = 0;
    this.held = false;
  }

  setHeld(v) {
    this.held = !!v;
  }

  update(deltaMs) {
    if (this.held) {
      this.progress = Math.min(this.distance, this.progress + this.speedPerMs * deltaMs);
    }
    return this.progress;
  }

  get percent() {
    return this.progress / this.distance;
  }

  get isComplete() {
    return this.progress >= this.distance;
  }

  reset() {
    this.progress = 0;
    this.held = false;
  }
}
