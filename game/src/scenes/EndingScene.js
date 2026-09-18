// ENDING — invitation reveal (GAME_SPEC.md §6). Standalone build for now (see
// plan): RSVP_URL is a single placeholder constant in tuning.js, so wiring in
// the real RSVP page later is a one-line change.
import { COLORS, CSS_COLORS, FONTS, TITLE_SHADOW } from '../config/palette.js';
import { RSVP_URL } from '../config/tuning.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { t } from '../config/i18n.js';

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    this.cameras.main.fadeIn(500, 18, 11, 46);
    touchControls.unbind();

    const title = this.add
      .text(centerX, 60, t('youreInvited'), {
        fontFamily: FONTS.heading,
        fontSize: '28px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitTopTitle(this, title);

    const img = this.add.image(centerX, height / 2 - 10, 'pose-happy');
    const maxHeight = height * 0.5;
    img.setScale(Math.min(1, maxHeight / img.height));

    this.add
      .text(centerX, height - 150, t('gettingMarried'), {
        fontFamily: FONTS.body,
        fontSize: '13px',
        color: CSS_COLORS.offWhite,
        align: 'center',
      })
      .setOrigin(0.5);

    if (RSVP_URL) {
      const btn = this.add
        .rectangle(centerX, height - 100, 200, 50, COLORS.background)
        .setStrokeStyle(4, COLORS.cyan)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(centerX, height - 100, t('rsvpNow'), {
          fontFamily: FONTS.heading,
          fontSize: '12px',
          color: CSS_COLORS.cyan,
        })
        .setOrigin(0.5);
      btn.on('pointerdown', () => window.open(RSVP_URL, '_blank', 'noopener'));
    } else {
      this.add
        .text(centerX, height - 100, t('rsvpComingSoon'), {
          fontFamily: FONTS.body,
          fontSize: '12px',
          color: CSS_COLORS.offWhite,
        })
        .setOrigin(0.5);
    }

    const replay = this.add
      .text(centerX, height - 40, t('playAgain'), {
        fontFamily: FONTS.heading,
        fontSize: '11px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    replay.on('pointerdown', () => fadeToScene(this, 'CharacterSelect', {}));

    addMuteToggle(this);
    addLangToggle(this);
  }
}
