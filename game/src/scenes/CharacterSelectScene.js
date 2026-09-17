import { CSS_COLORS, FONTS, TITLE_SHADOW } from '../config/palette.js';
import { gameState } from '../state/gameState.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fadeToScene } from '../ui/transitions.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { t } from '../config/i18n.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelect');
  }

  init(data) {
    this.initialChar = data?.char ?? gameState.getCharacter();
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 18, 11, 46);
    touchControls.unbind(); // this screen has no gameplay actions to bind

    const title = this.add
      .text(width / 2, 90, t('charSelectTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '36px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    // This 36px heading was sized for a 960px-wide screen — on a narrow phone
    // (rendered at its true width now, not shrunk to fit via letterboxing)
    // it runs off both edges unless clamped back down to fit.
    const titleMaxWidth = width * 0.92;
    if (title.width > titleMaxWidth) title.setScale(titleMaxWidth / title.width);

    const subtitle = this.add
      .text(width / 2, 140, t('charSelectSubtitle'), {
        fontFamily: FONTS.heading,
        fontSize: '14px',
        color: CSS_COLORS.cyan,
      })
      .setOrigin(0.5);
    if (subtitle.width > titleMaxWidth) subtitle.setScale(titleMaxWidth / subtitle.width);

    this.tweens.add({
      targets: subtitle,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Step',
    });

    // Portrait/narrow phones still put the pair side by side rather than
    // stacked, centered vertically in the space between the subtitle and
    // the bottom hint text so the pair reads as centered on screen. Width
    // (not height) ends up the binding constraint on a narrow phone, so
    // fitting each portrait independently would scale them to different
    // sizes — Pili's art is wider than Joe's (hair/dress) despite sharing
    // the same reference height, so an independent fit balloons Joe
    // relative to Pili. Compute one scale from both images together so
    // they render at matching heights.
    const isPortrait = height > width;
    if (isPortrait) {
      const topPad = 170; // clear of the subtitle above
      const bottomPad = 60; // clear of the "tap to begin" hint below
      const centerY = topPad + (height - topPad - bottomPad) / 2;
      const imgMaxHeight = height - topPad - bottomPad - 50; // reserve room for the name label under each portrait
      const imgMaxWidth = width * 0.4; // keep a gutter between the pair and the screen edges
      const piliSize = this.textures.get('pili-portrait').getSourceImage();
      const joeSize = this.textures.get('joe-portrait').getSourceImage();
      const sharedScale = Math.min(
        1,
        imgMaxHeight / piliSize.height,
        imgMaxHeight / joeSize.height,
        imgMaxWidth / piliSize.width,
        imgMaxWidth / joeSize.width
      );
      this._addPortrait('pili-portrait', 'pili', width * 0.26, centerY, { scale: sharedScale });
      this._addPortrait('joe-portrait', 'joe', width * 0.74, centerY, { scale: sharedScale, flip: true });
    } else {
      this._addPortrait('pili-portrait', 'pili', width * 0.3, height * 0.55, { maxHeight: height * 0.55, maxWidth: width * 0.42 });
      this._addPortrait('joe-portrait', 'joe', width * 0.7, height * 0.55, { maxHeight: height * 0.55, maxWidth: width * 0.42, flip: true });
    }

    this.add
      .text(width / 2, height - 40, t('charSelectHint'), {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: CSS_COLORS.mutedPurple,
      })
      .setOrigin(0.5);

    addMuteToggle(this);
    addLangToggle(this);
  }

  _addPortrait(textureKey, char, x, y, { maxHeight, maxWidth, flip = false, scale } = {}) {
    const img = this.add.image(x, y, textureKey).setInteractive({ useHandCursor: true });
    scale = scale ?? Math.min(1, maxHeight / img.height, maxWidth / img.width);
    img.setScale(scale);
    img.setFlipX(flip); // mirrors Joe to face Pili so the pair looks at each other

    const label = this.add
      .text(x, y + (img.height * scale) / 2 + 20, char.toUpperCase(), {
        fontFamily: FONTS.heading,
        fontSize: '16px',
        color: CSS_COLORS.offWhite,
      })
      .setOrigin(0.5);

    img.on('pointerover', () => {
      img.setTint(0xdfffff);
      label.setColor(CSS_COLORS.cyan);
    });
    img.on('pointerout', () => {
      img.clearTint();
      label.setColor(CSS_COLORS.offWhite);
    });
    img.on('pointerdown', () => {
      gameState.setCharacter(char);
      fadeToScene(this, 'Level1DatingRace', { char });
    });
  }
}
