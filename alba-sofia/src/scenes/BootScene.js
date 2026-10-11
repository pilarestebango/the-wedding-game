// Boot: loads Sofia's and Alba's art plus the Pili/Joe art borrowed from
// PILAR vs JOE, reads the ?scene=<slug>&char=<sofia|alba> debug params (same convention as the other
// game, see game/CLAUDE.md), and routes to the right scene. Everything else in
// this game is drawn in code (config/art.js), bar level 2's two monster sheets.
import { GAME_ASSET_ROOT, CSS_COLORS, FONTS, t } from '../shared.js';
import { CHARACTER_MANIFEST, setPlayer, getPlayer } from '../config/characters.js';
import { entryForSlug, keyForSlug } from '../config/sceneRegistry.js';
import { MONSTER_SHEETS } from '../config/art.js';

const EXTRA_IMAGES = [
  { key: 'prop-heart', path: `${GAME_ASSET_ROOT}assets/sprites/props/heart.png` },
  // Sofia and Alba together, shown on the intro.
  { key: 'cover', path: 'assets/cover.webp' },
  // The pair high-fiving, shown once the boss is beaten.
  { key: 'high-five', path: 'assets/high-five.webp' },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    [...CHARACTER_MANIFEST, ...EXTRA_IMAGES].forEach(({ key, path }) => this.load.image(key, path));
    Object.values(MONSTER_SHEETS).forEach(({ key, path, frameWidth, frameHeight }) =>
      this.load.spritesheet(key, path, { frameWidth, frameHeight }),
    );

    const label = this.add
      .text(this.scale.width / 2, this.scale.height / 2, t('loading', { pct: 0 }), {
        fontFamily: FONTS.heading,
        fontSize: '16px',
        color: CSS_COLORS.offWhite,
      })
      .setOrigin(0.5);
    this.load.on('progress', (v) => label.setText(t('loading', { pct: Math.round(v * 100) })));
  }

  create() {
    const params = new URLSearchParams(window.location.search);
    const charParam = params.get('char');
    if (charParam) setPlayer(charParam);

    const entry = entryForSlug(params.get('scene'));
    this.scene.start(entry?.key ?? 'Intro', {
      char: getPlayer(),
      ...entry?.data,
      // ?scene=game-over&from=<slug> picks the level RETRY goes back to.
      from: keyForSlug(params.get('from')) ?? undefined,
    });
  }
}
