// FINAL BOSS — The Proposal (GAME_SPEC.md §6). Mash to kneel/propose (reuses
// BossIntroFlow for the intro + meter portion), then a bespoke Yes/No loop —
// No shakes and re-prompts (no real fail state, it's a running joke); Yes
// triggers confetti + the wedding illustration + the ending.
import { COLORS, CSS_COLORS, FONTS } from '../config/palette.js';
import { MASH } from '../config/tuning.js';
import { gameState } from '../state/gameState.js';
import { InputActions } from '../logic/InputActions.js';
import { MashMeter } from '../logic/MashMeter.js';
import { MeterBar } from '../ui/MeterBar.js';
import { BossIntroFlow } from '../ui/BossIntroFlow.js';
import { touchControls } from '../ui/touchControlsInstance.js';
import { addMuteToggle } from '../ui/muteToggle.js';
import { addLangToggle } from '../ui/langToggle.js';
import { fitTopTitle } from '../ui/fitTopTitle.js';
import { fadeToScene } from '../ui/transitions.js';
import { sfx } from '../config/sfx.js';
import {
  FINAL_BOSS_INTRO_PILI,
  FINAL_BOSS_INTRO_JOE,
  FINAL_BOSS_PROPOSE_LABEL,
  FINAL_BOSS_QUESTION,
  FINAL_BOSS_WRONG_ANSWER,
  FINAL_BOSS_YES_TEXT,
} from '../config/dialogue.js';
import { t } from '../config/i18n.js';

export class FinalBossScene extends Phaser.Scene {
  constructor() {
    super('FinalBossProposal');
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
      .text(this.centerX, 40, t('theProposalTitle'), {
        fontFamily: FONTS.heading,
        fontSize: '18px',
        color: CSS_COLORS.gold,
      })
      .setOrigin(0.5);
    fitTopTitle(this, title);

    this.proposalArt = this.add.image(this.centerX, this.centerY - 105, 'pose-proposal');
    const maxArtHeight = this.scale.height * 0.34;
    this.proposalArt.setScale(Math.min(1, maxArtHeight / this.proposalArt.height));
    this.proposalArt.setDepth(10);

    this.flow = new BossIntroFlow(this, { centerX: this.centerX, centerY: this.centerY + 60 });
    this.state = 'intro';
    this.meter = null;
    this.meterBar = null;
    this.questionGroup = [];

    const introLines = this.char === 'joe' ? FINAL_BOSS_INTRO_JOE() : FINAL_BOSS_INTRO_PILI();
    this.flow.showIntro(introLines, t('readyLabel'));

    this.actions = new InputActions();
    this.actions.on('mash', () => this.handleMash());
    this.actions.on('confirmYes', () => this.handleYes());
    this.actions.on('confirmNo', () => this.handleNo());

    this.input.keyboard.on('keydown-SPACE', () => this.actions.mash());
    this.input.keyboard.on('keydown-ENTER', () => this.actions.confirmYes());
    this.input.keyboard.on('keydown-Y', () => this.actions.confirmYes());
    this.input.keyboard.on('keydown-N', () => this.actions.confirmNo());

    touchControls.bind(this.actions, { actionLabel: t('readyLabel') });
    this.events.once('shutdown', () => touchControls.unbind());

    addMuteToggle(this);
    addLangToggle(this);
  }

  handleMash() {
    if (this.state === 'intro') {
      this.flow.clearIntro();
      this.state = 'kneel';
      this.meter = new MashMeter({ target: MASH.proposeTarget });
      this.meterBar = new MeterBar(this, {
        x: this.centerX,
        y: this.centerY + 60,
        width: 260,
        label: t('kneelLabel'),
      });
      touchControls.bind(this.actions, { actionLabel: FINAL_BOSS_PROPOSE_LABEL() });
      return;
    }
    if (this.state !== 'kneel' || this.meter.complete) return;

    this.meter.press();
    sfx.mashTick(this.meter.percent * 200);
    this.meterBar.setPercent(this.meter.percent);

    if (this.meter.complete) {
      sfx.meterComplete();
      this.time.delayedCall(400, () => this.showQuestion());
    }
  }

