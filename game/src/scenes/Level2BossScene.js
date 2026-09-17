// BOSS: Buying the House (GAME_SPEC.md §6). Mash to drop coins into a piggy
// bank until it's full, then a big SOLD sticker stamps onto the house.
// House art is the couple's framed rooftop-terrace illustration
// (assets/illustrations/house.png), with a small "FOR SALE" sticker on the
// frame that gets upstaged by a bigger, brighter "SOLD" sticker on purchase.
import { COLORS, CSS_COLORS, FONTS } from '../config/palette.js';
import { MASH } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { MashMeter } from '../logic/MashMeter.js';
import { PiggyBank } from '../ui/PiggyBank.js';
import { BossIntroFlow } from '../ui/BossIntroFlow.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import { HOUSE_BOSS_INTRO, HOUSE_BOSS_PAY_LABEL, HOUSE_BOSS_WIN_TEXT } from '../config/dialogue.js';
import { resolveLevel3Scene } from '../logic/CharacterBranch.js';
import { t } from '../config/i18n.js';

const HOUSE_MAX_HEIGHT = 210;

export class Level2BossScene extends Phaser.Scene {
  constructor() {
    super('Level2Boss');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
  }

  create() {
    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.cameras.main.fadeIn(300, 18, 11, 46);

    const title = this.add
      .text(this.centerX, 40, t('houseBossTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '16px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    fitTopTitle(this, title);

    this.house = this.add.image(this.centerX, this.centerY - 90, 'house-illustration');
    this.house.setScale(Math.min(1, HOUSE_MAX_HEIGHT / this.house.height));
    this._addForSaleSticker();

    this.flow = new BossIntroFlow(this, { centerX: this.centerX, centerY: this.centerY + 120 });
    this.state = 'intro';
    this.meter = null;
    this.pig = null;
    this.coinLabel = null;

    this.flow.showIntro(HOUSE_BOSS_INTRO(), t('readyLabel'));

    this.actions = new InputActions();
    this.actions.on('mash', () => this.handleMash());
    this.input.keyboard.on('keydown-SPACE', () => this.actions.mash());

    touchControls.bind(this.actions, { actionLabel: t('readyLabel') });
    this.events.once('shutdown', () => touchControls.unbind());

    addMuteToggle(this);
    addLangToggle(this);
  }

  // Shared builder for the peel-on stickers slapped onto the house frame —
  // a drop-shadow rect behind a bordered board + label, tilted like it was
  // stuck on by hand. FOR SALE and SOLD both use this, just at different
  // sizes/brightness (see _addForSaleSticker / _stampSold).
  _makeSticker({ x, y, text, width, height, angle = 0, fill, stroke, strokeWidth = 3, textColor, fontSize, depth = 4 }) {
    const container = this.add.container(x, y).setAngle(angle).setDepth(depth);
    const shadow = this.add.rectangle(3, 4, width, height, COLORS.background, 0.45);
    const board = this.add.rectangle(0, 0, width, height, fill).setStrokeStyle(strokeWidth, stroke);
    const label = this.add
      .text(0, 0, text, { fontFamily: FONTS.heading, fontSize, color: textColor })
      .setOrigin(0.5);
    container.add([shadow, board, label]);
    container.board = board;
    container.label = label;
    return container;
  }

  _addForSaleSticker() {
    const x = this.house.x + this.house.displayWidth / 2 - 30;
    const y = this.house.y - this.house.displayHeight / 2 + 10;
    this.forSaleSticker = this._makeSticker({
      x,
      y,
      text: t('forSaleLabel'),
      width: 92,
      height: 30,
      angle: -9,
      fill: COLORS.offWhite,
      stroke: COLORS.red,
      strokeWidth: 3,
      textColor: CSS_COLORS.background,
      fontSize: '8px',
      depth: 4,
    });
  }

  handleMash() {
    if (this.state === 'intro') {
      this.flow.clearIntro();
      this.state = 'pay';
      this.meter = new MashMeter({ target: MASH.payTarget });
      this.pig = new PiggyBank(this, { x: this.centerX, y: this.centerY + 110 });
      this.coinLabel = this.add
        .text(this.centerX, this.centerY + 175, t('coinsLabel', { count: 0, target: MASH.payTarget }), {
          fontFamily: FONTS.body,
          fontSize: '12px',
          color: CSS_COLORS.mutedPurple,
        })
        .setOrigin(0.5);
      touchControls.bind(this.actions, { actionLabel: HOUSE_BOSS_PAY_LABEL() });
      return;
    }
    if (this.state !== 'pay' || this.meter.complete) return;

    this.meter.press();
    sfx.coinClink();
    this.pig.dropCoin();
    this.pig.setPercent(this.meter.percent);
    this.coinLabel.setText(t('coinsLabel', { count: this.meter.presses, target: this.meter.target }));

    if (this.meter.complete) {
      sfx.cashRegister();
      this.state = 'win';
      this.time.delayedCall(400, () => this.showWin());
    }
  }

  showWin() {
    if (this.coinLabel) {
      this.coinLabel.destroy();
      this.coinLabel = null;
    }
    touchControls.unbind();
    if (this.pig) {
      // Move the fully-grown pig out of the way so it doesn't sit under the
      // win text (both were anchored around centerY, nearly on top of each other).
      this.tweens.add({
        targets: this.pig.container,
        y: this.pig.container.y + 90,
        alpha: 0.6,
        scale: this.pig.container.scale * 0.75,
        duration: 400,
        ease: 'Quad.Out',
      });
    }
    this.flow.showBigMessage(HOUSE_BOSS_WIN_TEXT(), { fontSize: '16px' });
    if (this.forSaleSticker) this.forSaleSticker.board.setStrokeStyle(3, COLORS.gold);
    this._stampSold();

    this.time.delayedCall(1900, () => {
      const nextScene = resolveLevel3Scene(this.char);
      fadeToScene(this, nextScene, { char: this.char });
    });
  }

  // Bigger + brighter than the FOR SALE sticker: ~3x the area, a gold glow
  // halo behind it, and a thicker gold border on a red board so it visually
  // upstages the sign it's slapped over.
  _stampSold() {
    const x = this.forSaleSticker ? this.forSaleSticker.x + 6 : this.centerX + 10;
    const y = this.forSaleSticker ? this.forSaleSticker.y + 4 : this.centerY - 120;

    const glow = this.add.rectangle(x, y, 200, 66, COLORS.gold, 0.35).setAngle(8).setDepth(5).setScale(0.6);
    this.tweens.add({ targets: glow, scale: 1, alpha: 0, duration: 700, ease: 'Quad.Out' });

    const sticker = this._makeSticker({
      x,
      y,
      text: t('soldLabel'),
      width: 172,
      height: 54,
      angle: 8,
      fill: COLORS.red,
      stroke: COLORS.gold,
      strokeWidth: 5,
      textColor: CSS_COLORS.offWhite,
      fontSize: '20px',
      depth: 6,
    });
    sticker.setScale(0.3).setAlpha(0);

    this.tweens.add({
      targets: sticker,
      alpha: 1,
      scale: 1,
      duration: 320,
      ease: 'Back.Out',
      onComplete: () => this.cameras.main.shake(150, 0.004),
    });
  }
}
