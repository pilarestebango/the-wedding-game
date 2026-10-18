// LEVEL 2 — Mars Wastelands. Played on three heights: the ground and two
// tiers of rock platforms. Lava pits break the ground and can only be crossed
// over the platforms. Small monsters have to be jumped — shooting one splits
// it in two. Big ones are taller than a jump and have to be shot down, and a
// giant guards the exit, firing back now and then. Touching a monster or one
// of the giant's shots, or falling in the lava, is a death (retries this level).
import { gameState, InputActions, touchControls, fadeToScene, sfx, t } from '../shared.js';
import { LEVEL2 } from '../config/tuning.js';
import { buildMarsLevel } from '../logic/MarsLayout.js';
import { Health } from '../logic/Health.js';
import { COLORS, PROP_COLORS } from '../shared.js';
import { artKey, shotKey, FLAG_SIZE, MONSTER_SHEETS, monsterScale } from '../config/art.js';
import {
  addMarsBackdrop,
  addMarsGround,
  addLava,
  marsPlatformKey,
  MARS_PLATFORM_HEIGHT,
} from '../config/backdrops.js';
import { Player } from '../Player.js';
import { bindKeyboard, addLevelHud, addFlag, die, explode } from '../sceneHelpers.js';

// Debris colours and size for each kind of monster's explosion.
const BLAST = {
  big: { colors: [COLORS.red, COLORS.gold, COLORS.offWhite], count: 44, size: 12, spread: 180 },
  giant: { colors: [COLORS.mutedPurple, COLORS.cyan, COLORS.gold, COLORS.offWhite], count: 80, size: 16, spread: 280 },
};

const walkAnim = (type) => `getaway-monster-${type}-walk`;

export class Level2MarsScene extends Phaser.Scene {
  constructor() {
    super('Level2Mars');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.isOver = false;
  }

  create() {
    const { width, height } = this.scale;
    this.groundY = height - 80;
    // The step between tiers shrinks on a short screen so the top tier and
    // the player standing on it still fit under the HUD.
    const tierRise = Phaser.Math.Clamp((this.groundY - 150) / 2, LEVEL2.minTierRise, LEVEL2.maxTierRise);
    const level = buildMarsLevel({ tierRise });

    this.cameras.main.fadeIn(300, 18, 11, 46);
    // The world reaches below the screen so the player can drop into a pit;
    // update() calls that a death once they're out of view.
    this.physics.world.setBounds(0, -400, level.width, height + 1200);
    this.cameras.main.setBounds(0, 0, level.width, height);
    this.fallLine = height + LEVEL2.fallMargin;

    this.backdrop = addMarsBackdrop(this, this.groundY);
    addLava(this, this.groundY, level.width);

    const solids = this.physics.add.staticGroup();
    level.ground.forEach((g) => solids.add(addMarsGround(this, this.groundY, g.x, g.width)));
    level.platforms.forEach((p) => {
      const ledge = this.add
        .tileSprite(p.x, this.groundY - p.rise, p.width, MARS_PLATFORM_HEIGHT, marsPlatformKey(this))
        .setOrigin(0, 0);
      solids.add(ledge);
      // One-way: solid from above only, so the player can jump up through a
      // ledge and walk underneath one.
      ledge.body.checkCollision.down = false;
      ledge.body.checkCollision.left = false;
      ledge.body.checkCollision.right = false;
    });

    const flag = addFlag(this, level.finishX, this.groundY);
    this.physics.add.existing(flag, true);
    flag.body.setSize(FLAG_SIZE.width, height).setOffset(0, FLAG_SIZE.height - height);

    // Walk cycles: the big monster's two code-drawn frames, the giant's sheet.
    const walks = {
      big: { frames: [{ key: artKey(this, 'monster-big') }, { key: artKey(this, 'monster-big-step') }], frameRate: 4 },
    };
    Object.entries(MONSTER_SHEETS).forEach(([type, sheet]) => {
      walks[type] = {
        frames: this.anims.generateFrameNumbers(sheet.key, { frames: sheet.frames.walk }),
        frameRate: sheet.walkFps,
      };
    });
    Object.entries(walks).forEach(([type, walk]) => {
      if (!this.anims.exists(walkAnim(type))) this.anims.create({ key: walkAnim(type), repeat: -1, ...walk });
    });

    // Monsters stand still until the player gets close, then pace back and
    // forth along their own stretch of ground or platform.
    this.monsters = this.physics.add.group({ allowGravity: false });
    level.monsters.forEach((m) => {
      const sprite = this.addMonster(m.type, m.x, this.groundY - m.rise, m.patrol);
      if (m.type === 'small') {
        sprite.canSplit = true;
      } else {
        sprite.health = new Health(LEVEL2[m.type].hp);
      }
      // Only the giant shows its health: it's the one that takes a lot of shots.
      if (m.type === 'giant') {
        sprite.healthBar = this.add.graphics();
        this.giant = sprite;
      }
    });
    this.giantShots = this.physics.add.group({ allowGravity: false });
    this.time.addEvent({ delay: LEVEL2.giant.shotEveryMs, loop: true, callback: () => this.giantFire() });

    this.bullets = this.physics.add.group({ allowGravity: false });

    this.actions = new InputActions();
    this.player = new Player(this, 100, this.groundY - 4, this.char, this.actions);
    this.player.sprite.setCollideWorldBounds(true);
    this.actions.on('shoot', () => this.shoot());

    this.physics.add.collider(this.player.sprite, solids);
    this.physics.add.overlap(this.player.sprite, this.monsters, () => die(this));
    this.physics.add.overlap(this.player.sprite, this.giantShots, () => die(this));
    this.physics.add.overlap(this.bullets, this.monsters, (bullet, monster) => this.hitMonster(bullet, monster));
    this.physics.add.overlap(this.player.sprite, flag, () => this.reachFlag());

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-width * 0.25, 0);