  showQuestion() {
    if (this.meterBar) {
      this.meterBar.destroy();
      this.meterBar = null;
    }
    this.state = 'question';
    this._renderQuestion();
    // The in-scene YES/NO buttons below already handle taps, so skip the
    // touch-controls bottom bar here — showing both reads as a duplicate.
    touchControls.unbind();
  }

  _renderQuestion() {
    this._clearQuestion();
    const q = this.add
      .text(this.centerX, this.centerY + 30, FINAL_BOSS_QUESTION(), {
        fontFamily: FONTS.heading,
        fontSize: '18px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        wordWrap: { width: this.scale.width * 0.75 },
      })
      .setOrigin(0.5);

    const yesBtn = this._makeChoiceButton(this.centerX - 90, this.centerY + 120, t('yesChoice'), COLORS.gold, () =>
      this.actions.confirmYes(),
    );
    const noBtn = this._makeChoiceButton(this.centerX + 90, this.centerY + 120, t('noChoice'), COLORS.red, () =>
      this.actions.confirmNo(),
    );
    this.questionGroup = [q, yesBtn.bg, yesBtn.text, noBtn.bg, noBtn.text];
  }

  _makeChoiceButton(x, y, label, color, onClick) {
    const bg = this.add.rectangle(x, y, 120, 56, COLORS.background).setStrokeStyle(4, color).setInteractive({
      useHandCursor: true,
    });
    const text = this.add
      .text(x, y, label, { fontFamily: FONTS.heading, fontSize: '14px', color: CSS_COLORS.offWhite })
      .setOrigin(0.5);
    bg.on('pointerdown', onClick);
    return { bg, text };
  }

  _clearQuestion() {
    this.questionGroup.forEach((obj) => obj.destroy());
    this.questionGroup = [];
  }

  handleNo() {
    if (this.state !== 'question') return;
    sfx.wrongAnswer();
    this._clearQuestion();
    this.cameras.main.shake(250, 0.01);
    const error = this.flow.showBigMessage(FINAL_BOSS_WRONG_ANSWER(), { color: CSS_COLORS.red, fontSize: '16px' });
    this.time.delayedCall(700, () => {
      this.flow.clearBigMessage();
      this._renderQuestion();
    });
  }

  handleYes() {
    if (this.state !== 'question') return;
    this.state = 'win';
    this._clearQuestion();
    touchControls.unbind();
    sfx.fanfare();

    this.tweens.add({ targets: this.proposalArt, alpha: 0, duration: 300 });
    this.flow.showBigMessage(FINAL_BOSS_YES_TEXT(), { color: CSS_COLORS.gold, fontSize: '24px' });
    this._spawnConfetti();

    const wedding = this.add.image(this.centerX, this.centerY, 'pose-wedding').setAlpha(0).setScale(0.3);
    const maxHeight = this.scale.height * 0.6;
    const targetScale = Math.min(1, maxHeight / wedding.height);
    this.tweens.add({
      targets: wedding,
      alpha: 1,
      scale: targetScale,
      duration: 700,
      delay: 400,
      ease: 'Back.Out',
    });

    this.time.delayedCall(2600, () => {
      fadeToScene(this, 'Ending', { char: this.char });
    });
  }

  _spawnConfetti() {
    // Plain rectangular confetti pieces in the game palette — simpler and
    // reads more like classic confetti than the star-shaped prop art did.
    const colors = [COLORS.gold, COLORS.cyan, COLORS.red, COLORS.offWhite, COLORS.mutedPurple];
    for (let i = 0; i < 60; i += 1) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(-40, -10);
      const w = Phaser.Math.Between(4, 8);
      const h = Phaser.Math.Between(8, 14);
      const piece = this.add.rectangle(x, y, w, h, Phaser.Utils.Array.GetRandom(colors));
      this.tweens.add({
        targets: piece,
        y: this.scale.height + 40,
        x: x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(180, 720),
        duration: Phaser.Math.Between(1400, 2600),
        delay: Phaser.Math.Between(0, 500),
        ease: 'Cubic.In',
        onComplete: () => piece.destroy(),
      });
    }
  }
}
