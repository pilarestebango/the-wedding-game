// Small composable UI helper shared by every boss scene's intro/ready-prompt/
// win-text beats (Level1Boss, Level2Boss, FinalBoss's intro+kneel portion).
// A helper scenes configure and drive themselves, not a base class to extend —
// each boss's actual meter/phase logic differs enough that forcing them
// through one rigid state machine would fight the code more than help it.
import { CSS_COLORS, FONTS } from '../config/palette.js';

const HEADING_FONT = FONTS.heading;
const BODY_FONT = FONTS.body;

export class BossIntroFlow {
  constructor(scene, { centerX, centerY }) {
    this.scene = scene;
    this.centerX = centerX;
    this.centerY = centerY;
    this.introText = null;
    this.promptText = null;
    this.bigText = null;
  }

  showIntro(lines, readyLabel = 'READY!') {
    this.clearIntro();
    this.introText = this.scene.add
      .text(this.centerX, this.centerY - 40, lines.join('\n'), {
        fontFamily: BODY_FONT,
        fontSize: '14px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        wordWrap: { width: this.scene.scale.width * 0.85 },
      })
      .setOrigin(0.5);
    this.promptText = this.scene.add
      .text(this.centerX, this.centerY + 50, `[ ${readyLabel} ]`, {
        fontFamily: HEADING_FONT,
        fontSize: '14px',
        color: CSS_COLORS.gold,
        align: 'center',
      })
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: this.promptText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  clearIntro() {
    if (this.introText) this.introText.destroy();
    if (this.promptText) this.promptText.destroy();
    this.introText = null;
    this.promptText = null;
  }

  showBigMessage(text, { color = CSS_COLORS.gold, fontSize = '20px' } = {}) {
    this.clearBigMessage();
    this.bigText = this.scene.add
      .text(this.centerX, this.centerY, text, {
        fontFamily: HEADING_FONT,
        fontSize,
        color,
        align: 'center',
        // Wraps long lines (e.g. "Congratulations — they're in love!") onto
        // two lines on narrow phones instead of running off the screen.
        wordWrap: { width: this.scene.scale.width * 0.85 },
      })
      .setOrigin(0.5)
      .setScale(0.5)
      .setAlpha(0);
    this.scene.tweens.add({
      targets: this.bigText,
      scale: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.Out',
    });
    return this.bigText;
  }

  clearBigMessage() {
    if (this.bigText) this.bigText.destroy();
    this.bigText = null;
  }

  destroy() {
    this.clearIntro();
    this.clearBigMessage();
  }
}
