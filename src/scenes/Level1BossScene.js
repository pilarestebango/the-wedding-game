// BOSS: The First Date (GAME_SPEC.md §6). 3 loops of [mash to fill drink meter]
// then [mash to grow talk speech-bubble], then a heart + "you're in love" screen.
import { CSS_COLORS, FONTS } from '../config/palette.js';
import { MASH, BOSS_LOOPS } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { MashMeter } from '../logic/MashMeter.js';
import { LoopSequencer } from '../logic/LoopSequencer.js';
import { MeterBar } from '../ui/MeterBar.js';
import { BossIntroFlow } from '../ui/BossIntroFlow.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import {
  FIRST_DATE_INTRO,
  FIRST_DATE_DRINK_LABEL,
  FIRST_DATE_TALK_LABEL,
  FIRST_DATE_WIN_TEXT,
} from '../config/dialogue.js';
import { beerFrameForPercent } from '../config/props.js';

export class Level1BossScene extends Phaser.Scene {
  constructor() {
    super('Level1Boss');
  }

  init(data) {
    this.char = data?.char ?? gameState.getCharacter();
  }

  create() {
    const { width, height } = this.scale;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.cameras.main.fadeIn(300, 18, 11, 46);

    const title = this.add
      .text(this.centerX, 40, 'THE FIRST DATE', {
        fontFamily: FONTS.heading,
        fontSize: '16px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    fitTopTitle(this, title);

    this.flow = new BossIntroFlow(this, { centerX: this.centerX, centerY: this.centerY });
    this.loopSeq = new LoopSequencer({ phases: ['drink', 'talk'], loops: BOSS_LOOPS.firstDateLoops });
    this.state = 'intro';
    this.meter = null;
    this.meterBar = null;
    this.bubble = null;

    this.loopLabel = this.add
      .text(this.centerX, this.centerY + 135, '', {
        fontFamily: FONTS.body,
        fontSize: '12px',
        color: CSS_COLORS.mutedPurple,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.flow.showIntro(FIRST_DATE_INTRO, 'READY!');

    this.actions = new InputActions();
    this.actions.on('mash', () => this.handleMash());
    this.input.keyboard.on('keydown-SPACE', () => this.actions.mash());

    touchControls.bind(this.actions, { actionLabel: 'READY!' });
    this.events.once('shutdown', () => touchControls.unbind());

    addMuteToggle(this);
  }

  handleMash() {
    if (this.state === 'intro') {
      this.flow.clearIntro();
      this.startPhase(this.loopSeq.currentPhase);
      return;
    }
    if (this.state === 'win') return;

    if (!this.meter || this.meter.complete) return;
    this.meter.press();
    sfx.mashTick(this.meter.percent * 200);

    if (this.state === 'drink') {
      this.meterBar.setPercent(this.meter.percent);
      this._updateBeerLevel(this.meter.percent);
    } else if (this.state === 'talk') {
      const s = 0.3 + this.meter.percent * 1.9;
      this.bubble.setScale(s);
    }

    if (this.meter.complete) {
      sfx.meterComplete();
      this.time.delayedCall(350, () => this.completePhase());
    }
  }

  startPhase(phase) {
    this.state = phase;
    this.loopLabel.setText(`LOOP ${this.loopSeq.loopNumber} / ${BOSS_LOOPS.firstDateLoops}`);
    this._clearPhaseVisuals();

    if (phase === 'drink') {
      this.meter = new MashMeter({ target: MASH.drinkTarget });
      this._createBeerVisual();
      this.meterBar = new MeterBar(this, { x: this.centerX, y: this.centerY + 95, width: 220, label: 'DRINK' });
      touchControls.bind(this.actions, { actionLabel: FIRST_DATE_DRINK_LABEL });
    } else {
      this.meter = new MashMeter({ target: MASH.talkTarget });
      this.bubble = this.add.image(this.centerX, this.centerY - 20, 'prop-speech-bubble').setScale(0.3);
      this.add
        .text(this.centerX, this.centerY + 60, 'TALK', {
          fontFamily: FONTS.heading,
          fontSize: '12px',
          color: CSS_COLORS.cyan,
        })
        .setOrigin(0.5)
        .setName('talkLabel');
      touchControls.bind(this.actions, { actionLabel: FIRST_DATE_TALK_LABEL });
    }
  }

  _createBeerVisual() {
    // 6-frame emptying sequence (reference/beer.jpeg) swapped by fill percent
    // — real art frames rather than a masked-off rectangle.
    this.beerImage = this.add.image(this.centerX, this.centerY - 70, beerFrameForPercent(0)).setScale(3.2);
  }

  _updateBeerLevel(percent) {
    if (!this.beerImage) return;
    this.beerImage.setTexture(beerFrameForPercent(percent));
  }

  _clearPhaseVisuals() {
    if (this.meterBar) {
      this.meterBar.destroy();
      this.meterBar = null;
    }
    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = null;
    }
    if (this.beerImage) {
      this.beerImage.destroy();
      this.beerImage = null;
    }
    const talkLabel = this.children.getByName('talkLabel');
    if (talkLabel) talkLabel.destroy();
  }

  completePhase() {
    const next = this.loopSeq.advance();
    this._clearPhaseVisuals();
    if (next === null) {
      this.showWin();
      return;
    }
    this.startPhase(next);
  }

  showWin() {
    this.state = 'win';
    this.loopLabel.setText('');
    touchControls.unbind();

    const heart = this.add.image(this.centerX, this.centerY, 'prop-heart').setScale(0.3).setAlpha(0);
    this.tweens.add({
      targets: heart,
      scale: 3.5,
      alpha: 1,
      duration: 500,
      ease: 'Back.Out',
    });
    sfx.heart();

    this.flow.showBigMessage(FIRST_DATE_WIN_TEXT, { fontSize: '16px' });

    this.time.delayedCall(1800, () => {
      fadeToScene(this, 'Level2Journey', { char: this.char });
    });
  }
}
