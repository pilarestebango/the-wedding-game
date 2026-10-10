// The screen before each level: its name, a picture of what's in it, and
// what the player has to do. `level` picks which. A RETRY from the death
// screen skips this and goes straight back into the level.
import { CSS_COLORS, FONTS, TITLE_SHADOW, gameState, addMuteToggle, addLangToggle, fadeToScene, t } from '../shared.js';
import { LEVEL1, BOSS } from '../config/tuning.js';
import { artKey, flagKey, platformKey } from '../config/art.js';
import { fitWidth, addContinueButton } from '../sceneHelpers.js';
import { addStarfield } from '../config/backdrops.js';

// art: textures shown side by side, standing on a common base line.
const LEVELS = {
  level1: {
    title: 'spaceTitle',
    goals: 'spaceGoals',
    next: 'Level1Coins',
    art: (scene) => [
      { key: artKey(scene, 'coin'), scale: 2.25 },
      { key: artKey(scene, 'coin'), scale: 2.25 },
      { key: artKey(scene, 'coin'), scale: 2.25 },
      { key: flagKey(scene), scale: 1.4 },
    ],
    platform: true,
  },
  level2: {
    title: 'marsTitle',
    goals: 'marsGoals',
    next: 'Level2Mars',
    art: (scene) => [
      { key: artKey(scene, 'monster-small'), scale: 1.6 },
      { key: artKey(scene, 'monster-big'), scale: 1 },
      { key: artKey(scene, 'monster-small'), scale: 1.6 },
    ],
  },
  boss: {
    title: 'bossTitle',
    goals: 'bossGoals',
    next: 'Boss',
    art: (scene) => [{ key: artKey(scene, 'saucer'), scale: 1.4 }],
  },
};

const ART_GAP = 28;

export class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntro');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.level = LEVELS[data?.level] ?? LEVELS.level1;
    this.leaving = false;
  }

  create() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const maxWidth = width - 32;
    this.cameras.main.fadeIn(300, 18, 11, 46);
    this.backdrop = addStarfield(this);

    const title = this.add
      .text(centerX, height * 0.15, t(this.level.title), { fontFamily: FONTS.heading, fontSize: '24px', color: CSS_COLORS.gold })
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitWidth(title, maxWidth);

    this.addArt(centerX, height * 0.5, maxWidth, height * 0.24);

    const goals = this.add
      .text(centerX, height * 0.65, t(this.level.goals, { target: LEVEL1.coinTarget, hearts: BOSS.playerHearts }), {
        fontFamily: FONTS.heading,
        fontSize: '12px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5);
    fitWidth(goals, maxWidth);

    addContinueButton(this, height * 0.86, t('startLabel'), t('startLabel'), () => {
      if (this.leaving) return;
      this.leaving = true;
      fadeToScene(this, this.level.next, { char: this.char });
    });

    addMuteToggle(this);
    addLangToggle(this);
  }

  update() {
    this.backdrop.update();
  }

  // Lays the level's art out in a row whose bottom edge sits on `baseY`,
  // shrunk as one group if it's wider or taller than the space it has.
  addArt(centerX, baseY, maxWidth, maxHeight) {
    const items = this.level.art(this).map(({ key, scale }) => {
      const frame = this.textures.getFrame(key);
      return { key, width: frame.width * scale, height: frame.height * scale };
    });
    const rowWidth = items.reduce((sum, item) => sum + item.width, 0) + ART_GAP * (items.length - 1);
    const rowHeight = Math.max(...items.map((item) => item.height));
    const fit = Math.min(1, maxWidth / rowWidth, maxHeight / rowHeight);

    let x = centerX - (rowWidth * fit) / 2;
    items.forEach((item) => {
      this.add.image(x, baseY, item.key).setOrigin(0, 1).setDisplaySize(item.width * fit, item.height * fit);
      x += (item.width + ART_GAP) * fit;
    });
    if (this.level.platform) {
      this.add.tileSprite(centerX, baseY, rowWidth * fit + 40, 20, platformKey(this)).setOrigin(0.5, 0);
    }
  }
}
