// LEVEL 1 — Single Life (GAME_SPEC.md §6). Character-specific 7-obstacle
// side-scroller. No fail state: touching an obstacle is just a stumble (tint
// flash + sfx), never a life loss or restart — reaching the finish line always
// advances to the boss.
import { COLORS, CSS_COLORS, FONTS } from '../config/palette.js';
import { bgKey, groundBgKey } from '../config/backgrounds.js';
import { LEVEL1 } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { FrameAnimator } from '../logic/FrameAnimator.js';
import { getObstacleSequence, buildObstacleLayout } from '../logic/ObstacleSequence.js';
import { textureKeyFor as propKey } from '../config/props.js';
import { textureKeyFor as charKey, runFrameKeys } from '../config/characterSprites.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import { t } from '../config/i18n.js';

export class Level1DatingRaceScene extends Phaser.Scene {
  constructor() {
    super('Level1DatingRace');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    gameState.setCharacter(this.char);
  }

  create() {
    const { width, height } = this.scale;
    this.groundY = height - 80;

    const sequence = getObstacleSequence(this.char);
    const layout = buildObstacleLayout(sequence, {
      spacingPx: LEVEL1.obstacleSpacing,
      startX: LEVEL1.startX,
    });
    this.finishX = layout[layout.length - 1].x + 400;
    const levelWidth = this.finishX + 400;

    this.cameras.main.fadeIn(300, 18, 11, 46);
    this.physics.world.setBounds(0, 0, levelWidth, height);
    this.cameras.main.setBounds(0, 0, levelWidth, height);

    this.add.tileSprite(0, 0, levelWidth, height, bgKey(this, 'sky')).setOrigin(0, 0).setScrollFactor(0.4);
    this.add
      .tileSprite(0, this.groundY, levelWidth, 40, groundBgKey(this))
      .setOrigin(0, 0)
      .setScrollFactor(1);

    // Ground collider (invisible)
    const groundBody = this.add.rectangle(levelWidth / 2, this.groundY + 20, levelWidth, 40, 0, 0);
    this.physics.add.existing(groundBody, true);

    // Obstacles
    this.obstacleGroup = this.physics.add.staticGroup();
    layout.forEach((ob) => {
      const spr = this.obstacleGroup.create(ob.x, this.groundY, propKey(ob.type)).setOrigin(0.5, 1);
      spr.refreshBody();
      spr.obstacleData = ob;
    });

    // Finish marker (invisible trigger)
    this.finishMarker = this.add.rectangle(this.finishX, this.groundY - 100, 10, 200, 0, 0);
    this.physics.add.existing(this.finishMarker, true);
    this.finished = false;

    // Player
    this.idleKey = charKey(this.char, 'idle');
    this.jumpKey = charKey(this.char, 'jump');
    this.runFrames = runFrameKeys(this.char);
    this.runAnimator = new FrameAnimator({ frames: this.runFrames, frameDurationMs: 120 });

    this.player = this.physics.add.sprite(100, this.groundY - 60, this.idleKey).setOrigin(0.5, 1);
    this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.95);
    this.player.body.setGravityY(0); // uses world gravity from main.js config

    this.physics.add.collider(this.player, groundBody);
    this.physics.add.collider(this.player, this.obstacleGroup, this.handleObstacleHit, null, this);
    this.physics.add.overlap(this.player, this.finishMarker, this.handleFinish, null, this);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-width * 0.25, 0);

    // Input
    this.actions = new InputActions();
    this.actions.on('moveStart', () => {
      this.isMoving = true;
    });
    this.actions.on('moveEnd', () => {
      this.isMoving = false;
    });
    this.actions.on('jump', () => this.tryJump());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown-SPACE', () => this.actions.jump());
    this.input.keyboard.on('keydown-UP', () => this.actions.jump());

    touchControls.bind(this.actions, { showDpad: true, showJump: true });
    this.events.once('shutdown', () => touchControls.unbind());

    const levelTitle = this.add
      .text(width / 2, 44, t('level1Title'), {
        fontFamily: FONTS.heading,
        fontSize: '14px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    fitTopTitle(this, levelTitle);

    addMuteToggle(this);
    addLangToggle(this);
  }

  tryJump() {
    if (!this.player.body.blocked.down && !this.player.body.touching.down) return;
    this.player.setVelocityY(LEVEL1.jumpVelocity);
    sfx.jump();
  }

  handleObstacleHit(player, obstacleSprite) {
    const ob = obstacleSprite.obstacleData;
    if (ob.cleared) return;
    ob.cleared = true;
    sfx.stumble();
    this.cameras.main.shake(150, 0.004);
    player.setTintFill(COLORS.red);
    this.time.delayedCall(LEVEL1.stumbleDurationMs, () => player.clearTint());
  }

  handleFinish() {
    if (this.finished) return;
    this.finished = true;
    fadeToScene(this, 'Level1Boss', { char: this.char });
  }

  update(time, delta) {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    this.player.setVelocityX(this.isMoving ? LEVEL1.runSpeed : 0);

    if (!onGround) {
      this.player.setTexture(this.jumpKey);
    } else if (this.isMoving) {
      this.player.setTexture(this.runAnimator.update(delta));
    } else {
      this.runAnimator.reset();
      this.player.setTexture(this.idleKey);
    }

    // Keyboard hold-to-move (arrow right) — routed through the same actions.
    if (this.cursors.right.isDown && !this._rightWasDown) {
      this.actions.moveStart();
    } else if (!this.cursors.right.isDown && this._rightWasDown) {
      this.actions.moveEnd();
    }
    this._rightWasDown = this.cursors.right.isDown;
  }
}
