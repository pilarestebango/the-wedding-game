// Choose your player: Sofia or Alba. Laid out like PILAR vs JOE's
// character-select screen (game/src/scenes/CharacterSelectScene.js), which
// can't be reused as it is because it only knows Pili and Joe.
import { CSS_COLORS, FONTS, TITLE_SHADOW, touchControls, addMuteToggle, addLangToggle, addExitLink, fadeToScene, t } from '../shared.js';
import { PLAYERS, portraitKey, setPlayer } from '../config/characters.js';
import { addStarfield } from '../config/backdrops.js';
import { fitWidth } from '../sceneHelpers.js';

const FILL = 0.55; // how much of the available room the pair take up
const ALBA_HEIGHT = 0.9; // Alba is drawn a little smaller, so Sofia reads as the taller one

export class SelectScene extends Phaser.Scene {
  constructor() {
    super('Select');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 18, 11, 46);
    touchControls.unbind(); // this screen has no gameplay actions to bind
    this.backdrop = addStarfield(this);

    const title = this.add
      .text(width / 2, 90, t('gameTitle'), { fontFamily: FONTS.heading, fontSize: '36px', color: CSS_COLORS.gold })
      .setOrigin(0.5);
    title.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitWidth(title, width * 0.92);

    const subtitle = this.add
      .text(width / 2, 140, t('charSelectSubtitle'), { fontFamily: FONTS.heading, fontSize: '14px', color: CSS_COLORS.mutedPurple })
      .setOrigin(0.5);
    fitWidth(subtitle, width * 0.92);
    this.tweens.add({ targets: subtitle, alpha: 0, duration: 600, yoyo: true, repeat: -1, ease: 'Step' });

    // The pair stand side by side on one line in the space between the
    // subtitle and the hint, so their names line up, at one shared scale so
    // neither is blown up relative to the other. They take up FILL of the room
    // there is, and never more than their own size: the pictures are small
    // (about 340px tall) and look blocky when enlarged.
    const topPad = 170;
    const bottomPad = 60;
    const maxHeight = (height - topPad - bottomPad - 50) * FILL; // 50: room for the name under each
    const maxWidth = width * 0.4 * FILL;
    const scale = Math.min(
      1,
      ...PLAYERS.flatMap((char) => {
        const img = this.textures.get(portraitKey(char)).getSourceImage();
        return [maxHeight / img.height, maxWidth / img.width];
      }),
    );
    // Sofia's picture looks right and Alba's left, so they face each other as drawn.
    const tallest = Math.max(...PLAYERS.map((char) => this.textures.get(portraitKey(char)).getSourceImage().height));
    const feetY = topPad + (height - topPad - bottomPad - 50 + tallest * scale) / 2;
    this.addPortrait(PLAYERS[0], width * 0.32, feetY, scale);
    this.addPortrait(PLAYERS[1], width * 0.68, feetY, scale * ALBA_HEIGHT);

    this.add
      .text(width / 2, height - 40, t('charSelectHint'), { fontFamily: FONTS.body, fontSize: '12px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5);

    addMuteToggle(this);
    const exitLink = addExitLink(this);
    addLangToggle(this, { x: exitLink.x + exitLink.width + 24 });
  }

  // `char`'s picture standing with its feet at (x, feetY), name underneath.
  addPortrait(char, x, feetY, scale) {
    const img = this.add.image(x, feetY, portraitKey(char)).setOrigin(0.5, 1).setScale(scale).setInteractive({ useHandCursor: true });
    // Shrunk by an uneven amount, so smoothed: sampled pixel-by-pixel like the
    // rest of the game, the drawing's own pixels come out ragged.
    img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const label = this.add
      .text(x, feetY + 24, char.toUpperCase(), { fontFamily: FONTS.heading, fontSize: '16px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5);

    img.on('pointerover', () => {
      img.setTint(0xdfffff);
      label.setColor(CSS_COLORS.cyan);
    });
    img.on('pointerout', () => {
      img.clearTint();
      label.setColor(CSS_COLORS.offWhite);
    });
    img.on('pointerdown', () => {
      setPlayer(char);
      fadeToScene(this, 'LevelIntro', { char }); // defaults to level 1
    });
  }

  update() {
    this.backdrop.update();
  }
}
