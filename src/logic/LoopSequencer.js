// Generic "run N loops of an ordered phase list." Backs Level1Boss's 3x
// [drink -> talk], reusable anywhere else a cyclic phase sequence shows up.

export class LoopSequencer {
  constructor({ phases = [], loops = 1 } = {}) {
    this.phases = phases;
    this.loops = loops;
    this.loopIndex = 0;
    this.phaseIndex = 0;
    this.done = false;
  }

  get currentPhase() {
    if (this.done) return null;
    return this.phases[this.phaseIndex];
  }

  get loopNumber() {
    return this.loopIndex + 1; // 1-based, for display
  }

  advance() {
    if (this.done) return null;
    this.phaseIndex += 1;
    if (this.phaseIndex >= this.phases.length) {
      this.phaseIndex = 0;
      this.loopIndex += 1;
      if (this.loopIndex >= this.loops) {
        this.done = true;
        return null;
      }
    }
    return this.currentPhase;
  }

  reset() {
    this.loopIndex = 0;
    this.phaseIndex = 0;
    this.done = false;
  }
}
