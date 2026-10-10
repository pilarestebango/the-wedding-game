// The state of one end-of-level conversation (no Phaser, so it's unit-tested).
//
// A conversation is a list of rounds. Each round is one line from the
// character and a few replies the player can pick from; exactly one reply
// moves the conversation on. A wrong pick gets its own (joke) answer and is
// crossed off, and the player picks again — there's no way to fail.

export class Dialogue {
  constructor(rounds) {
    this.rounds = rounds;
    this.roundIndex = 0;
    this.crossed = new Set();
  }

  get done() {
    return this.roundIndex >= this.rounds.length;
  }

  // The round being played, or null once the conversation is over.
  get round() {
    return this.done ? null : this.rounds[this.roundIndex];
  }

  isCrossed(index) {
    return this.crossed.has(index);
  }

  // Picks option `index` of the current round. Returns null if that isn't a
  // valid pick (conversation over, no such option, already crossed off);
  // otherwise the character's answer, whether it was the right pick, and
  // whether that was the end of the conversation.
  choose(index) {
    const option = this.round?.options[index];
    if (!option || this.crossed.has(index)) return null;
    if (!option.correct) {
      this.crossed.add(index);
      return { reply: option.reply, correct: false, done: false };
    }
    this.roundIndex += 1;
    this.crossed.clear();
    return { reply: option.reply, correct: true, done: this.done };
  }
}
