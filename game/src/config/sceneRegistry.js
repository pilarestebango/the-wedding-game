// ?scene= slug <-> Phaser scene key table. This is the single source of truth
// for valid debug-jump slugs (see GAME_SPEC.md §2/§9 and CLAUDE.md "Testing / debug conventions").

export const SCENES = [
  { slug: 'boot', key: 'Boot' },
  { slug: 'char-select', key: 'CharacterSelect' },
  { slug: 'level1', key: 'Level1DatingRace' },
  { slug: 'level1-boss', key: 'Level1Boss' },
  { slug: 'level2', key: 'Level2Journey' },
  { slug: 'level2-boss', key: 'Level2Boss' },
  { slug: 'level3-wait', key: 'Level3Wait' },
  { slug: 'level3-rings', key: 'Level3Rings' },
  { slug: 'final-boss', key: 'FinalBossProposal' },
  { slug: 'ending', key: 'Ending' },
];

export function keyForSlug(slug) {
  const match = SCENES.find((s) => s.slug === slug);
  return match ? match.key : null;
}

export function slugForKey(key) {
  const match = SCENES.find((s) => s.key === key);
  return match ? match.slug : null;
}
