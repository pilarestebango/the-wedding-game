// Everything ALBA & SOFIA ADVENTURE borrows from PILAR vs JOE (../game/), in one
// place — both games are plain ES modules served from the same site, so this
// is a straight import, nothing is copied. If a module moves in game/src/,
// this is the only file here that needs to follow it.
export { COLORS, CSS_COLORS, PROP_COLORS, FONTS, TITLE_SHADOW } from '../../game/src/config/palette.js';
export { makeTexture } from '../../game/src/config/pixelArt.js';
export { t, registerStrings, onLangChange, getLang, setLang } from '../../game/src/config/i18n.js';
export { sfx } from '../../game/src/config/sfx.js';
export { InputActions } from '../../game/src/logic/InputActions.js';
export { FrameAnimator } from '../../game/src/logic/FrameAnimator.js';
export { touchControls } from '../../game/src/ui/touchControlsInstance.js';
export { addMuteToggle } from '../../game/src/ui/muteToggle.js';
export { addLangToggle } from '../../game/src/ui/langToggle.js';
export { fitTopTitle } from '../../game/src/ui/fitTopTitle.js';
export { fadeToScene } from '../../game/src/ui/transitions.js';

// Where PILAR vs JOE's own images are, from this game's index.html.
export const GAME_ASSET_ROOT = '../game/';
