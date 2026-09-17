// LEVEL 3 (Joe branch) — Getting the Ring (GAME_SPEC.md §6). Reuses Level 1's
// side-scroller engine/pattern: run + jump to collect the rings (7 by
// default, see RINGS.count in tuning.js). Completion is gated on reaching
// the finish line (not strictly on collecting every ring) — deliberately
// avoids a possible soft-lock if a guest player misses a jump, consistent
// with the game's overall "no fail state" philosophy.
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { bgKey, groundBgKey } from '../config/backgrounds.js';
import { RINGS } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { FrameAnimator } from '../logic/FrameAnimator.js';
import { buildRingLayout } from '../logic/RingSequence.js';
import { textureKeyFor as propKey } from '../config/props.js';
import { textureKeyFor as charKey, runFrameKeys } from '../config/characterSprites.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import { t } from '../config/i18n.js';

export class Level3RingsScene extends Phaser.Scene {
  constructor() {
    super('Level3Rings');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
  }

  create() {
    const { width, height } = this.scale;
    this.groundY = height - 80;
    this.collectedCount = 0;

    const layout = buildRingLayout({ count: RINGS.count, spacing: RINGS.spacing, startX: RINGS.startX });
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

    const groundBody = this.add.rectangle(levelWidth / 2, this.groundY + 20, levelWidth, 40, 0, 0);
    this.physics.add.existing(groundBody, true);

    this.ringGroup = this.physics.add.staticGroup();
    layout.forEach((ring, i) => {
      const y = i % 2 === 0 ? this.groundY - 40 : this.groundY - 140;
      const spr = this.ringGroup.create(ring.x, y, propKey('ring')).setOrigin(0.5, 0.5);
      spr.refreshBody();
      spr.ringData = ring;
    });

    this.finishMarker = this.add.rectangle(this.finishX, this.groundY - 100, 10, 200, 0, 0);
    this.physics.add.existing(this.finishMarker, true);
    this.finished = false;

    this.idleKey = charKey(this.char, 'idle');
    this.jumpKey = charKey(this.char, 'jump');
    this.runFrames = runFrameKeys(this.char);
    this.runAnimator = new FrameAnimator({ frames: this.runFrames, frameDurationMs: 120 });

    this.player = this.physics.add.sprite(100, this.groundY - 60, this.idleKey).setOrigin(0.5, 1);
    this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.95);

    this.physics.add.collider(this.player, groundBody);
    this.physics.add.overlap(this.player, this.ringGroup, this.handleRingCollect, null, this);
    this.physics.add.overlap(this.player, this.finishMarker, this.handleFinish, null, this);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(-width * 0.25, 0);

    this.actions = new InputActions();
    this.actions.on('moveStart', () => {
      this.isMoving = true;
    });
    this.actions.on('moveEnd', () => {
      this.isMoving = false;
    });
    this.actions.on('jump', () => this.tryJump());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.actions.jump());
    this.input.keyboard.on('keydown-UP', () => this.actions.jump());

    touchControls.bind(this.actions, { showDpad: true, showJump: true });
    this.events.once('shutdown', () => touchControls.unbind());

    const levelTitle = this.add
      .text(width / 2, 30, t('level3RingsTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '14px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    fitTopTitle(this, levelTitle);

    this.ringCountText = this.add
      .text(width / 2, 54, t('ringLabel', { count: 0, total: RINGS.count }), {
        fontFamily: FONTS.body,
        fontSize: '20px',
        fontStyle: 'bold',
        color: CSS_COLORS.cyan,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    addMuteToggle(this);
    addLangToggle(this);
  }

  tryJump() {
    if (!this.player.body.blocked.down && !this.player.body.touching.down) return;
    this.player.setVelocityY(RINGS.jumpVelocity);
    sfx.jump();
  }

  handleRingCollect(player, ringSprite) {
    if (ringSprite.ringData.collected) return;
    ringSprite.ringData.collected = true;
    ringSprite.destroy();
    this.collectedCount += 1;
    this.ringCountText.setText(t('ringLabel', { count: this.collectedCount, total: RINGS.count }));
    sfx.ringCollect();
  }

  handleFinish() {
    if (this.finished) return;
    this.finished = true;
    fadeToScene(this, 'FinalBossProposal', { char: this.char });
  }

  update(time, delta) {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    this.player.setVelocityX(this.isMoving ? RINGS.runSpeed : 0);

    if (!onGround) {
      this.player.setTexture(this.jumpKey);
    } else if (this.isMoving) {
      this.player.setTexture(this.runAnimator.update(delta));
    } else {
      this.runAnimator.reset();
      this.player.setTexture(this.idleKey);
    }

    if (this.cursors.right.isDown && !this._rightWasDown) {
      this.actions.moveStart();
    } else if (!this.cursors.right.isDown && this._rightWasDown) {
      this.actions.moveEnd();
    }
    this._rightWasDown = this.cursors.right.isDown;
  }
}
