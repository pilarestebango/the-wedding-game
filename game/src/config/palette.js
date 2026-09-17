// Color/font tokens pulled from the couple's wedding site (Arcade Wedding.dc.html).
// Never hardcode hex values outside this file — import these constants instead.

export const COLORS = {
  background: 0x120b2e,
  cyan: 0x00e5ff,
  gold: 0xffd400,
  red: 0xe5341f,
  mutedPurple: 0x7a6fb0,
  offWhite: 0xf2f2f2,
};

// CSS-string versions of the same tokens, for DOM/CSS use (TouchControls, HTML overlays).
export const CSS_COLORS = {
  background: '#120B2E',
  cyan: '#00E5FF',
  gold: '#FFD400',
  red: '#E5341F',
  mutedPurple: '#7a6fb0',
  offWhite: '#F2F2F2',
};

// Supplementary material tones for the procedurally-drawn backgrounds (sky,
// ground, ocean) that the 6 core UI tokens above don't cover. Centralized here
// so backgrounds.js never hardcodes raw hex either.
export const PROP_COLORS = {
  brown: 0x6b4423,
  sea: 0x1c7fa0,
  sky: 0x241a4d,
  skyLight: 0x3a2a6d,
  pigPink: 0xf3a6c9,
  pigPinkDark: 0xd9789f,
};

export const FONTS = {
  heading: '"Press Start 2P"',
  body: '"JetBrains Mono"',
};

export const TITLE_SHADOW = {
  offsetX: 6,
  offsetY: 6,
  color: CSS_COLORS.red,
  blur: 0,
};