    bindKeyboard(this, this.actions, { spaceAction: 'shoot' });
    touchControls.bind(this.actions, { showDpad: true, showLeft: true, showJump: true, showShoot: true });
    this.events.once('shutdown', () => touchControls.unbind());

    addLevelHud(this, t('marsTitle'), t('marsHint'));
  }

  shoot() {
    if (this.isOver || !this.player.tryFire()) return;
    const { sprite, facing } = this.player;
    // Fired from the height the player is standing at, so it travels along their tier.
    const bullet = this.bullets.create(sprite.x + facing * 20, sprite.y - LEVEL2.bulletHeight, shotKey(this));
    bullet.setVelocityX(facing * LEVEL2.bulletSpeed);
  }

  addMonster(type, x, y, patrol) {
    const sheet = MONSTER_SHEETS[type];
    const sprite = this.monsters.create(x, y, sheet?.key ?? artKey(this, `monster-${type}`)).setOrigin(0.5, 1);
    sprite.setScale(monsterScale(type));
    sprite.body.setSize(sprite.width * (sheet?.bodyWidth ?? 0.8), sprite.height * 0.95);
    sprite.monsterType = type;
    sprite.patrol = patrol;
    sprite.awake = false;
    return sprite;
  }

  // Shooting a small monster backfires: it splits in two. Each can only split
  // once, so a trigger-happy player gets a pair to jump, not a wall of them.
  splitMonster(monster) {
    sfx.stumble();
    if (!monster.canSplit) return;
    monster.canSplit = false;
    const [min, max] = monster.patrol;
    const { splitOffset } = LEVEL2.small;
    // The twin appears on the far side from the player, if there's room there.
    const away = monster.x >= this.player.sprite.x ? 1 : -1;
    let x = monster.x + away * splitOffset;
    if (x < min || x > max) x = monster.x - away * splitOffset;
    const twin = this.addMonster('small', Phaser.Math.Clamp(x, min, max), monster.y, monster.patrol);
    [monster, twin].forEach((m) => {
      m.setTintFill(0xffffff);
      this.time.delayedCall(120, () => m.active && m.clearTint());
    });
    this.tweens.add({ targets: twin, scale: { from: 0.2, to: 1 }, duration: 180 });
  }

  // Holds one of a monster's single-frame poses (the giant's attack / damage)
  // for a moment, then goes back to walking.
  showPose(monster, pose, ms) {
    const frame = MONSTER_SHEETS[monster.monsterType]?.frames[pose];
    if (frame === undefined) return;
    monster.anims.stop();
    monster.setFrame(frame);
    monster.poseTimer?.remove();
    monster.poseTimer = this.time.delayedCall(ms, () => monster.active && monster.play(walkAnim(monster.monsterType)));
  }

  // The giant's occasional shot: slow and low, straight along the ground
  // toward the player. Only once it's on screen.
  giantFire() {
    const giant = this.giant;
    if (this.isOver || !giant?.active || !giant.awake) return;
    if (!this.cameras.main.worldView.contains(giant.x, giant.y - giant.displayHeight / 2)) return;
    const dir = this.player.sprite.x < giant.x ? -1 : 1;
    const shot = this.giantShots.create(
      giant.x + (dir * giant.displayWidth) / 2,
      giant.y - LEVEL2.giant.shotHeight,
      shotKey(this, { color: PROP_COLORS.slimeGreen, name: 'giant-shot' }),
    );
    shot.setScale(1.5).setVelocityX(dir * LEVEL2.giant.shotSpeed);
    this.showPose(giant, 'attack', 450);
    sfx.shoot();
  }

  hitMonster(bullet, monster) {
    bullet.destroy();
    if (monster.monsterType === 'small') {
      this.splitMonster(monster);
      return;
    }
    monster.health.hit();
    if (monster.health.isDead) {
      explode(this, monster.x, monster.y - monster.displayHeight / 2, BLAST[monster.monsterType]);
      this.cameras.main.shake(160, 0.006);
      monster.healthBar?.destroy();
      monster.destroy();
      return;
    }
    this.drawHealthBar(monster);
    sfx.hit();
    this.showPose(monster, 'damage', 260);
    monster.setTintFill(0xffffff);
    this.time.delayedCall(80, () => monster.active && monster.clearTint());
  }

  drawHealthBar(monster) {
    if (!monster.healthBar) return;
    const width = monster.body.width;
    const x = monster.x - width / 2;
    const y = monster.y - monster.displayHeight - 18;
    monster.healthBar.clear();
    monster.healthBar.fillStyle(COLORS.offWhite, 1);
    monster.healthBar.fillRect(x - 2, y - 2, width + 4, 12);
    monster.healthBar.fillStyle(COLORS.background, 1);
    monster.healthBar.fillRect(x, y, width, 8);
    monster.healthBar.fillStyle(COLORS.red, 1);
    monster.healthBar.fillRect(x, y, width * monster.health.fraction, 8);
  }

  reachFlag() {
    if (this.isOver) return;
    this.isOver = true;
    this.player.freeze();
    sfx.fanfare();
    fadeToScene(this, 'Conversation', { step: 'location', char: this.char });
  }

  update(_time, delta) {
    this.backdrop.update();
    if (this.isOver) return;
    this.player.update(delta);
    if (this.player.sprite.y > this.fallLine) {
      die(this);
      return;
    }

    const view = this.cameras.main.worldView;
    this.monsters.getChildren().forEach((monster) => {
      const speed = LEVEL2[monster.monsterType].speed;
      if (!monster.awake && monster.x < view.right + 40) {
        monster.awake = true;
        monster.setVelocityX(-speed);
        if (this.anims.exists(walkAnim(monster.monsterType))) monster.play(walkAnim(monster.monsterType));
      } else if (monster.awake) {
        const [min, max] = monster.patrol;
        if (monster.x <= min) monster.setVelocityX(speed);
        else if (monster.x >= max) monster.setVelocityX(-speed);
      }
      // The giant's art looks (and lashes out) to the left; turn it to face the player.
      if (monster === this.giant) monster.setFlipX(this.player.sprite.x > monster.x);
      this.drawHealthBar(monster); // follows it as it walks
    });
    [...this.bullets.getChildren(), ...this.giantShots.getChildren()].forEach((shot) => {
      if (shot.x > view.right + 40 || shot.x < view.left - 40) shot.destroy();
    });
  }
}
