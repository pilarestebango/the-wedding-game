// BIG MESSY BOSS — a single-screen, Mars Attacks-style fight. The saucer
// sweeps across the top firing bolts at the player; the player runs
// left/right underneath, dodges, and shoots straight up. Three hearts; losing
// the last one is a death (retries the boss). Below half health the saucer
// steps up once — a little faster, firing a little more often (BOSS.secondHalf
// in tuning.js) — and stays there to the end. The
// arena is a rooftop in a neon city under a galaxy (config/backdrops.js).
import { COLORS, gameState, InputActions, touchControls, fadeToScene, sfx, t } from '../shared.js';
import { BOSS } from '../config/tuning.js';
import { Health } from '../logic/Health.js';
import { artKey, gridSize, shotKey, boltKey, SHIP_FRAMES } from '../config/art.js';
import { addCityBackdrop, addCityGround, MARS_GROUND_HEIGHT } from '../config/backdrops.js';
import { Player } from '../Player.js';
import { bindKeyboard, addLevelHud, die, explode } from '../sceneHelpers.js';

const HEART_SIZE = 22;
const BAR_HEIGHT = 10;

export class BossScene extends Phaser.Scene {
  constructor() {
    super('Boss');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.isOver = false;
    this.invulnerableUntil = 0;
    this.saucerSpeed = BOSS.speed;
    this.secondHalf = false;
  }

