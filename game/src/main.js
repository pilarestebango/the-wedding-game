// Phaser config + scene list (CLAUDE.md project structure). Loaded as an ES
// module from index.html; Phaser itself comes from the CDN <script> tag.

import { BootScene } from './scenes/BootScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { Level1DatingRaceScene } from './scenes/Level1DatingRaceScene.js';
import { Level1BossScene } from './scenes/Level1BossScene.js';
import { Level2JourneyScene } from './scenes/Level2JourneyScene.js';
import { Level2BossScene } from './scenes/Level2BossScene.js';
import { Level3WaitScene } from './scenes/Level3WaitScene.js';
import { Level3RingsScene } from './scenes/Level3RingsScene.js';
import { FinalBossScene } from './scenes/FinalBossScene.js';
import { EndingScene } from './scenes/EndingScene.js';
import { COLORS } from './config/palette.js';
import { LEVEL1 } from './config/tuning.js';
import { onLangChange } from './config/i18n.js';

// The game fills whatever box #game-root ends up with — a phone in portrait,
// a phone in landscape, or a desktop window — rather than a fixed 960x540
// letterboxed into the middle of the screen. Scale.RESIZE makes Phaser track
// #game-root's actual size (which already excludes the docked touch-control
// bar below it, see index.html/TouchControls.js) instead of a fixed logical
// resolution. Read that box up front so the first frame is already correctly
// sized instead of flashing a default size.
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
      gravity: { y: LEVEL1.gravityY },
      debug: false,
    },
  },
  scene: [
    BootScene,
    CharacterSelectScene,
    Level1DatingRaceScene,
    Level1BossScene,
    Level2JourneyScene,
    Level2BossScene,
    Level3WaitScene,
    Level3RingsScene,
    FinalBossScene,
    EndingScene,
  ],
};

// Scene layout (camera/world bounds, background texture height, one-off
// element positions) is computed once in each scene's create() from
// this.scale.width/height — cheap and correct at boot, but stale if the
// device is rotated mid-scene. Rather than teaching every scene to re-layout
// live on a `resize` event, just restart the active scene(s) when the
// orientation category actually flips (portrait <-> landscape); Phaser's
// RESIZE mode keeps the canvas itself tracking #game-root continuously
// either way, so small viewport wobbles (e.g. a mobile URL bar hiding) never
// trigger a restart — only a genuine rotation does.
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
    // Debounce: a physical rotation fires several resize events in quick
    // succession as the browser chrome/viewport settles.
    clearTimeout(pending);
    pending = setTimeout(() => restartActiveScenes(game), 150);
  });
}

// Canvas text bakes in whatever font is available the instant it's drawn —
// unlike DOM text it does NOT reflow once a lazy-loaded webfont finishes
// downloading. Force both Google Fonts to load before the game boots so no
// scene's Phaser Text objects ever render in a fallback font.
function boot() {
  const game = new Phaser.Game(config);
  watchOrientation(game);
  // Every scene reads its copy from t() (config/i18n.js) fresh in create(),
  // so flipping the language just needs the same "restart the active
  // scene(s)" trick used above for orientation changes — no per-scene
  // text-update wiring required.
  onLangChange(() => restartActiveScenes(game));
}

const fontsReady = Promise.all([
  document.fonts.load('16px "Press Start 2P"'),
  document.fonts.load('16px "JetBrains Mono"'),
]);
const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
Promise.race([fontsReady, timeout]).then(boot, boot);
