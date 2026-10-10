// Small pieces every getaway level shares: keyboard -> InputActions wiring,
// the top-of-screen title/HUD, and the trip to the death screen.
import { COLORS, CSS_COLORS, FONTS, InputActions, touchControls, fitTopTitle, addMuteToggle, addLangToggle, sfx } from './shared.js';
import { flagKey, flagFrames } from './config/art.js';

// The pirate flag that ends levels 1 and 2, rippling, with the foot of its
// pole at (x, y).
export function addFlag(scene, x, y) {
  if (!scene.anims.exists('getaway-flag-wave')) {
    scene.anims.create({ key: 'getaway-flag-wave', frames: flagFrames(scene), frameRate: 8, repeat: -1 });
  }
  return scene.add.sprite(x, y, flagKey(scene)).setOrigin(0, 1).play('getaway-flag-wave');
}

// Keyboard just calls the same InputActions the touch buttons do. Space is
// "jump" where there is nothing to shoot (level 1) and "shoot" elsewhere.
export function bindKeyboard(scene, actions, { spaceAction = 'jump' } = {}) {
  const kb = scene.input.keyboard;
  const once = (fn) => (event) => {
    if (!event.repeat) fn();
  };
  kb.on('keydown-RIGHT', once(() => actions.moveStart()));
  kb.on('keyup-RIGHT', () => actions.moveEnd());
  kb.on('keydown-LEFT', once(() => actions.moveLeftStart()));
  kb.on('keyup-LEFT', () => actions.moveLeftEnd());
  kb.on('keydown-UP', once(() => actions.jump()));
  kb.on('keydown-SPACE', once(() => actions[spaceAction]()));
}

// Level title (gold) with an optional second line under it, plus the corner
// toggles. Returns the second line so the scene can update it (coin count).
export function addLevelHud(scene, title, subtitle = '') {
  const { width } = scene.scale;
  const titleText = scene.add
    .text(width / 2, 44, title, { fontFamily: FONTS.heading, fontSize: '14px', color: CSS_COLORS.gold })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(900);
  fitTopTitle(scene, titleText);

  const subText = scene.add
    .text(width / 2, 74, subtitle, {
      fontFamily: FONTS.body,
      fontSize: '16px',
      fontStyle: 'bold',
      color: CSS_COLORS.cyan,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(900);
  fitWidth(subText, width - 24);

  addMuteToggle(scene);
  addLangToggle(scene);
  return subText;
}

export function fitWidth(textObj, maxWidth) {
  textObj.setScale(1);
  if (textObj.width > maxWidth) textObj.setScale(maxWidth / textObj.width);
  return textObj;
}

// The outlined button + keyboard (Enter/Space) + full-width touch button that
// every between-levels screen ends with. All three call the same action.
// Where the touch bar is showing (phones), its button is the only one: the
// on-canvas button would just be a second copy of it right above.
export function addContinueButton(scene, y, label, touchLabel, onPress) {
  const { width } = scene.scale;
  const actions = new InputActions();
  actions.on('mash', onPress);
  if (!touchControls.isVisible()) {
    const text = scene.add
      .text(width / 2, y, label, { fontFamily: FONTS.heading, fontSize: '12px', color: CSS_COLORS.cyan })
      .setOrigin(0.5)
      .setDepth(1);
    fitWidth(text, width - 72);
    scene.add
      .rectangle(width / 2, y, text.displayWidth + 40, 50, COLORS.background)
      .setStrokeStyle(4, COLORS.cyan)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => actions.mash());
  }
  scene.input.keyboard.on('keydown-ENTER', () => actions.mash());
  scene.input.keyboard.on('keydown-SPACE', (event) => !event.repeat && actions.mash());
  touchControls.bind(actions, { actionLabel: touchLabel, actionConfirm: true });
  scene.events.once('shutdown', () => touchControls.unbind());
}

// A burst of square pixel debris flying out from (x, y), with a white flash
// at its centre. Used when a monster or the saucer is destroyed.
export function explode(scene, x, y, { colors = [COLORS.offWhite], count = 18, size = 8, spread = 90 } = {}) {
  sfx.explode();
  const flash = scene.add.rectangle(x, y, size * 4, size * 4, COLORS.offWhite).setDepth(800);
  scene.tweens.add({ targets: flash, scale: 2.2, alpha: 0, duration: 180, onComplete: () => flash.destroy() });

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = spread * (0.35 + Math.random() * 0.65);
    const bit = scene.add
      .rectangle(x, y, size, size, colors[i % colors.length])
      .setScale(0.5 + Math.random() * 0.8)
      .setDepth(800);
    scene.tweens.add({
      targets: bit,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      angle: 180 * (Math.random() - 0.5),
      alpha: 0,
      duration: 350 + Math.random() * 300,
      ease: 'Cubic.easeOut',
      onComplete: () => bit.destroy(),
    });
  }
}

// Every death in the game ends up here: a beat to register what happened,
// then the black "YOU'RE DEAD" screen, which retries the level named in `from`.
export function die(scene, extra = {}) {
  if (scene.isOver) return;
  scene.isOver = true;
  sfx.die();
  scene.physics.pause();
  scene.cameras.main.shake(250, 0.012);
  scene.time.delayedCall(450, () => {
    scene.scene.start('GameOver', { from: scene.scene.key, char: scene.char, ...extra });
  });
}
