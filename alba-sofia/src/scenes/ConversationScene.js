// The conversation at the end of each level, in the spirit of Monkey Island:
// the guest (Sofia or Alba) talks to whoever was waiting at the end of the
// level, picks what to say, and after three rounds of finding the right thing
// the host tells her what comes next in the adventure. `step` picks which
// (the names are the getaway's, which this game was copied from):
//
//   date     — after level 1, with Pili; what to do on Mars, then level 2's intro
//   location — after level 2, with Joe; how to beat the warship, then the boss's intro
//   full     — after the boss, with both; the reward, then back to choosing a player
//
// Each one ends on a "level cleared" screen: a planet for the first two, and
// the pair high-fiving in the intro's black hole, on the intro's starfield,
// after the boss. That last screen is the end of the game (PLAY AGAIN): the
// Finale scene with the getaway invitation is no longer part of the flow.
//
// What gets said is all in config/conversations.js; the bookkeeping (which
// round, which options are crossed off) is logic/Dialogue.js. This file is
// only the staging: a black panel over the level's own backdrop, the host's
// face in a circle on top (two of them after the boss), the player's own face
// at the bottom beside their replies, speech bubbles, and the reveal.
import {
  COLORS,
  CSS_COLORS,
  FONTS,
  TITLE_SHADOW,
  InputActions,
  touchControls,
  addMuteToggle,
  addLangToggle,
  fadeToScene,
  sfx,
  t,
} from '../shared.js';
import { getPlayer, portraitKey } from '../config/characters.js';
import { getConversation, SPEAKERS } from '../config/conversations.js';
import { Dialogue } from '../logic/Dialogue.js';
import { BLACK, CSS_BLACK } from '../config/art.js';
import { addSpaceBackdrop, addMarsBackdrop, addMarsGround, addCityBackdrop, addCityGround, addBlackHole, addStarfield } from '../config/backdrops.js';
import { drawRingedPlanet, drawCityPlanet, ART_WIDTH, ART_HEIGHT } from '../config/rewardArt.js';
import { fitWidth, addContinueButton, explode } from '../sceneHelpers.js';

// `draw` is the planet on the screen that closes the step (the last one shows
// the high-five picture instead, and `stars` swaps the level's backdrop for
// the intro's); `next` is where its button goes.
const STEPS = {
  date: {
    backdrop: 'space',
    title: 'levelClearTitle',
    message: 'levelClearSpace',
    button: 'levelClearNext',
    draw: drawRingedPlanet,
    next: { scene: 'LevelIntro', data: { level: 'level2' } },
  },
  location: {
    backdrop: 'mars',
    title: 'levelClearTitle',
    message: 'levelClearMars',
    button: 'levelClearNext',
    draw: drawCityPlanet,
    next: { scene: 'LevelIntro', data: { level: 'boss' } },
  },
  full: {
    backdrop: 'city',
    title: 'gameClearTitle',
    message: 'gameClearText',
    button: 'gameClearNext',
    stars: true,
    next: { scene: 'Select', data: {} },
  },
};

// Where each character's face is in their portrait illustration, as a
// fraction of the image, and how much of the image's width the face takes up
// — used to crop the portrait down to a head-and-shoulders avatar.
const FACE = {
  pili: { x: 0.56, y: 0.3, span: 0.46 },
  joe: { x: 0.54, y: 0.235, span: 0.62 },
  sofia: { x: 0.67, y: 0.22, span: 0.72 },
  alba: { x: 0.49, y: 0.18, span: 1.16 },
};

const TYPE_MS = 18; // per letter
const CONFETTI = [COLORS.gold, COLORS.cyan, COLORS.red, COLORS.offWhite];

export class ConversationScene extends Phaser.Scene {
  constructor() {
    super('Conversation');
  }