  create() {
    const { width, height } = this.scale;
    this.groundY = height - 80;
    this.bossHealth = new Health(BOSS.hp);
    this.hearts = new Health(BOSS.playerHearts);

    this.cameras.main.fadeIn(300, 18, 11, 46);
    this.physics.world.setBounds(0, 0, width, height);

    this.backdrop = addCityBackdrop(this, this.groundY);
    // The rest of the invasion, hanging back in the distance.
    [[0.16, 0.42, 0.2], [0.5, 0.5, 0.14], [0.86, 0.4, 0.24]].forEach(([fx, fy, scale], i) => {
      const far = this.add
        .image(width * fx, this.groundY * fy, artKey(this, 'saucer'))
        .setScale(Math.min(scale, (width * scale) / 500))
        .setAlpha(0.6); // faded, not tinted: a tint would darken the hull into the sky
      this.tweens.add({ targets: far, y: far.y + 8, duration: 1400 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    this.ground = addCityGround(this, this.groundY, 0, width);

    // The saucer is drawn 180px wide; shrink it on a narrow phone so there's
    // still room either side of it to dodge into.
    const saucerSize = gridSize('saucer');
    const scale = Math.min(1, (width * 0.42) / saucerSize.width);
    this.saucerHalfWidth = (saucerSize.width * scale) / 2;
    this.saucerY = 120 + (saucerSize.height * scale) / 2;
    this.saucer = this.physics.add.sprite(width / 2, this.saucerY, artKey(this, 'saucer')).setScale(scale);
    if (!this.anims.exists('getaway-ship-pulse')) {
      this.anims.create({
        key: 'getaway-ship-pulse',
        frames: SHIP_FRAMES.map((name) => ({ key: artKey(this, name) })),
        frameRate: 3,
        repeat: -1,
      });
    }
    this.saucer.play('getaway-ship-pulse');
    this.saucer.body.setAllowGravity(false);
    this.saucer.setVelocityX(this.saucerSpeed);

    this.bullets = this.physics.add.group({ allowGravity: false });
    this.bolts = this.physics.add.group({ allowGravity: false });

    this.actions = new InputActions();
    this.player = new Player(this, width / 2, this.groundY - 4, this.char, this.actions);
    this.player.sprite.setCollideWorldBounds(true);
    this.actions.on('shoot', () => this.shoot());

    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.overlap(this.bullets, this.saucer, (a, b) => this.hitBoss(a === this.saucer ? b : a));
    this.physics.add.overlap(this.player.sprite, this.bolts, (_player, bolt) => this.hitPlayer(bolt));
    this.physics.add.overlap(this.bolts, this.ground, (a, b) => (a === this.ground ? b : a).destroy());

    this.startBolts(BOSS.boltEveryMs);

    bindKeyboard(this, this.actions, { spaceAction: 'shoot' });
    touchControls.bind(this.actions, { showDpad: true, showLeft: true, showJump: true, showShoot: true });
    this.events.once('shutdown', () => touchControls.unbind());

    addLevelHud(this, t('bossTitle'), t('bossHint'));
    this.barWidth = Math.min(320, width * 0.6);
    this.bar = this.add.graphics().setDepth(900);
    // Hearts sit in the deck under the player's feet: the top of the screen is
    // taken by the title, the boss's bar and the saucer itself.
    const heartsY = this.groundY + MARS_GROUND_HEIGHT + 10;
    this.heartIcons = Array.from({ length: BOSS.playerHearts }, (_, i) =>
      this.add
        .image(16 + i * (HEART_SIZE + 6), heartsY, 'prop-heart')
        .setOrigin(0, 0)
        .setDisplaySize(HEART_SIZE, HEART_SIZE)
        .setDepth(900),
    );
    this.drawHud();
  }

  startBolts(delay) {
    this.boltTimer?.remove();
    this.boltTimer = this.time.addEvent({ delay, loop: true, callback: () => this.dropBolts() });
  }

  dropBolts() {
    if (this.isOver) return;
    // Aimed at where the player is standing right now, so staying put gets
    // you hit and moving gets you out of the way.
    const fromY = this.saucer.y + this.saucer.displayHeight / 2;
    const { sprite } = this.player;
    const aim = Phaser.Math.Angle.Between(this.saucer.x, fromY, sprite.x, sprite.y - sprite.height / 2);
    const bolt = this.bolts.create(this.saucer.x, fromY, boltKey(this));
    bolt.setRotation(aim - Math.PI / 2);
    bolt.setVelocity(Math.cos(aim) * BOSS.boltSpeed, Math.sin(aim) * BOSS.boltSpeed);
  }

  shoot() {
    if (this.isOver || !this.player.tryFire()) return;
    const { sprite } = this.player;
    const bullet = this.bullets.create(sprite.x, sprite.y - sprite.height, shotKey(this, { vertical: true }));
    bullet.setVelocityY(-BOSS.bulletSpeed);
  }

  hitBoss(bullet) {
    if (this.isOver) return;
    bullet.destroy();
    this.bossHealth.hit();
    sfx.hit();
    this.drawHud();
    this.saucer.setTintFill(0xffffff);
    this.time.delayedCall(80, () => this.saucer.clearTint());

    if (this.bossHealth.isDead) this.win();
    else if (!this.secondHalf && this.bossHealth.fraction <= BOSS.secondHalf.below) this.startSecondHalf();
  }

  // Half its health gone: the saucer shudders and picks up the pace, once.
  startSecondHalf() {
    this.secondHalf = true;
    this.saucerSpeed = BOSS.secondHalf.speed;
    this.saucer.setVelocityX(Math.sign(this.saucer.body.velocity.x || 1) * this.saucerSpeed);
    this.startBolts(BOSS.secondHalf.boltEveryMs);
    this.cameras.main.shake(220, 0.008);
    sfx.explode();
  }

  hitPlayer(bolt) {
    bolt.destroy();
    if (this.isOver || this.time.now < this.invulnerableUntil) return;
    this.hearts.hit();
    this.drawHud();
    if (this.hearts.isDead) {
      die(this);
      return;
    }
    sfx.stumble();
    this.invulnerableUntil = this.time.now + BOSS.invulnerableMs;
    this.tweens.add({
      targets: this.player.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(BOSS.invulnerableMs / 200) - 1,
      onComplete: () => this.player.sprite.setAlpha(1),
    });
  }

  win() {
    this.isOver = true;
    this.boltTimer.remove();
    this.bolts.clear(true, true);
    this.player.freeze();
    this.saucer.setVelocity(0, 0);
    // The saucer blows apart in a chain of explosions, then the finale.
    const blast = { colors: [COLORS.mutedPurple, COLORS.cyan, COLORS.gold, COLORS.red], count: 26, size: 10, spread: 150 };
    const halfW = this.saucer.displayWidth / 2;
    const halfH = this.saucer.displayHeight / 2;
    for (let i = 0; i < 5; i += 1) {
      this.time.delayedCall(i * 220, () => {
        explode(this, this.saucer.x + (Math.random() * 2 - 1) * halfW, this.saucer.y + (Math.random() * 2 - 1) * halfH, blast);
        this.cameras.main.shake(140, 0.006);
      });
    }
    this.time.delayedCall(1100, () => {
      this.saucer.setVisible(false);
      explode(this, this.saucer.x, this.saucer.y, { ...blast, count: 60, spread: 260 });
      sfx.fanfare();
    });
    this.time.delayedCall(2200, () => fadeToScene(this, 'Conversation', { step: 'full', char: this.char }));
  }

  drawHud() {
    const { width } = this.scale;
    const x = (width - this.barWidth) / 2;
    const y = 96;
    this.bar.clear();
    this.bar.fillStyle(COLORS.mutedPurple, 1);
    this.bar.fillRect(x - 2, y - 2, this.barWidth + 4, BAR_HEIGHT + 4);
    this.bar.fillStyle(COLORS.background, 1);
    this.bar.fillRect(x, y, this.barWidth, BAR_HEIGHT);
    this.bar.fillStyle(COLORS.red, 1);
    this.bar.fillRect(x, y, this.barWidth * this.bossHealth.fraction, BAR_HEIGHT);
    this.heartIcons?.forEach((icon, i) => icon.setAlpha(i < this.hearts.current ? 1 : 0.2));
  }

  update(time, delta) {
    this.backdrop.update();
    if (this.isOver) return;
    this.player.update(delta);

    // Bounce the saucer off the screen edges.
    const { width } = this.scale;
    const { body } = this.saucer;
    if (this.saucer.x < this.saucerHalfWidth + 8) body.setVelocityX(this.saucerSpeed);
    else if (this.saucer.x > width - this.saucerHalfWidth - 8) body.setVelocityX(-this.saucerSpeed);
    this.saucer.y = this.saucerY + Math.sin(time / 300) * 10;

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.y < -20) bullet.destroy();
    });
    this.bolts.getChildren().forEach((bolt) => {
      if (bolt.x < -20 || bolt.x > width + 20) bolt.destroy();
    });
  }
}
