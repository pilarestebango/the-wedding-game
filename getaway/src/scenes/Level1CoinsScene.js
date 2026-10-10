// LEVEL 1 — Space. A platformer: collect LEVEL1.coinTarget coins and reach the
// flag. Falling off a platform is a death; so is reaching the flag short of
// the target. Both go to the death screen, which retries this level.
import { gameState, InputActions, touchControls, fadeToScene, sfx, t } from '../shared.js';
import { LEVEL1 } from '../config/tuning.js';
import { buildPlatformLayout } from '../logic/PlatformLayout.js';
import { artKey, platformKey, PLATFORM_HEIGHT, FLAG_SIZE, COIN_FRAMES } from '../config/art.js';
import { addSpaceBackdrop } from '../config/backdrops.js';
import { Player } from '../Player.js';
import { bindKeyboard, addLevelHud, addFlag, die } from '../sceneHelpers.js';

export class Level1CoinsScene extends Phaser.Scene {
  constructor() {
    super('Level1Coins');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.isOver = false;
    this.coinCount = 0;
  }

  create() {
    const { width, height } = this.scale;
    // Platforms sit on a base line near the bottom; "rise" lifts them from
    // there. The step shrinks on a short screen so the top platforms and the
    // jump above them still fit under the HUD.
    const baseY = height - 110;
    const riseUnit = Phaser.Math.Clamp((height - 280) / 2, LEVEL1.minRiseUnit, LEVEL1.maxRiseUnit);
    const layout = buildPlatformLayout({ riseUnit });

    this.cameras.main.fadeIn(300, 18, 11, 46);
    // The world reaches far below the screen: there's no floor to land on,
    // update() calls the fall a death once the player has dropped out of view.
    this.physics.world.setBounds(0, -400, layout.width, height + 1200);
    this.cameras.main.setBounds(0, 0, layout.width, height);

    this.backdrop = addSpaceBackdrop(this);

    const platforms = this.physics.add.staticGroup();
    layout.platforms.forEach((p) => {
      const strip = this.add
        .tileSprite(p.x, baseY - p.rise, p.width, PLATFORM_HEIGHT, platformKey(this))
        .setOrigin(0, 0);
      platforms.add(strip);
    });

    const coins = this.physics.add.staticGroup();
    if (!this.anims.exists('getaway-coin-spin')) {
      this.anims.create({
        key: 'getaway-coin-spin',
        frames: COIN_FRAMES.map((name) => ({ key: artKey(this, name) })),
        frameRate: 8,
        repeat: -1,
      });
    }
    // Each coin starts a frame on from the last, so a row of them ripples.
    layout.coins.forEach((c, i) =>
      coins
        .create(c.x, baseY - c.rise, artKey(this, 'coin'))
        .play({ key: 'getaway-coin-spin', startFrame: i % COIN_FRAMES.length }),
    );

    const last = layout.platforms[layout.platforms.length - 1];
    const flag = addFlag(this, layout.finishX, baseY - last.rise);
    this.physics.add.existing(flag, true);
    flag.body.setSize(FLAG_SIZE.width, FLAG_SIZE.height * 3).setOffset(0, -FLAG_SIZE.height * 2);

    this.actions = new InputActions();
    this.player = new Player(this, layout.startX, baseY - 4, this.char, this.actions);
    this.player.sprite.setCollideWorldBounds(true);

    this.physics.add.collider(this.player.sprite, platforms);
    this.physics.add.overlap(this.player.sprite, coins, (_player, coin) => this.collect(coin));
    this.physics.add.overlap(this.player.sprite, flag, () => this.reachFlag());

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-width * 0.15, 0);
    this.fallLine = height + LEVEL1.fallMargin;

    bindKeyboard(this, this.actions, { spaceAction: 'jump' });
    touchControls.bind(this.actions, { showDpad: true, showLeft: true, showJump: true });
    this.events.once('shutdown', () => touchControls.unbind());

    this.hud = addLevelHud(this, t('spaceTitle'), this.hudText());
  }

  hudText() {
    return t('coinsHud', { count: this.coinCount, target: LEVEL1.coinTarget });
  }

  collect(coin) {
    coin.destroy();
    this.coinCount += 1;
    this.hud.setText(this.hudText());
    sfx.coinClink();
  }

  reachFlag() {
    if (this.isOver) return;
    if (this.coinCount < LEVEL1.coinTarget) {
      this.player.freeze();
      die(this, { reason: 'coins', count: this.coinCount });
      return;
    }
    this.isOver = true;
    this.player.freeze();
    sfx.fanfare();
    fadeToScene(this, 'Conversation', { step: 'date', char: this.char });
  }

  update(_time, delta) {
    this.backdrop.update();
    if (this.isOver) return;
    this.player.update(delta);
    if (this.player.sprite.y > this.fallLine) die(this);
  }
}
