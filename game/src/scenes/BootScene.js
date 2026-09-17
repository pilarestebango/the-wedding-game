// Boot: loads illustrations + sprite/prop art, generates the procedural
// backgrounds once, reads the ?scene=<slug>&char=<pili|joe>&stage=<id> debug
// params (CLAUDE.md "Testing / debug conventions"), and routes to the right
// scene.
import { ILLUSTRATIONS, SPRITES } from '../config/assetManifest.js';
import { keyForSlug } from '../config/sceneRegistry.js';
import { gameState } from '../state/gameState.js';
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { t } from '../config/i18n.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    ILLUSTRATIONS.forEach(({ key, path }) => this.load.image(key, path));
    SPRITES.forEach(({ key, path }) => this.load.image(key, path));

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

    const slug = params.get('scene');
    const targetKey = keyForSlug(slug) ?? 'CharacterSelect';

    this.scene.start(targetKey, {
      char: gameState.getCharacter(),
      stage: params.get('stage') ?? undefined,
    });
  }
}
