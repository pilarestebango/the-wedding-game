// ?scene= slug <-> Phaser scene key table for this game (same debug
// convention as game/src/config/sceneRegistry.js). `data` is merged into the
// scene's start data, for scenes that serve more than one slug.

export const SCENES = [
  { slug: 'boot', key: 'Boot' },
  { slug: 'intro', key: 'Intro' },
  { slug: 'char-select', key: 'Select' },
  { slug: 'level1-intro', key: 'LevelIntro', data: { level: 'level1' } },
  { slug: 'level1', key: 'Level1Coins' },
  { slug: 'talk-date', key: 'Conversation', data: { step: 'date' } },
  { slug: 'level2-intro', key: 'LevelIntro', data: { level: 'level2' } },
  { slug: 'level2', key: 'Level2Mars' },
  { slug: 'talk-location', key: 'Conversation', data: { step: 'location' } },
  { slug: 'boss-intro', key: 'LevelIntro', data: { level: 'boss' } },
  { slug: 'boss', key: 'Boss' },
  { slug: 'talk-full', key: 'Conversation', data: { step: 'full' } },
  { slug: 'game-over', key: 'GameOver' },
  { slug: 'finale', key: 'Finale' },
];

export function entryForSlug(slug) {
  return SCENES.find((s) => s.slug === slug) ?? null;
}

export function keyForSlug(slug) {
  return entryForSlug(slug)?.key ?? null;
}
