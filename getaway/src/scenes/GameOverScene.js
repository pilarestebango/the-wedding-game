// The death screen, shared by all three levels: black, a skull, "YOU'RE
// DEAD" and RETRY — which restarts the level the player died in (`from`),
// never an earlier one. Reaching level 1's flag short of the coin target
// lands here too, with a line saying why.
//
// The show: the skull drops in and lands with a thud, laughs (and keeps
// laughing now and then), its eyes burn, the title slams down and starts to
// bleed, and embers drift up the screen. The background stays pure black.
import { COLORS, CSS_COLORS, FONTS, gameState, InputActions, touchControls, addMuteToggle, addLangToggle, sfx, t } from '../shared.js';
import { GAME_OVER, LEVEL1 } from '../config/tuning.js';
import { artKey, gridSize, mix, GRIDS, SKULL_FRAMES, SKULL_EYES, BLACK, CSS_BLACK } from '../config/art.js';
import { fitWidth } from '../sceneHelpers.js';

const RETRYABLE = ['Level1Coins', 'Level2Mars', 'Boss'];
const LAND_MS = 520; // how long the skull takes to drop in
const EMBERS = [COLORS.red, COLORS.red, mix(COLORS.red, COLORS.gold, 0.5), COLORS.gold];

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.from = RETRYABLE.includes(data?.from) ? data.from : RETRYABLE[0];
    this.reason = data?.reason;
    this.count = data?.count ?? 0;
    this.ready = false;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const maxWidth = width - 32;
    this.cameras.main.setBackgroundColor(CSS_BLACK);

    this.addEmbers();
    this.addSkull(centerX, height * 0.28);

    const titleY = height * 0.56;
    const title = this.add
      .text(centerX, titleY, t('deadTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '32px',
        color: CSS_COLORS.red,
      })
      .setOrigin(0.5);
    title.setShadow(4, 4, `#${mix(COLORS.red, BLACK, 0.65).toString(16).padStart(6, '0')}`, 0);
    fitWidth(title, maxWidth);
    this.slamTitle(title);

    if (this.reason === 'coins') {
      const why = this.add
        .text(centerX, titleY + 56, t('deadNotEnoughCoins', { count: this.count, target: LEVEL1.coinTarget }), {
          fontFamily: FONTS.heading,
          fontSize: '11px',
          color: CSS_COLORS.offWhite,
        })
        .setOrigin(0.5);
      fitWidth(why, maxWidth);
    }

    // On a phone the touch bar's RETRY is the only button (see addContinueButton).
    if (!touchControls.isVisible()) this.addRetryButton(centerX, height * 0.82);

    this.actions = new InputActions();
    this.actions.on('mash', () => this.retry());
    this.input.keyboard.on('keydown-ENTER', () => this.actions.mash());
    this.input.keyboard.on('keydown-SPACE', (event) => !event.repeat && this.actions.mash());
    touchControls.bind(this.actions, { actionLabel: t('retry'), actionConfirm: true });
    this.events.once('shutdown', () => touchControls.unbind());

    // A player who dies mid-mash would otherwise retry before seeing this.
    this.time.delayedCall(GAME_OVER.inputDelayMs, () => {
      this.ready = true;
    });

    addMuteToggle(this);
    addLangToggle(this);
  }

  addRetryButton(x, y) {
    const buttonText = this.add
      .text(x, y, t('retry'), { fontFamily: FONTS.heading, fontSize: '16px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5)
      .setDepth(1);
    const button = this.add
      .rectangle(x, y, buttonText.width + 56, 56, BLACK)
      .setStrokeStyle(4, COLORS.offWhite)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => this.retry());
    // The button's outline beats between white and red.
    this.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        this.buttonLit = !this.buttonLit;
        button.setStrokeStyle(4, this.buttonLit ? COLORS.red : COLORS.offWhite);
        buttonText.setColor(this.buttonLit ? CSS_COLORS.red : CSS_COLORS.offWhite);
      },
    });
  }

  // The skull, its red halo and its burning eyes, as one container so they
  // drop in together. Sized to the screen: bigger where there's room, smaller
  // on a short one so it clears the title.
  addSkull(x, y) {
    const size = gridSize('skull');
    const scale = Math.min(1.5, (this.scale.height * 0.34) / size.height);
    const skull = this.add.sprite(0, 0, artKey(this, 'skull'));
    if (!this.anims.exists('getaway-skull-laugh')) {
      this.anims.create({
        key: 'getaway-skull-laugh',
        frames: [...SKULL_FRAMES, ...SKULL_FRAMES, ...SKULL_FRAMES, SKULL_FRAMES[0]].map((name) => ({ key: artKey(this, name) })),
        frameRate: 9,
      });
    }

    // Halo: stepped rings of red, brightest at the middle.
    const halo = this.add.graphics();
    for (let r = size.width * 0.95; r > size.width * 0.35; r -= 14) {
      halo.fillStyle(COLORS.red, 0.045);
      halo.fillCircle(0, 0, r);
    }
    const { px } = GRIDS.skull;
    const eyes = SKULL_EYES.map(([gx, gy]) =>
      this.add.rectangle(gx * px - size.width / 2, gy * px - size.height / 2, px * 4, px * 4, COLORS.red, 0.55),
    );

    const group = this.add.container(x, -size.height, [halo, skull, ...eyes]).setScale(scale);
    this.tweens.add({ targets: halo, alpha: { from: 0.45, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: eyes, alpha: { from: 0.15, to: 0.7 }, duration: 260, yoyo: true, repeat: -1 });
    this.tweens.add({
      targets: group,
      y,
      duration: LAND_MS,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.cameras.main.shake(180, 0.012);
        skull.play('getaway-skull-laugh');
        this.tweens.add({ targets: group, y: y + 6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      },
    });
    this.time.addEvent({ delay: 2600, loop: true, callback: () => skull.play('getaway-skull-laugh') });
  }

  // The title drops onto the screen just after the skull lands, twitches now
  // and then, and bleeds: a few drips creep down from under the letters.
  slamTitle(title) {
    const scale = title.scale;
    const { x } = title;
    title.setAlpha(0).setScale(scale * 2.6);
    this.tweens.add({
      targets: title,
      alpha: 1,
      scale,
      delay: LAND_MS - 80,
      duration: 220,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.cameras.main.shake(140, 0.01);
        sfx.hit();
        this.addDrips(title);
      },
    });
    this.time.addEvent({
      delay: 1900,
      loop: true,
      callback: () => {
        title.setX(x + Phaser.Math.Between(-5, 5)).setColor(CSS_COLORS.offWhite);
        this.time.delayedCall(70, () => title.setX(x).setColor(CSS_COLORS.red));
      },
    });
  }

  addDrips(title) {
    const left = title.x - title.displayWidth / 2;
    const bottom = title.y + title.displayHeight / 2 - 6;
    [0.07, 0.22, 0.41, 0.63, 0.8, 0.94].forEach((fx, i) => {
      const drip = this.add.rectangle(left + title.displayWidth * fx, bottom, 4, 4, COLORS.red).setOrigin(0.5, 0);
      this.tweens.add({
        targets: drip,
        displayHeight: 14 + ((i * 17) % 30),
        delay: i * 180,
        duration: 1600 + ((i * 370) % 1400),
        ease: 'Sine.easeOut',
      });
    });
  }

  // Embers: small squares drifting up from below the screen, behind everything.
  addEmbers() {
    const { width, height } = this.scale;
    const spawn = (y = height + 10) => {
      const size = Phaser.Math.Between(3, 7);
      const ember = this.add
        .rectangle(Phaser.Math.Between(0, width), y, size, size, Phaser.Utils.Array.GetRandom(EMBERS))
        .setAlpha(Phaser.Math.FloatBetween(0.6, 1));
      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(height * 0.4, height * 0.9),
        x: ember.x + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: Phaser.Math.Between(2600, 5200),
        onComplete: () => ember.destroy(),
      });
    };
    for (let i = 0; i < 24; i += 1) spawn(Phaser.Math.Between(height * 0.5, height)); // already in the air on arrival
    this.time.addEvent({ delay: 90, loop: true, callback: () => spawn() });
  }

  retry() {
    if (!this.ready) return;
    this.ready = false;
    this.scene.start(this.from, { char: this.char });
  }
}
