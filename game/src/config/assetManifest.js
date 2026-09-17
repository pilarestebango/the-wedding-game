// Preload lists loaded once in BootScene.preload().
import { CHARACTER_MANIFEST } from './characterSprites.js';
import { PROP_MANIFEST } from './props.js';

// The couple's existing illustrations, copied into assets/illustrations/.
export const ILLUSTRATIONS = [
  { key: 'pili-portrait', path: 'assets/illustrations/pili-portrait.png' },
  { key: 'joe-portrait', path: 'assets/illustrations/joe-portrait.png' },
  { key: 'pili-wedding', path: 'assets/illustrations/pili-wedding.png' },
  { key: 'joe-wedding', path: 'assets/illustrations/joe-wedding.png' },
  { key: 'pose-happy', path: 'assets/illustrations/pose-happy.png' },
  { key: 'pose-invincible', path: 'assets/illustrations/pose-invincible.png' },
  { key: 'pose-proposal', path: 'assets/illustrations/pose-proposal.png' },
  { key: 'pose-wedding', path: 'assets/illustrations/pose-wedding.png' },
  { key: 'house-illustration', path: 'assets/illustrations/house.png' },
];

// Character sprite frames + gameplay props/obstacles/set-pieces, cropped from
// the couple-approved reference sheets (see src/config/props.js and
// src/config/characterSprites.js).
export const SPRITES = [...CHARACTER_MANIFEST, ...PROP_MANIFEST];
