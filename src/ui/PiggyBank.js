// Piggy bank for Level2Boss's "pay" phase — grows as coins go in
// (GAME_SPEC.md "Buying the House" boss). Cropped pixel-art sprite from the
// couple-approved reference/piggybank.png, same pipeline as the beer mugs
// (reference/crop_piggybank.py -> assets/sprites/props/piggybank.png, see
// src/config/props.js).
import { COLORS, CSS_COLORS, FONTS, PROP_COLORS } from '../config/palette.js';
import { textureKeyFor } from '../config/props.js';

const COIN_CALLOUTS = ['CLINK!', 'CHA-CHING!', 'KA-POW!'];
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.3;

export class PiggyBank {
  constructor(scene, { x, y }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.percent = 0;

    this.container = scene.add.container(x, y).setScale(MIN_SCALE);
    this.body = scene.add.image(0, 0, textureKeyFor('piggybank'));
    this.container.add(this.body);
  }

  /** Spawns one coin falling into the slot, then bounces the pig + shows a callout. */
  dropCoin() {
    const coin = this.scene.add
      .circle(this.x, this.y - 150, 9, COLORS.gold)
      .setStrokeStyle(2, PROP_COLORS.pigPinkDark)
      .setDepth(5);
    this.scene.tweens.add({
      targets: coin,
      y: this.y - 42,
      duration: 240,
      ease: 'Cubic.In',
      onComplete: () => {
        coin.destroy();
        this._bounce();
        this._callout();
      },
    });
  }

  // Squashes this.body (not this.container, which setPercent's growth tween
  // owns) so rapid mashing can't leave two tweens fighting over the same
  // scale property — that fight was making the pig visibly judder/deform.
  // Kill any bounce still mid-flight and restart from an absolute baseline
  // (rather than a relative delta) so quick repeat presses can't compound
  // into a permanently squashed pig either.
  _bounce() {
    this.scene.tweens.killTweensOf(this.body);
    this.body.setScale(1, 1);
    this.scene.tweens.add({
      targets: this.body,
      scaleY: 0.92,
      duration: 90,
      yoyo: true,
      ease: 'Quad.Out',
    });
  }

  _callout() {
    const text = COIN_CALLOUTS[Phaser.Math.Between(0, COIN_CALLOUTS.length - 1)];
    const jitterX = Phaser.Math.Between(-16, 16);
    const jitterY = Phaser.Math.Between(-10, 10);
    const t = this.scene.add
      .text(this.x + 58 + jitterX, this.y - 60 + jitterY, text, {
        fontFamily: FONTS.heading,
        fontSize: '8px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5)
      .setDepth(5);
    this.scene.tweens.add({
      targets: t,
      y: t.y - 22,
      alpha: 0,
      duration: 500,
      onComplete: () => t.destroy(),
    });
  }

  setPercent(percent) {
    this.percent = Phaser.Math.Clamp(percent, 0, 1);
    // Kill any still-running growth tween first — otherwise mashing faster
    // than 150ms stacks multiple tweens on the same scale property and they
    // fight, making the pig jump/stutter instead of growing smoothly.
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.add({
      targets: this.container,
      scale: MIN_SCALE + this.percent * (MAX_SCALE - MIN_SCALE),
      duration: 150,
      ease: 'Back.Out',
    });
  }

  destroy() {
    this.container.destroy();
  }
}
