// On-screen touch control bar (GAME_SPEC.md §3). One persistent DOM singleton
// (see touchControlsInstance.js) rather than per-scene Phaser GameObjects, so
// CSS handles safe-area insets / tap-target sizing / show-hide instead of
// fighting Phaser's camera/resize system. Keyboard handlers in each scene and
// these buttons both call the exact same InputActions methods — see
// CLAUDE.md's "Input handling" rule.
//
// Docked as a normal-flow row below #game-root inside #app (see index.html),
// not a fixed overlay — that way it reserves its own strip of the viewport
// and the Phaser canvas (sized off #game-root's actual box, see main.js)
// shrinks to fit above it, so controls never sit on top of gameplay. This
// matters most in portrait, where the game now plays natively without
// requiring a rotate to landscape.

import { CSS_COLORS, FONTS } from '../config/palette.js';
import { t } from '../config/i18n.js';

const STYLE_ID = 'touch-controls-style';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .touch-controls {
      display: none;
      flex-shrink: 0;
      /* Fixed regardless of which buttons a scene shows/hides (tc-hidden
         toggles visibility, never this row's box) — the Phaser canvas is
         sized off #game-root's box (see main.js), which is everything
         outside this row, so if this row's height varied per scene the
         canvas would resize mid-create() out from under elements a scene
         already positioned against the old size. Height is 64px (the
         tallest button, the full-width action bar) + this padding, constant
         for the whole session once touch/narrow-viewport is detected. */
      min-height: 64px;
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: ${CSS_COLORS.background};
      border-top: 3px solid ${CSS_COLORS.mutedPurple};
      font-family: ${FONTS.heading};
    }
    .touch-controls.tc-touch { display: flex; }
    @media (max-width: 820px) {
      .touch-controls { display: flex; }
    }
    .tc-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex: 1;
      justify-content: flex-start;
    }
    .tc-group-right { justify-content: flex-end; }
    .tc-btn {
      pointer-events: auto;
      min-width: 56px;
      min-height: 56px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 3px solid ${CSS_COLORS.cyan};
      background: ${CSS_COLORS.background};
      color: ${CSS_COLORS.offWhite};
      font-family: ${FONTS.heading};
      font-size: 10px;
      line-height: 1.4;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.4);
    }
    .tc-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 rgba(0,0,0,0.4); }
    .tc-dpad { font-size: 20px; border-color: ${CSS_COLORS.gold}; }
    .tc-jump { border-color: ${CSS_COLORS.gold}; }
    /* The primary mash/confirm button (READY!/DRINK!/TALK!/GO!/PROPOSE!/
       DANCE!) — a square, full-width bar rather than a small circle, since
       it's always the sole visible control when it's shown (see bind()). */
    .tc-action {
      flex: 1;
      min-height: 64px;
      border-radius: 10px;
      border-color: ${CSS_COLORS.red};
      font-size: 16px;
    }
    .tc-yes { border-color: ${CSS_COLORS.gold}; }
    .tc-no { border-color: ${CSS_COLORS.red}; }
    .tc-hidden { display: none !important; }
  `;
  document.head.appendChild(style);
}

function isTouchCapable() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export class TouchControls {
  constructor() {
    injectStyles();
    this.currentActions = null;
    this._buildDom();
    if (isTouchCapable()) this.root.classList.add('tc-touch');
  }

  _buildDom() {
    this.root = document.createElement('div');
    this.root.className = 'touch-controls';

    this.dpadRight = this._makeButton('▶', 'tc-btn tc-dpad');
    const leftGroup = document.createElement('div');
    leftGroup.className = 'tc-group';
    leftGroup.appendChild(this.dpadRight);

    this.jumpBtn = this._makeButton(t('jumpLabel'), 'tc-btn tc-jump');
    this.actionBtn = this._makeButton(t('goLabel'), 'tc-btn tc-action');
    this.yesBtn = this._makeButton(t('yesChoice'), 'tc-btn tc-yes');
    this.noBtn = this._makeButton(t('noChoice'), 'tc-btn tc-no');
    const rightGroup = document.createElement('div');
    rightGroup.className = 'tc-group tc-group-right';
    rightGroup.appendChild(this.jumpBtn);
    rightGroup.appendChild(this.actionBtn);
    rightGroup.appendChild(this.yesBtn);
    rightGroup.appendChild(this.noBtn);

    this.root.appendChild(leftGroup);
    this.root.appendChild(rightGroup);
    (document.getElementById('app') ?? document.body).appendChild(this.root);

    this._wireHoldButton(this.dpadRight, () => this.currentActions?.moveStart(), () => this.currentActions?.moveEnd());
    this._wireTapButton(this.jumpBtn, () => this.currentActions?.jump());
    this._wireTapButton(this.actionBtn, () => this.currentActions?.mash());
    this._wireTapButton(this.yesBtn, () => this.currentActions?.confirmYes());
    this._wireTapButton(this.noBtn, () => this.currentActions?.confirmNo());

    // Nothing shows until a scene explicitly binds it — this is a persistent
    // singleton that survives scene transitions, so without this a scene that
    // forgets to bind/unbind would leak the previous scene's buttons.
    this.unbind();
  }

  _makeButton(label, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = label;
    return btn;
  }

  _wireTapButton(btn, fn) {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      fn();
    });
  }

  _wireHoldButton(btn, onStart, onEnd) {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onStart();
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
      btn.addEventListener(evt, (e) => {
        e.preventDefault();
        onEnd();
      });
    });
  }

  // JUMP/YES/NO never get a per-scene label (unlike the action button, which
  // scenes always pass their own translated actionLabel for) — refreshed
  // here so a language change (which restarts the scene, which re-binds)
  // updates them too, without this DOM singleton needing its own
  // onLangChange subscription.
  refreshStaticLabels() {
    this.jumpBtn.textContent = t('jumpLabel');
    this.yesBtn.textContent = t('yesChoice');
    this.noBtn.textContent = t('noChoice');
  }

  bind(actions, { showDpad = false, showJump = false, actionLabel = null, showYesNo = false } = {}) {
    this.refreshStaticLabels();
    this.currentActions = actions;
    this.dpadRight.parentElement.classList.toggle('tc-hidden', !showDpad);
    this.jumpBtn.classList.toggle('tc-hidden', !showJump);
    this.yesBtn.classList.toggle('tc-hidden', !showYesNo);
    this.noBtn.classList.toggle('tc-hidden', !showYesNo);
    if (actionLabel) {
      this.actionBtn.textContent = actionLabel;
      this.actionBtn.classList.remove('tc-hidden');
    } else {
      this.actionBtn.classList.add('tc-hidden');
    }
  }

  unbind() {
    this.currentActions = null;
    this.dpadRight.parentElement.classList.add('tc-hidden');
    this.jumpBtn.classList.add('tc-hidden');
    this.actionBtn.classList.add('tc-hidden');
    this.yesBtn.classList.add('tc-hidden');
    this.noBtn.classList.add('tc-hidden');
  }
}
