// The first screen: tells the guest they've been picked and asks them to
// accept the challenge, before they choose a player.
import { CSS_COLORS, FONTS, TITLE_SHADOW, touchControls, addMuteToggle, addLangToggle, fadeToScene, t } from '../shared.js';
import { fitWidth, addContinueButton } from '../sceneHelpers.js';
import { addStarfield, addBlackHole } from '../config/backdrops.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const maxWidth = width - 32;
    this.leaving = false;
    this.cameras.main.fadeIn(300, 18, 11, 46);

    this.backdrop = addStarfield(this);

    const title = this.add
      .text(centerX, height * 0.13, t('introTitle'), { fontFamily: FONTS.heading, fontSize: '40px', color: CSS_COLORS.gold })
      .setOrigin(0.5)
      .setDepth(10); // above the black hole's turning aura, which reaches up behind it
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitWidth(title, maxWidth);

    // Sofia and Alba, standing in a black hole that
    // fills the gap between the title and the line under it. On a phone the
    // button is down in the touch bar, not on the canvas, so the pair stand
    // in the very middle of the screen and the line under them moves down too.
    const centred = touchControls.isVisible();
    const artY = height * (centred ? 0.5 : 0.42);
    const holeRadius = Math.min(height * 0.2, maxWidth * 0.42);
    addBlackHole(this, centerX, artY, holeRadius);
    const art = this.add.image(centerX, artY, 'cover');
    // Keep the pair inside the disc: the picture is cropped tight, so its
    // corners are as far as they reach.
    art.setScale(Math.min(1, holeRadius / (Math.hypot(art.width, art.height) / 2 / 1.15)));

    const text = this.add
      .text(centerX, height * (centred ? 0.82 : 0.7), t('introText'), { fontFamily: FONTS.heading, fontSize: '18px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5);
    fitWidth(text, maxWidth);

    addContinueButton(this, height * 0.86, t('introAccept'), t('introAccept'), () => {
      if (this.leaving) return;
      this.leaving = true;
      fadeToScene(this, 'Select', {});
    });

    addMuteToggle(this);
    addLangToggle(this);
  }

  update() {
    this.backdrop.update();
  }
}
