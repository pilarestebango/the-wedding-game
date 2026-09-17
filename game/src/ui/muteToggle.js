// Persistent mute/unmute toggle, added to every scene's corner (GAME_SPEC.md §7).
import { gameState } from '../state/gameState.js';
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { t } from '../config/i18n.js';

export function addMuteToggle(scene) {
  const label = () => (gameState.muted ? t('sfxOff') : t('sfxOn'));
  const text = scene.add
    .text(scene.scale.width - 16, 16, label(), {
      fontFamily: FONTS.heading,
      fontSize: '11px',
      color: CSS_COLORS.mutedPurple,
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true });

  text.on('pointerdown', () => {
    gameState.toggleMuted();
    text.setText(label());
  });

  return text;
}
