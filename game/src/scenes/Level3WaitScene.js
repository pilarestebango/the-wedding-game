// LEVEL 3 (Pili branch) — The Wait (GAME_SPEC.md §6). 17-second countdown
// that always completes on its own either way. Pili idles between two calm
// poses while waiting; each tap of the mash/action input (SPACE, the arrow
// keys, or the touch "DANCE!" button) immediately snaps her to the next
// pose in her real dance-move frames (reference/dance01.jpeg + dance02.jpeg
// — see characterSprites.js). Frame changes are tap-driven, not timer-driven,
// so she never "catches up" late to a press. After a short idle gap with no
// taps, she settles back to her calm waiting sway.
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { LEVEL3_WAIT_SECONDS, FRAME_ANIM } from '../config/tuning.js';
import { danceFrameKeys, boringFrameKeys } from '../config/characterSprites.js';
import { gameState } from '../state/gameState.js';
import { CountdownTimer } from '../logic/CountdownTimer.js';
import { FrameAnimator } from '../logic/FrameAnimator.js';
import { InputActions } from '../logic/InputActions.js';
import { MeterBar } from '../ui/MeterBar.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import { t } from '../config/i18n.js';

export class Level3WaitScene extends Phaser.Scene {
  constructor() {
    super('Level3Wait');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    this.cameras.main.fadeIn(300, 18, 11, 46);

    const title = this.add
      .text(centerX, 54, t('theWaitTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '18px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    fitTopTitle(this, title);

    this.boringAnimator = new FrameAnimator({
      frames: boringFrameKeys(),
      frameDurationMs: FRAME_ANIM.boringFrameDurationMs,
    });
    this.danceAnimator = new FrameAnimator({
      frames: danceFrameKeys(),
      frameDurationMs: FRAME_ANIM.danceFrameDurationMs,
    });
    this.isDancing = false;
    // How long to keep showing dance poses after the most recent tap before
    // falling back to the idle sway — not a fixed-length animation loop.
    this.danceIdleTimeoutMs = FRAME_ANIM.danceFrameDurationMs * 2;
    this.msSinceLastTap = 0;

    const maxHeight = height * 0.55;
    // Feet-anchored: pose frames vary in height (arms-up vs. a crouch), so
    // origin (0.5, 1) at a fixed ground line keeps her feet planted instead
    // of bobbing as frames swap. Scale is derived once from the first frame
    // and reused for every frame — same art scale throughout, letting each
    // pose's real bounding box (taller reaching up, shorter crouching) show.
    const initialFrame = this.textures.get(this.boringAnimator.currentFrame).getSourceImage();
    // Half the size she'd otherwise render at, since she's just idling here.
    this.baseScale = Math.min(1, maxHeight / initialFrame.height) * 0.5;
    // Ground line puts her vertical center on the screen's vertical center
    // (using the reference/idle frame's rendered height), so she reads as
    // sitting up in the middle of the screen rather than down near the UI.
    const groundY = height / 2 + (initialFrame.height * this.baseScale) / 2;
    this.img = this.add
      .image(centerX, groundY, this.boringAnimator.currentFrame)
      .setOrigin(0.5, 1)
      .setScale(this.baseScale);

    this.hintText = this.add
      .text(centerX, 0, t('waitHint'), {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        wordWrap: { width: Math.min(width * 0.9, 340) },
      })
      .setOrigin(0.5, 0);

    this.actions = new InputActions();
    this.actions.on('mash', () => this._startDance());
    // There's nothing else for the arrow keys to do on this idle wait screen,
    // so they trigger the same dance as SPACE / the touch "DANCE!" button —
    // matches the on-screen hint copy inviting either.
    ['SPACE', 'LEFT', 'RIGHT', 'UP', 'DOWN'].forEach((key) => {
      this.input.keyboard.on(`keydown-${key}`, () => this.actions.mash());
    });
    touchControls.bind(this.actions, { actionLabel: t('danceLabel') });
    this.events.once('shutdown', () => touchControls.unbind());

    this.countdownText = this.add
      .text(centerX, 0, '', {
        fontFamily: FONTS.heading,
        fontSize: '24px',
        color: CSS_COLORS.cyan,
      })
      .setOrigin(0.5, 0);

    this.timer = new CountdownTimer({ seconds: LEVEL3_WAIT_SECONDS });
    this.bar = new MeterBar(this, { x: centerX, y: 0, width: Math.min(260, width * 0.7), height: 14 });

    this._layoutBottomStack();
    this.scale.on('resize', this._layoutBottomStack, this);
    this.events.once('shutdown', () => this.scale.off('resize', this._layoutBottomStack, this));

    addMuteToggle(this);
    addLangToggle(this);
  }

  // Stacks the hint text / countdown / progress bar upward from a fixed
  // safe margin above the true canvas bottom, using each element's actual
  // rendered height (the hint text's wrap count varies with viewport width,
  // so a fixed y-per-element would collide or, on a shorter canvas, push
  // the countdown/bar entirely below the visible area — see the "not
  // visible on mobile" bug this fixes). Re-run on `resize` so it stays
  // correct if #game-root's box changes after create() (e.g. a mobile
  // browser's chrome settling), which Phaser's RESIZE scale mode tracks
  // continuously but never re-triggers scene layout for on its own.
  _layoutBottomStack() {
    const { height } = this.scale;
    const bottomMargin = 24;
    const gap = 10;

    const barTop = height - bottomMargin - this.bar.height;
    this.bar.setY(barTop + this.bar.height / 2);

    const countdownTop = barTop - gap - this.countdownText.height;
    this.countdownText.setY(countdownTop);

    const hintTop = countdownTop - gap - this.hintText.height;
    this.hintText.setY(hintTop);
  }

  // Shared mash/action handler (SPACE key, arrow keys, or the touch "DANCE!"
  // button — CLAUDE.md's "Input handling" rule): every tap immediately snaps
  // her to the next dance pose (FrameAnimator.advance(), not a timer), so the
  // pose change reads as directly caused by the press instead of catching up
  // to it late. Plus a little pop for tactile feedback.
  _startDance() {
    this.isDancing = true;
    this.msSinceLastTap = 0;
    this.img.setTexture(this.danceAnimator.advance());
    this.tweens.add({
      targets: this.img,
      scaleX: this.baseScale * 1.1,
      scaleY: this.baseScale * 1.1,
      duration: 120,
      yoyo: true,
      ease: 'Back.Out',
    });
    sfx.mashTick(420);
  }

  update(time, delta) {
    if (this.isDancing) {
      this.msSinceLastTap += delta;
      if (this.msSinceLastTap >= this.danceIdleTimeoutMs) {
        this.isDancing = false;
        this.boringAnimator.reset();
      }
    } else {
      this.img.setTexture(this.boringAnimator.update(delta));
    }

    if (!this.timer || this.timer.isComplete) return;
    this.timer.update(delta);
    this.countdownText.setText(String(this.timer.remainingSeconds));
    this.bar.setPercent(this.timer.percent);

    if (this.timer.isComplete) {
      fadeToScene(this, 'FinalBossProposal', { char: this.char });
    }
  }
}
