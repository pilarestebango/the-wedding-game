// ALBA & SOFIA ADVENTURE — Phaser config + scene list. Mirrors game/src/main.js (same
// fill-the-box sizing, same "restart the active scene" answer to a rotation
// or a language change); see that file for the reasoning behind each piece.
import './config/strings.js'; // registers this game's copy before any scene reads t()
import './config/lang.js'; // Spanish by default, with this game's own remembered choice
import { COLORS, onLangChange } from './shared.js';
import { PLAYER } from './config/tuning.js';
import { BootScene } from './scenes/BootScene.js';
import { IntroScene } from './scenes/IntroScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { LevelIntroScene } from './scenes/LevelIntroScene.js';
import { Level1CoinsScene } from './scenes/Level1CoinsScene.js';
import { ConversationScene } from './scenes/ConversationScene.js';
import { Level2MarsScene } from './scenes/Level2MarsScene.js';
import { BossScene } from './scenes/BossScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { FinaleScene } from './scenes/FinaleScene.js';

const gameRootEl = document.getElementById('game-root');

function measureGameRoot() {
  const rect = gameRootEl.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect.width) || window.innerWidth),
    height: Math.max(1, Math.round(rect.height) || window.innerHeight),
  };
}

const initialSize = measureGameRoot();

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: initialSize.width,
  height: initialSize.height,
  backgroundColor: COLORS.background,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: PLAYER.gravityY },
      debug: false,
    },
  },
  scene: [
    BootScene,
    IntroScene,
    SelectScene,
    LevelIntroScene,
    Level1CoinsScene,
    ConversationScene,
    Level2MarsScene,
    BossScene,
    GameOverScene,
    FinaleScene,
  ],
};

function isPortrait({ width, height }) {
  return height >= width;
}

function restartActiveScenes(game) {
  game.scene.getScenes(true).forEach((scene) => {
    if (scene.scene.key === 'Boot') return;
    scene.scene.restart(scene.scene.settings.data);
  });
}

function watchOrientation(game) {
  let lastPortrait = isPortrait(measureGameRoot());
  let pending = null;
  game.scale.on('resize', (gameSize) => {
    const nowPortrait = isPortrait(gameSize);
    if (nowPortrait === lastPortrait) return;
    lastPortrait = nowPortrait;
    clearTimeout(pending);
    pending = setTimeout(() => restartActiveScenes(game), 150);
  });
}

function boot() {
  const game = new Phaser.Game(config);
  watchOrientation(game);
  onLangChange(() => restartActiveScenes(game));
}

const fontsReady = Promise.all([
  document.fonts.load('16px "Press Start 2P"'),
  document.fonts.load('16px "JetBrains Mono"'),
]);
const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
Promise.race([fontsReady, timeout]).then(boot, boot);
