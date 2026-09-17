// Fixed 7-obstacle order per character (GAME_SPEC.md §6, Level 1). Fixed, not
// random, so the level is testable and repeatable.

export const PILI_OBSTACLES = ['beer', 'kangaroo', 'beer', 'kangaroo', 'beer', 'kangaroo', 'beer'];
export const JOE_OBSTACLES = ['book', 'mountain', 'book', 'mountain', 'book', 'mountain', 'book'];

export function getObstacleSequence(char) {
  return char === 'joe' ? JOE_OBSTACLES : PILI_OBSTACLES;
}

export function buildObstacleLayout(seq, { spacingPx = 480, startX = 700 } = {}) {
  return seq.map((type, i) => ({
    type,
    x: startX + i * spacingPx,
    cleared: false,
  }));
}
