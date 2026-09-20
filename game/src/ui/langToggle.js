// Persistent EN/ES toggle, added to every scene's opposite corner from the
// mute toggle (top-left vs. muteToggle.js's top-right — see fitTopTitle.js,
// which already reserves symmetric space on both sides of scene titles).
// Clicking it flips the shared language (config/i18n.js) and persists it;
// main.js listens for the change and restarts the active scene(s) so every
// Text object re-reads t() in the new language — this toggle itself doesn't
// need to touch any other on-screen text.
import { getLang, toggleLang } from '../config/i18n.js';
import { CSS_COLORS, FONTS } from '../config/palette.js';

// `x` lets a scene that also shows the EXIT link (exitLink.js) slide this over
// to sit beside it instead of underneath it.
export function addLangToggle(scene, { x = 16 } = {}) {
  // Shows the language you'd SWITCH TO, matching the site's toggle convention.
  const label = () => (getLang() === 'en' ? 'ES' : 'EN');
  const text = scene.add
    .text(x, 16, label(), {
      fontFamily: FONTS.heading,
      fontSize: '11px',
      color: CSS_COLORS.mutedPurple,
    })
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true });

  text.on('pointerdown', () => {
    toggleLang();
  });

  return text;
}
