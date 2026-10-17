// Boot: loads the Pili/Joe art borrowed from PILAR vs JOE, reads the
// ?scene=<slug>&char=<pili|joe> debug params (same convention as the other
// game, see game/CLAUDE.md), and routes to the right scene. Everything else in
// this game is drawn in code (config/art.js), bar level 2's two monster sheets
// and the location reveal's map.
import { CHARACTER_MANIFEST, GAME_ASSET_ROOT, CSS_COLORS, FONTS, gameState, t } from '../shared.js';
import { entryForSlug, keyForSlug } from '../config/sceneRegistry.js';
import { MONSTER_SHEETS } from '../config/art.js';

const EXTRA_IMAGES = [
  { key: 'pili-portrait', path: 'assets/illustrations/pili-portrait.png' },
  { key: 'joe-portrait', path: 'assets/illustrations/joe-portrait.png' },
  { key: 'prop-heart', path: 'assets/sprites/props/heart.png' },
  // The site's RSVP success illustration (outside game/, hence the ../), shown on the intro.
  { key: 'rsvp-success', path: '../assets/site/rsvp-success.webp' },
  // The couple's route map, shown when the location is revealed (see rewardArt.js).
  { key: 'location-map', path: '../getaway/assets/map-game.webp' },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // The shared manifests' paths are relative to game/index.html.
    this.load.setPath(GAME_ASSET_ROOT);
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
    if (charParam) gameState.setCharacter(charParam);

    const entry = entryForSlug(params.get('scene'));
    this.scene.start(entry?.key ?? 'Intro', {
      char: gameState.getCharacter(),
      ...entry?.data,
      // ?scene=game-over&from=<slug> picks the level RETRY goes back to.
      from: keyForSlug(params.get('from')) ?? undefined,
    });
  }
}
