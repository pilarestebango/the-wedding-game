// Phaser view for any 0..1 percent value (MashMeter.percent, AdvanceTrack.percent,
// CountdownTimer.percent) — a chunky pixel-bordered bar in the game palette.
import { COLORS, CSS_COLORS, FONTS } from '../config/palette.js';

export class MeterBar {
  constructor(scene, { x, y, width = 200, height = 24, label = '' }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.border = scene.add.rectangle(x, y, width + 6, height + 6).setStrokeStyle(4, COLORS.cyan);
    this.bg = scene.add.rectangle(x, y, width, height, COLORS.background);
    this.fill = scene.add.rectangle(x - width / 2, y, 0, height, COLORS.gold).setOrigin(0, 0.5);

    this.labelText = label
      ? scene.add
          .text(x, y - height - 10, label, {
            fontFamily: FONTS.heading,
            fontSize: '10px',
            color: CSS_COLORS.offWhite,
          })
          .setOrigin(0.5, 1)
      : null;
  }

  setPercent(p) {
    const clamped = Math.max(0, Math.min(1, p));
    this.fill.width = this.width * clamped;
  }

  setY(y) {
    this.y = y;
    this.border.y = y;
    this.bg.y = y;
    this.fill.y = y;
    if (this.labelText) this.labelText.y = y - this.height - 10;
  }

  setLabel(text) {
    if (this.labelText) this.labelText.setText(text);
  }

  destroy() {
    this.border.destroy();
    this.bg.destroy();
    this.fill.destroy();
    if (this.labelText) this.labelText.destroy();
  }
}
