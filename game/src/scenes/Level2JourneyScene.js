// LEVEL 2 — The Journey (GAME_SPEC.md §6). One shared continuous scene driving
// through 6 stages (car -> tent -> plane -> island -> campervan -> house).
// Supports ?scene=level2&stage=<id> to jump into any sub-stage for testing.
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { bgKey } from '../config/backgrounds.js';
import { MASH, ADVANCE } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { MashMeter } from '../logic/MashMeter.js';
import { AdvanceTrack } from '../logic/AdvanceTrack.js';
import { JOURNEY_STAGES, stageIndexById, nextStage } from '../logic/JourneyStages.js';
import { textureKeyFor as propKey } from '../config/props.js';
import { headKeyFor } from '../config/characterSprites.js';
import { MeterBar } from '../ui/MeterBar.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import { t } from '../config/i18n.js';

const BG_STAGE_NAME = {
  car: 'road-scene',
  tent: 'sky',
  plane: 'sky',
  island: 'ocean',
  campervan: 'road-scene',
};

// Pili & Joe riding along — offsets are relative to the vehicle prop's center,
// tuned per vehicle since the art isn't uniformly laid out.
const PASSENGER_SPOTS = {
  car: { scale: 1.4, driver: { x: 20, y: -38 }, passenger: { x: -16, y: -38 } },
};

// Joe & Pili always pop out of the same two windows of campervan.png — Joe
// from the first (leftmost on screen) window, Pili from the second — no
// matter which character the player picked. Offsets are the two side-window
// centers measured off the art, already accounting for the horizontal flip
// applied to the campervan prop (see FLIP_HORIZONTAL_STAGES).
const CAMPERVAN_WINDOWS = {
  scale: 1.1,
  joe: { x: -56, y: -24 },
  pili: { x: 64, y: -20 },
};

// car.png and campervan.png are drawn nose-left; both stages drive to the
// right, so flip them (and mirror the passenger offsets above) to face the
// direction of travel. plane.png is already nose-right, so it's untouched.
const FLIP_HORIZONTAL_STAGES = new Set(['car', 'campervan']);

export class Level2JourneyScene extends Phaser.Scene {
  constructor() {
    super('Level2Journey');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
    this.startStageId = data?.stage && stageIndexById(data.stage) !== -1 ? data.stage : 'car';
  }

