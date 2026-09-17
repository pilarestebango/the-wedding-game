// Backs every "mash to fill" mechanic: drink, talk, pay, propose, tent-fill,
// island-fill. Pure state machine, no rendering — scenes read .percent/.complete.

export class MashMeter {
  constructor({ target = 20, max = 100 } = {}) {
    this.target = target;
    this.max = max;
    this.presses = 0;
    this.value = 0;
    this.complete = false;
  }

  press() {
    if (this.complete) return this.value;
    this.presses += 1;
    this.value = Math.min(this.max, (this.presses / this.target) * this.max);
    this.complete = this.value >= this.max;
    return this.value;
  }

  get percent() {
    return this.value / this.max;
  }

  reset() {
    this.presses = 0;
    this.value = 0;
    this.complete = false;
  }
}
