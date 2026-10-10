// Hit points for anything that can be hurt: big monsters, the boss, and the
// player's hearts in the boss fight.

export class Health {
  constructor(max = 1) {
    this.max = Math.max(1, max);
    this.current = this.max;
  }

  hit(amount = 1) {
    this.current = Math.max(0, this.current - amount);
    return this.current;
  }

  get isDead() {
    return this.current === 0;
  }

  get fraction() {
    return this.current / this.max;
  }
}