  create() {
    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.cameras.main.fadeIn(300, 18, 11, 46);

    this.bg = this.add.tileSprite(0, 0, width, height, bgKey(this, 'sky')).setOrigin(0, 0);
    this.propImage = null;
    this.progressBar = null;
    this.advanceTrack = null;
    this.meter = null;
    this.stageComplete = false;

    this.titleText = this.add
      .text(this.centerX, 54, t('level2Title'), {
        fontFamily: FONTS.heading,
        fontSize: '14px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    fitTopTitle(this, this.titleText);

    this.stageLabel = this.add
      .text(this.centerX, 80, '', {
        fontFamily: FONTS.heading,
        fontSize: '18px',
        color: CSS_COLORS.cyan,
      })
      .setOrigin(0.5);

    this.hintText = this.add
      .text(this.centerX, height - 60, '', {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: CSS_COLORS.mutedPurple,
      })
      .setOrigin(0.5);

    this.actions = new InputActions();
    this.actions.on('moveStart', () => {
      if (this.currentStage?.type === 'advance' && this.advanceTrack) this.advanceTrack.setHeld(true);
    });
    this.actions.on('moveEnd', () => {
      if (this.advanceTrack) this.advanceTrack.setHeld(false);
    });
    this.actions.on('mash', () => this.handleMash());

    this.input.keyboard.on('keydown-RIGHT', () => this.actions.moveStart());
    this.input.keyboard.on('keyup-RIGHT', () => this.actions.moveEnd());
    this.input.keyboard.on('keydown-SPACE', () => this.actions.mash());

    this.events.once('shutdown', () => touchControls.unbind());

    addMuteToggle(this);
    addLangToggle(this);

    this.enterStage(JOURNEY_STAGES[stageIndexById(this.startStageId)]);
  }

  handleMash() {
    if (this.currentStage?.type !== 'meter' || !this.meter || this.meter.complete) return;
    this.meter.press();
    sfx.mashTick(this.meter.percent * 200);
    this.progressBar.setPercent(this.meter.percent);
    this._spawnHeartPop();
    if (this.meter.complete) {
      sfx.meterComplete();
      this.stageComplete = true;
      this.time.delayedCall(400, () => this.advanceToNextStage());
    }
  }

  _spawnHeartPop() {
    const x = this.centerX + Phaser.Math.Between(-50, 50);
    const y = this.centerY + Phaser.Math.Between(-10, 10);
    const heart = this.add.image(x, y, 'prop-heart').setScale(0.4);
    this.tweens.add({
      targets: heart,
      y: y - 60,
      scale: 0.8,
      duration: 550,
      ease: 'Cubic.Out',
      onComplete: () => heart.destroy(),
    });
  }

  enterStage(stage) {
    this.currentStage = stage;
    this.stageComplete = false;
    this._clearStageVisuals();

    if (stage.type === 'boss-handoff') {
      fadeToScene(this, 'Level2Boss', { char: this.char });
      return;
    }

    this.stageLabel.setText(t(stage.labelKey));
    this.bg.setTexture(bgKey(this, BG_STAGE_NAME[stage.id] ?? 'sky'));

    this.propImage = this.add.image(this.centerX, this.centerY, propKey(stage.id)).setScale(4);
    // Narrow portrait screens are narrower than 4x some prop art (e.g. the
    // car) is wide — shrink to fit rather than letting it run off-screen.
    const maxPropWidth = this.scale.width * 0.85;
    const shrink = this.propImage.displayWidth > maxPropWidth
      ? maxPropWidth / this.propImage.displayWidth
      : 1;
    if (shrink < 1) this.propImage.setScale(this.propImage.scale * shrink);
    if (FLIP_HORIZONTAL_STAGES.has(stage.id)) this.propImage.setFlipX(true);
    this._addPassengers(stage.id, shrink);

    if (stage.type === 'advance') {
      this.advanceTrack = new AdvanceTrack({ distance: ADVANCE.distance, speedPerMs: ADVANCE.speedPerMs });
      this.progressBar = new MeterBar(this, { x: this.centerX, y: this.centerY + 140, width: 260, label: t('meterProgressLabel') });
      this.hintText.setText(t('hintDrive'));
      touchControls.bind(this.actions, { showDpad: true });
    } else if (stage.type === 'meter') {
      const target = stage.id === 'tent' ? MASH.tentTarget : MASH.islandTarget;
      this.meter = new MashMeter({ target });
      this.progressBar = new MeterBar(this, { x: this.centerX, y: this.centerY + 140, width: 260, label: t('meterProgressLabel') });
      this.hintText.setText(t('hintMash'));
      touchControls.bind(this.actions, { actionLabel: t('goLabel') });
    }
  }

  // `shrink` (<=1) mirrors whatever the vehicle prop itself got scaled down
  // by to fit a narrow screen, so passenger heads stay anchored to their
  // window/seat instead of drifting once the vehicle shrinks under them.
  _addPassengers(stageId, shrink = 1) {
    this.passengers = [];

    if (stageId === 'campervan') {
      const { scale, joe, pili } = CAMPERVAN_WINDOWS;
      [
        { key: headKeyFor('joe'), spot: joe },
        { key: headKeyFor('pili'), spot: pili },
      ].forEach(({ key, spot }) => {
        const head = this.add
          .image(this.centerX + spot.x * shrink, this.centerY + spot.y * shrink, key)
          .setScale(scale * shrink);
        head.baseY = head.y;
        this.passengers.push(head);
      });
      return;
    }

    const spots = PASSENGER_SPOTS[stageId];
    if (!spots) return;
    const driverKey = headKeyFor(this.char === 'joe' ? 'joe' : 'pili');
    const passengerKey = headKeyFor(this.char === 'joe' ? 'pili' : 'joe');
    const driver = this.add
      .image(this.centerX + spots.driver.x * shrink, this.centerY + spots.driver.y * shrink, driverKey)
      .setScale(spots.scale * shrink);
    driver.baseY = driver.y;
    const passenger = this.add
      .image(this.centerX + spots.passenger.x * shrink, this.centerY + spots.passenger.y * shrink, passengerKey)
      .setScale(spots.scale * shrink);
    passenger.baseY = passenger.y;
    this.passengers.push(driver, passenger);
  }

  _clearStageVisuals() {
    if (this.propImage) {
      this.propImage.destroy();
      this.propImage = null;
    }
    if (this.progressBar) {
      this.progressBar.destroy();
      this.progressBar = null;
    }
    (this.passengers ?? []).forEach((p) => p.destroy());
    this.passengers = [];
    this.advanceTrack = null;
    this.meter = null;
  }

  advanceToNextStage() {
    const next = nextStage(this.currentStage.id);
    if (!next) return;
    this.enterStage(next);
  }

  update(time, delta) {
    if (!this.currentStage || this.stageComplete) return;

    if (this.currentStage.type === 'advance' && this.advanceTrack) {
      this.advanceTrack.update(delta);
      this.progressBar.setPercent(this.advanceTrack.percent);
      if (this.advanceTrack.held) {
        this.bg.tilePositionX += delta * 0.15;
        const bob = Math.sin(time / 60) * 3;
        this.propImage.y = this.centerY + bob;
        this.passengers.forEach((p) => {
          p.y = p.baseY + bob;
        });
      }
      if (this.advanceTrack.isComplete) {
        this.stageComplete = true;
        sfx.meterComplete();
        this.time.delayedCall(300, () => this.advanceToNextStage());
      }
    }
  }
}
