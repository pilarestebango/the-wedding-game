// The last reward: the couple's pictures of the house and the pool (as on the
// details page: house behind, pool tilted in front) and the link to the full
// details page.
import { COLORS, CSS_COLORS, FONTS, TITLE_SHADOW, sfx, touchControls, addMuteToggle, addLangToggle, fitTopTitle, fadeToScene, t } from '../shared.js';
import { DETAILS_URL } from '../config/tuning.js';
import { fitWidth, explode } from '../sceneHelpers.js';
import { addStarfield } from '../config/backdrops.js';

export class FinaleScene extends Phaser.Scene {
  constructor() {
    super('Finale');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const maxWidth = width - 32;
    this.cameras.main.fadeIn(500, 18, 11, 46);
    touchControls.unbind();
    this.backdrop = addStarfield(this);

    const title = this.add
      .text(centerX, 70, t('finaleTitle'), { fontFamily: FONTS.heading, fontSize: '28px', color: CSS_COLORS.gold })
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitTopTitle(this, title);

    // A 4:3 area, as big as fits between the title and the copy below, and
    // centred in that gap.
    const gapTop = 115;
    const gapBottom = height - 200;
    const picHeight = Math.max(80, Math.min(gapBottom - gapTop - 10, (width - 48) * 0.75, 420));
    const picWidth = picHeight / 0.75;
    const picTop = Math.max(gapTop, (gapTop + gapBottom - picHeight) / 2);
    this.drawPictures(centerX - picWidth / 2, picTop, picWidth, picHeight);

    const copy = this.add
      .text(centerX, height - 165, t('finaleText'), {
        fontFamily: FONTS.heading,
        fontSize: '11px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5);
    fitWidth(copy, maxWidth);

    const buttonText = this.add
      .text(centerX, height - 95, t('finaleDetails'), { fontFamily: FONTS.heading, fontSize: '12px', color: CSS_COLORS.cyan })
      .setOrigin(0.5)
      .setDepth(1);
    fitWidth(buttonText, maxWidth - 40);
    const button = this.add
      .rectangle(centerX, height - 95, buttonText.displayWidth + 40, 50, COLORS.background)
      .setStrokeStyle(4, COLORS.cyan)
      .setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      window.location.href = DETAILS_URL;
    });

    const replay = this.add
      .text(centerX, height - 36, t('playAgain'), { fontFamily: FONTS.heading, fontSize: '11px', color: CSS_COLORS.gold })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    replay.on('pointerdown', () => fadeToScene(this, 'Select', {}));

    addMuteToggle(this);
    addLangToggle(this);

    // Arriving from the last conversation: this screen IS the final reveal,
    // so it gets the fanfare and the confetti.
    if (this.scene.settings.data?.celebrate) {
      sfx.fanfare();
      const confetti = { colors: [COLORS.gold, COLORS.cyan, COLORS.red, COLORS.offWhite], count: 26, size: 8, spread: 180 };
      [[0.2, 0.3], [0.8, 0.3], [0.5, 0.2], [0.25, 0.6], [0.75, 0.6]].forEach(([fx, fy], i) => {
        this.time.delayedCall(250 + i * 220, () => explode(this, width * fx, height * fy, confetti));
      });
    }
  }

  update() {
    this.backdrop.update();
  }

  // Two framed prints in a w x h area: the house top-left, the pool
  // bottom-right and tilted, dropping in on top a moment later.
  drawPictures(x, y, w, h) {
    const printWidth = w * 0.74;
    const house = this.addPrint('finale-house', printWidth, 0);
    house.setPosition(x + house.width / 2, y + house.height / 2);
    const pool = this.addPrint('finale-pool', printWidth, -6);
    const poolX = x + w - pool.width / 2;
    const poolY = y + h - pool.height / 2;
    pool.setPosition(poolX, poolY - h).setAlpha(0);
    this.tweens.add({ targets: pool, y: poolY, alpha: 1, duration: 600, delay: 500, ease: 'Back.easeOut' });
  }

  // A picture in a white frame (like the site's level pages), centred on the
  // container. Smooth filtering: these are pictures, not pixel art.
  addPrint(key, outerWidth, angle) {
    const frame = Math.round(outerWidth * 0.035);
    const texture = this.textures.get(key);
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const { width: tw, height: th } = texture.getSourceImage();
    const imgWidth = outerWidth - frame * 2;
    const imgHeight = (imgWidth * th) / tw;
    const outerHeight = imgHeight + frame * 2;
    const print = this.add.container(0, 0, [
      this.add.rectangle(0, 0, outerWidth, outerHeight, COLORS.offWhite),
      this.add.image(0, 0, key).setDisplaySize(imgWidth, imgHeight),
    ]);
    print.setSize(outerWidth, outerHeight).setAngle(angle);
    return print;
  }
}
