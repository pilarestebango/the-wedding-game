// "‹ EXIT" link back to the wedding site, mirroring the topbar EXIT on the
// site's other pages (rsvp/, wedding/, ...) but drawn in the same corner-toggle
// style as muteToggle.js / langToggle.js. Sits at the top-left, so a scene that
// also shows the lang toggle should nudge it right of this one (see
// langToggle.js's `x` option and CharacterSelectScene).
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { SITE_URL } from '../config/tuning.js';
import { t } from '../config/i18n.js';

export function addExitLink(scene) {
  const text = scene.add
    .text(16, 16, t('exit'), {
      fontFamily: FONTS.heading,
      fontSize: '11px',
      color: CSS_COLORS.mutedPurple,
    })
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(1000)
    .setInteractive({ useHandCursor: true });

  text.on('pointerover', () => text.setColor(CSS_COLORS.gold));
  text.on('pointerout', () => text.setColor(CSS_COLORS.mutedPurple));
  text.on('pointerdown', () => {
    window.location.href = SITE_URL;
  });

  return text;
}
