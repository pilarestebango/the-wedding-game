// The single shared seam every gameplay action passes through (CLAUDE.md
// "Input handling" rule). Keyboard handlers and TouchControls both call these
// same methods — game logic never branches on whether input came from a key
// press or a touch event.

// moveStart/moveEnd are "move right" (the only direction PILAR vs JOE has);
// moveLeftStart/moveLeftEnd, shoot and choose (pick dialogue option N) are used
// by the getaway game (/getaway/).
const ACTION_NAMES = [
  'moveStart',
  'moveEnd',
  'moveLeftStart',
  'moveLeftEnd',
  'jump',
  'shoot',
  'mash',
  'choose',
  'confirmYes',
  'confirmNo',
];

export class InputActions {
  constructor() {
    this._handlers = {};
    ACTION_NAMES.forEach((name) => {
      this._handlers[name] = [];
    });
  }

  on(action, fn) {
    if (!this._handlers[action]) return;
    this._handlers[action].push(fn);
  }

  off(action, fn) {
    if (!this._handlers[action]) return;
    this._handlers[action] = this._handlers[action].filter((h) => h !== fn);
  }

  emit(action, payload) {
    if (!this._handlers[action]) return;
    this._handlers[action].forEach((fn) => fn(payload));
  }

  moveStart() {
    this.emit('moveStart');
  }

  moveEnd() {
    this.emit('moveEnd');
  }

  moveLeftStart() {
    this.emit('moveLeftStart');
  }

  moveLeftEnd() {
    this.emit('moveLeftEnd');
  }

  jump() {
    this.emit('jump');
  }

  shoot() {
    this.emit('shoot');
  }

  mash() {
    this.emit('mash');
  }

  choose(index) {
    this.emit('choose', index);
  }

  confirmYes() {
    this.emit('confirmYes');
  }

  confirmNo() {
    this.emit('confirmNo');
  }
}
