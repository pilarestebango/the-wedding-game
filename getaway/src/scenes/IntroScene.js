// The first screen: tells the guest they've been picked and asks them to
// accept the challenge, before they choose a player.
import { CSS_COLORS, FONTS, TITLE_SHADOW, addMuteToggle, addLangToggle, addExitLink, fadeToScene, t } from '../shared.js';
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
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitWidth(title, maxWidth);

    // The couple's RSVP success illustration, standing in a black hole that
    // fills the gap between the title and the line under it.
    const artY = height * 0.42;
    const holeRadius = Math.min(height * 0.2, maxWidth * 0.42);
    addBlackHole(this, centerX, artY, holeRadius);
    const art = this.add.image(centerX, artY, 'rsvp-success');
    // The figures reach about 480px from the picture's centre; keep them inside the disc.
    art.setScale(Math.min(1, holeRadius / 480));

    const text = this.add
      .text(centerX, height * 0.7, t('introText'), { fontFamily: FONTS.heading, fontSize: '18px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5);
    fitWidth(text, maxWidth);

    addContinueButton(this, height * 0.86, t('introAccept'), t('introAccept'), () => {
      if (this.leaving) return;
      this.leaving = true;
      fadeToScene(this, 'Select', {});
    });

    addMuteToggle(this);
    // Same corner arrangement as the character-select screen.
    const exitLink = addExitLink(this);
    addLangToggle(this, { x: exitLink.x + exitLink.width + 24 });
  }

  update() {
    this.backdrop.update();
  }
}
