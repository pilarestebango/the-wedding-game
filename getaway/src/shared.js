// Everything the getaway game borrows from PILAR vs JOE (../game/), in one
// place — both games are plain ES modules served from the same site, so this
// is a straight import, nothing is copied. If a module moves in game/src/,
// this is the only file here that needs to follow it.
export { COLORS, CSS_COLORS, PROP_COLORS, FONTS, TITLE_SHADOW } from '../../game/src/config/palette.js';
export { makeTexture } from '../../game/src/config/pixelArt.js';
export { textureKeyFor as charKey, runFrameKeys, CHARACTER_MANIFEST } from '../../game/src/config/characterSprites.js';
export { t, registerStrings, onLangChange, getLang } from '../../game/src/config/i18n.js';
export { sfx } from '../../game/src/config/sfx.js';
export { gameState } from '../../game/src/state/gameState.js';
export { InputActions } from '../../game/src/logic/InputActions.js';
export { FrameAnimator } from '../../game/src/logic/FrameAnimator.js';
export { CharacterSelectScene } from '../../game/src/scenes/CharacterSelectScene.js';
export { touchControls } from '../../game/src/ui/touchControlsInstance.js';
export { addMuteToggle } from '../../game/src/ui/muteToggle.js';
export { addLangToggle } from '../../game/src/ui/langToggle.js';
export { addExitLink } from '../../game/src/ui/exitLink.js';
export { fitTopTitle } from '../../game/src/ui/fitTopTitle.js';
export { fadeToScene } from '../../game/src/ui/transitions.js';

// Sprite paths in the shared manifests are relative to game/index.html, so
// this game's loader is pointed there (see BootScene).
export const GAME_ASSET_ROOT = '../game/';
