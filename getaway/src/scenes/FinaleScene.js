// The last reward: a picture of the house and the link to the full details
// page. The picture is a code-drawn placeholder until the couple sends the
// real one — swap drawHousePlaceholder() for a loaded image then.
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

    // A 4:3 print, as big as fits between the title and the copy below.
    const picHeight = Math.max(80, Math.min(height - 330, (width - 48) * 0.75, 300));
    const picWidth = picHeight / 0.75;
    this.drawHousePlaceholder(centerX - picWidth / 2, 120, picWidth, picHeight);

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

  // White print frame (like the site's level pages) around a simple house in
  // the mountains.
  drawHousePlaceholder(x, y, w, h) {
    const g = this.add.graphics();
    const frame = Math.round(w * 0.04);
    g.fillStyle(COLORS.offWhite, 1);
    g.fillRect(x, y, w, h);

    const ix = x + frame;
    const iy = y + frame;
    const iw = w - frame * 2;
    const ih = h - frame * 2;
    const groundTop = iy + ih * 0.78;
    g.fillStyle(COLORS.background, 1);
    g.fillRect(ix, iy, iw, ih);
    g.fillStyle(COLORS.mutedPurple, 1);
    g.fillTriangle(ix, groundTop, ix + iw * 0.3, iy + ih * 0.25, ix + iw * 0.6, groundTop);
    g.fillTriangle(ix + iw * 0.4, groundTop, ix + iw * 0.75, iy + ih * 0.12, ix + iw, iy + ih * 0.6);
    g.fillTriangle(ix + iw * 0.4, groundTop, ix + iw, iy + ih * 0.6, ix + iw, groundTop);
    g.fillStyle(COLORS.cyan, 1);
    g.fillRect(ix, groundTop, iw, iy + ih - groundTop);

    const hw = iw * 0.3;
    const hh = ih * 0.26;
    const hx = ix + iw * 0.5 - hw / 2;
    const hy = groundTop - hh + ih * 0.04;
    g.fillStyle(COLORS.red, 1);
    g.fillTriangle(hx - hw * 0.12, hy, hx + hw / 2, hy - hh * 0.7, hx + hw * 1.12, hy);
    g.fillStyle(COLORS.offWhite, 1);
    g.fillRect(hx, hy, hw, hh);
    g.fillStyle(COLORS.gold, 1);
    g.fillRect(hx + hw * 0.12, hy + hh * 0.25, hw * 0.22, hh * 0.3);
    g.fillRect(hx + hw * 0.66, hy + hh * 0.25, hw * 0.22, hh * 0.3);
    g.fillStyle(COLORS.background, 1);
    g.fillRect(hx + hw * 0.42, hy + hh * 0.45, hw * 0.16, hh * 0.55);
  }
}