  init(data) {
    this.char = data?.char ?? getPlayer();
    this.stepName = STEPS[data?.step] ? data.step : 'date';
    this.step = STEPS[this.stepName];
    this.hosts = SPEAKERS[this.stepName];
    this.speaker = this.hosts[0]; // the host saying the current line
    this.dialogue = new Dialogue(getConversation(this.stepName));
    // typing -> options | waiting (tap to go on) -> ... -> reveal
    this.phase = 'typing';
    this.playerText = null; // what the player last said, shown as their bubble
    this.charText = ''; // what the host is saying
    this.shown = 0; // how many letters of it have been typed out
    this.after = 'options'; // what follows the line being typed: options | next | reveal
    this.selected = 0;
    this.phaseSince = 0;
    this.leaving = false;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(300, 18, 11, 46);
    this.addBackdrop();
    this.dim = this.add.rectangle(0, 0, width, height, BLACK, 0.35).setOrigin(0, 0);

    // Everything is sized off the screen, so a portrait phone, a landscape
    // phone and a desktop window all get a panel that fits.
    const compact = height < 430;
    const radius = Phaser.Math.Clamp(height * 0.065, 24, 44);
    const panelWidth = Math.min(640, width - 24);
    this.m = {
      compact,
      radius,
      x: (width - panelWidth) / 2,
      width: panelWidth,
      top: 30 + radius,
      bottom: height - 12,
      pad: compact ? 10 : 16,
      fontSize: compact ? 11 : width < 500 ? 14 : 16,
      rowMin: compact ? 30 : 44,
      avatarX: width / 2,
      avatarY: 30 + radius,
      playerRadius: Math.round(radius * 0.8),
    };

    this.chrome = this.add.container(0, 0);
    this.chrome.add(
      this.add
        .rectangle(this.m.x, this.m.top, this.m.width, this.m.bottom - this.m.top, BLACK, 0.86)
        .setOrigin(0, 0),
    );
    this.addHosts();
    this.addPlayerAvatar();
    this.ui = this.add.container(0, 0); // bubbles and options, rebuilt on every change

    this.actions = new InputActions();
    this.actions.on('choose', (index) => this.pick(index));
    this.actions.on('mash', () => this.advance());
    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => this.moveSelection(-1));
    kb.on('keydown-DOWN', () => this.moveSelection(1));
    kb.on('keydown-ENTER', () => this.confirm());
    kb.on('keydown-SPACE', (event) => !event.repeat && this.confirm());
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((key, index) => kb.on(`keydown-${key}`, () => this.actions.choose(index)));
    this.input.on('pointerdown', () => this.actions.mash());
    touchControls.unbind(); // options are tapped directly

    addMuteToggle(this);
    addLangToggle(this);

    this.sayRound();
  }

  addBackdrop() {
    const { width, height } = this.scale;
    const groundY = height - 80;
    if (this.step.backdrop === 'space') {
      this.backdrop = addSpaceBackdrop(this);
    } else if (this.step.backdrop === 'mars') {
      this.backdrop = addMarsBackdrop(this, groundY);
      addMarsGround(this, groundY, 0, width);
    } else {
      this.backdrop = addCityBackdrop(this, groundY);
      addCityGround(this, groundY, 0, width);
    }
  }

  // A face cropped out of `char`'s portrait into a ringed circle with their
  // name under it. Returns the pieces the scene goes on to move or restyle.
  addFace(char, x, y, radius, color) {
    const face = FACE[char] ?? FACE.pili;
    const portrait = this.add.image(x, y, portraitKey(char)).setOrigin(face.x, face.y);
    portrait.setScale((radius * 2) / (portrait.width * face.span));
    const shape = this.make.graphics();
    shape.fillCircle(x, y, radius);
    portrait.setMask(shape.createGeometryMask());
    const ring = this.add.circle(x, y, radius).setStrokeStyle(4, color);
    const name = this.add
      .text(x, y + radius + (this.m.compact ? 8 : 12), char.toUpperCase(), {
        fontFamily: FONTS.heading,
        fontSize: this.m.compact ? '8px' : '10px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
      })
      .setOrigin(0.5);
    this.chrome.add([this.add.circle(x, y, radius, COLORS.mutedPurple), portrait, ring, name]);
    return { x, y, portrait, ring, name };
  }

  // The hosts' faces sitting on the panel's top edge: one in the middle, or
  // two side by side. The one talking is ringed in gold and nods (see say()).
  addHosts() {
    const { avatarX, avatarY, radius } = this.m;
    const step = radius * 2 + 28;
    this.faces = {};
    this.hosts.forEach((char, i) => {
      const x = avatarX + (i - (this.hosts.length - 1) / 2) * step;
      const face = this.addFace(char, x, avatarY, radius, COLORS.gold);
      face.nod = this.tweens.add({ targets: face.portrait, y: avatarY + 2, duration: 110, yoyo: true, repeat: -1, paused: true });
      this.faces[char] = face;
    });
  }

  // The player's own face, in cyan like their speech bubble, in the panel's
  // bottom-left corner; the replies they can pick from line up beside it.
  addPlayerAvatar() {
    const m = this.m;
    const r = m.playerRadius;
    const nameRoom = m.compact ? 14 : 20;
    this.playerFace = this.addFace(this.char, m.x + m.pad + r, m.bottom - m.pad - nameRoom - r, r, COLORS.cyan);
  }

  // Gold ring and name for the host who is talking, muted for the other.
  markSpeaker() {
    Object.entries(this.faces).forEach(([char, face]) => {
      const on = char === this.speaker;
      face.ring.setStrokeStyle(4, on ? COLORS.gold : COLORS.mutedPurple);
      face.name.setColor(on ? CSS_COLORS.gold : CSS_COLORS.mutedPurple);
    });
  }

  setPhase(phase) {
    this.phase = phase;
    this.phaseSince = this.time.now;
  }

  // The host's opening line for the round being played.
  sayRound() {
    const { line, who } = this.dialogue.round;
    this.say(line, 'options', who);
  }

  // Host `who` (the only one, unless the script says) starts saying `text`;
  // `after` is what follows once it has been typed out.
  say(text, after, who = this.hosts[0]) {
    this.charText = text;
    this.shown = 0;
    this.after = after;
    this.speaker = who;
    this.markSpeaker();
    this.setPhase('typing');
    this.faces[who].nod.resume();
    this.render();
    this.typer?.remove();
    this.typer = this.time.addEvent({
      delay: TYPE_MS,
      loop: true,
      callback: () => {
        this.shown += 1;
        this.charLabel.setText(this.charText.slice(0, this.shown));
        if (this.shown % 3 === 0) sfx.blip();
        if (this.shown >= this.charText.length) this.finishTyping();
      },
    });
  }

  finishTyping() {
    this.typer?.remove();
    this.typer = null;
    this.shown = this.charText.length;
    Object.values(this.faces).forEach((face) => {
      face.nod.pause();
      face.portrait.y = face.y;
    });
    if (this.after === 'options') {
      this.selected = this.dialogue.round.options.findIndex((_o, i) => !this.dialogue.isCrossed(i));
      this.setPhase('options');
    } else {
      this.setPhase('waiting');
    }
    this.render();
  }

  // Enter/Space: finish the line being typed, move on, or say the highlighted option.
  confirm() {
    if (this.phase === 'options') this.actions.choose(this.selected);
    else this.actions.mash();
  }

  // A tap anywhere (or Enter/Space outside the options): hurry the typing
  // along, or move on once the character has finished.
  advance() {
    // The tap that picked an option also lands here; don't let it skip the reply.
    if (this.time.now - this.phaseSince < 200) return;
    if (this.phase === 'typing') {
      this.finishTyping();
    } else if (this.phase === 'waiting') {
      if (this.after === 'reveal') {
        this.reveal();
      } else {
        this.playerText = null;
        this.sayRound();
      }
    }
  }

  moveSelection(delta) {
    if (this.phase !== 'options') return;
    const count = this.dialogue.round.options.length;
    let next = this.selected;
    do {
      next = (next + delta + count) % count;
    } while (this.dialogue.isCrossed(next) && next !== this.selected);
    this.selected = next;
    this.styleRows();
  }

  pick(index) {
    if (this.phase !== 'options') return;
    const option = this.dialogue.round.options[index];
    const result = this.dialogue.choose(index);
    if (!result) return;
    if (result.correct) sfx.meterComplete();
    else sfx.stumble();
    this.playerText = option.text;
    this.say(result.reply, result.done ? 'reveal' : result.correct ? 'next' : 'options', option.who);
  }

  // Rebuilds the bubbles and (when it's the player's turn) the options.
  render() {
    const m = this.m;
    this.ui.removeAll(true);
    this.rows = [];
    const left = m.x + m.pad;
    const inner = m.width - m.pad * 2;
    const bubblePad = m.compact ? 6 : 10;
    const bodyStyle = { fontFamily: FONTS.body, fontSize: `${m.fontSize}px`, lineSpacing: m.compact ? 1 : 4 };
    let y = m.avatarY + m.radius + (m.compact ? 18 : 28);

    // What the player just said, on the right. Dropped on a very short
    // screen, where there's only room for the character's side.
    if (this.playerText && !m.compact) {
      const label = this.add
        .text(0, 0, this.playerText, { ...bodyStyle, color: CSS_COLORS.cyan, wordWrap: { width: inner * 0.82 - bubblePad * 2 } })
        .setOrigin(0, 0);
      const w = label.width + bubblePad * 2;
      const h = label.height + bubblePad * 2;
      const x = left + inner - w;
      this.ui.add(this.add.rectangle(x, y, w, h, BLACK, 1).setOrigin(0, 0).setStrokeStyle(2, COLORS.cyan));
      label.setPosition(x + bubblePad, y + bubblePad);
      this.ui.add(label);
      y += h + 8;
    }

    // What the host says, on the left. The bubble is sized for the
    // whole line up front, so it doesn't grow as the letters appear.
    const charLabel = this.add
      .text(0, 0, this.charText, { ...bodyStyle, color: CSS_BLACK, wordWrap: { width: inner * 0.92 - bubblePad * 2 } })
      .setOrigin(0, 0);
    const bubbleW = charLabel.width + bubblePad * 2;
    const bubbleH = charLabel.height + bubblePad * 2;
    this.ui.add(this.add.rectangle(left, y, bubbleW, bubbleH, COLORS.offWhite, 1).setOrigin(0, 0));
    // The tail sits under the face of whoever is talking, or at the bubble's
    // near corner when a short line leaves the bubble narrower than that.
    const tailX = Math.min(this.faces[this.speaker].x - 7, left + bubbleW - 14 - 12);
    this.ui.add(this.add.triangle(tailX, y, 0, 0, 14, 0, 7, -8, COLORS.offWhite).setOrigin(0, 0));
    charLabel.setPosition(left + bubblePad, y + bubblePad);
    charLabel.setText(this.charText.slice(0, this.shown));
    this.ui.add(charLabel);
    this.charLabel = charLabel;

    if (this.phase === 'options') {
      // Beside the player's face, not across the whole panel.
      const indent = m.playerRadius * 2 + (m.compact ? 8 : 12);
      this.addOptionRows(left + indent, inner - indent, bodyStyle);
    } else if (this.phase === 'waiting') {
      const hint = this.add
        .text(m.x + m.width / 2, m.bottom - (m.compact ? 12 : 20), t('talkContinue'), {
          fontFamily: FONTS.heading,
          fontSize: m.compact ? '8px' : '10px',
          color: CSS_COLORS.gold,
        })
        .setOrigin(0.5);
      fitWidth(hint, inner);
      this.tweens.add({ targets: hint, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
      this.ui.add(hint);
    }
  }

  // The replies the player can pick from, stacked up from the panel's bottom
  // edge. A crossed-off one stays visible, struck through, but can't be picked.
  addOptionRows(left, inner, bodyStyle) {
    const m = this.m;
    const options = this.dialogue.round.options;
    const gap = m.compact ? 4 : 8;
    const textPad = m.compact ? 6 : 12;
    const labels = options.map((option) =>
      this.add.text(0, 0, `> ${option.text}`, { ...bodyStyle, wordWrap: { width: inner - textPad * 2 } }).setOrigin(0, 0.5),
    );
    const heights = labels.map((label) => Math.max(m.rowMin, label.height + (m.compact ? 8 : 16)));
    let y = m.bottom - m.pad - heights.reduce((sum, h) => sum + h + gap, -gap);

    options.forEach((_option, index) => {
      const crossed = this.dialogue.isCrossed(index);
      const box = this.add.rectangle(left, y, inner, heights[index], COLORS.background, 1).setOrigin(0, 0);
      const label = labels[index].setPosition(left + textPad, y + heights[index] / 2);
      this.ui.add([box, label]);
      if (crossed) {
        box.setAlpha(0.45).setStrokeStyle(2, COLORS.mutedPurple);
        label.setColor(CSS_COLORS.mutedPurple).setAlpha(0.7);
        this.ui.add(this.add.rectangle(left + textPad, y + heights[index] / 2, Math.min(label.width, inner - textPad * 2), 2, COLORS.mutedPurple).setOrigin(0, 0.5));
      } else {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerover', () => {
          this.selected = index;
          this.styleRows();
        });
        box.on('pointerdown', () => this.actions.choose(index));
      }
      this.rows.push({ box, label, crossed });
      y += heights[index] + gap;
    });
    this.styleRows();
  }

  // Gold for the highlighted option, plain for the rest.
  styleRows() {
    this.rows.forEach(({ box, label, crossed }, index) => {
      if (crossed) return;
      const on = index === this.selected;
      box.setStrokeStyle(on ? 3 : 2, on ? COLORS.gold : COLORS.mutedPurple);
      label.setColor(on ? CSS_COLORS.gold : CSS_COLORS.offWhite);
    });
  }

  // The secret is out: the panel blows apart and the "level cleared" screen
  // takes its place.
  reveal() {
    const { width, height } = this.scale;
    const m = this.m;
    this.setPhase('reveal');
    this.cameras.main.flash(350, 255, 255, 255);
    this.cameras.main.shake(320, 0.012);
    const blast = { colors: [COLORS.offWhite, COLORS.gold, COLORS.cyan], count: 30, size: 12, spread: Math.min(width, height) * 0.5 };
    explode(this, m.avatarX, m.avatarY, blast);
    explode(this, width / 2, (m.top + m.bottom) / 2, blast);
    this.ui.destroy();
    this.chrome.destroy();
    [...Object.values(this.faces), this.playerFace].forEach((face) => face.portrait.clearMask(true));
    this.tweens.add({ targets: this.dim, fillAlpha: 0.55, duration: 300 });
    this.time.delayedCall(250, () => this.showCleared());
  }

  showCleared() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const maxWidth = width - 32;
    // On a phone the button is down in the touch bar, not on the canvas, so
    // the art sits in the very middle and the message moves down with it.
    const centred = touchControls.isVisible();
    const artY = height * (centred ? 0.5 : 0.45);

    // Added now, so it covers the level's backdrop and sits under what follows.
    if (this.step.stars) {
      this.add.rectangle(0, 0, width, height, COLORS.background).setOrigin(0, 0);
      this.backdrop = addStarfield(this);
    }

    // The stamp: slams in oversized and settles.
    const stamp = this.add
      .text(centerX, height * 0.17, t(this.step.title), { fontFamily: FONTS.heading, fontSize: '26px', color: CSS_COLORS.gold })
      .setOrigin(0.5)
      .setDepth(10); // above the black hole's aura, which reaches up behind it
    stamp.setShadow(TITLE_SHADOW.offsetX, TITLE_SHADOW.offsetY, TITLE_SHADOW.color, TITLE_SHADOW.blur);
    fitWidth(stamp, maxWidth);
    const settled = stamp.scale;
    stamp.setScale(settled * 3).setAlpha(0).setAngle(-8);
    this.tweens.add({
      targets: stamp,
      scale: settled,
      alpha: 1,
      angle: 0,
      duration: 320,
      ease: 'Back.easeOut',
      onComplete: () => this.cameras.main.shake(160, 0.008),
    });

    // The art drops in from above and bounces to rest.
    const art = this.add.container(centerX, -height * 0.5);
    if (this.step.draw) {
      this.step.draw(this, art);
      art.setScale(Math.min(1.6, (height * 0.3) / ART_HEIGHT, maxWidth / ART_WIDTH));
    } else {
      this.addHighFive(art, Math.min(height * 0.17, maxWidth * 0.4));
    }
    this.tweens.add({ targets: art, y: artY, duration: 800, delay: 200, ease: 'Bounce.easeOut' });

    const value = this.add
      .text(centerX, height * (centred ? 0.8 : 0.7), t(this.step.message), {
        fontFamily: FONTS.heading,
        fontSize: '18px',
        color: CSS_COLORS.offWhite,
        align: 'center',
        lineSpacing: 14,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);
    fitWidth(value, maxWidth);
    this.tweens.add({ targets: value, alpha: 1, duration: 400, delay: 900 });

    sfx.fanfare();
    const confetti = { colors: CONFETTI, count: 24, size: 8, spread: 170 };
    [[0.2, 0.35], [0.8, 0.35], [0.5, 0.25], [0.3, 0.6], [0.7, 0.6]].forEach(([fx, fy], i) => {
      this.time.delayedCall(350 + i * 220, () => explode(this, width * fx, height * fy, confetti));
    });

    this.time.delayedCall(1300, () => {
      addContinueButton(this, height * 0.88, t(this.step.button), t(this.step.button), () => {
        if (this.leaving) return;
        this.leaving = true;
        fadeToScene(this, this.step.next.scene, { ...this.step.next.data, char: this.char });
      });
    });
  }

  // Sofia and Alba high-fiving in a black hole of the given radius, like the
  // pair on the intro screen.
  addHighFive(into, radius) {
    into.add(addBlackHole(this, 0, 0, radius));
    const pair = this.add.image(0, 0, 'high-five');
    // Keep them inside the disc: the picture is cropped tight, so its corners
    // are as far as they reach.
    pair.setScale(Math.min(1, radius / (Math.hypot(pair.width, pair.height) / 2 / 1.15)));
    into.add(pair);
  }

  update() {
    this.backdrop.update();
  }
}
