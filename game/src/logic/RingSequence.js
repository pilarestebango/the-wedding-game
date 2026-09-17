// Ring positions for Joe's Level 3 branch ("Getting the Ring") — same shape
// as ObstacleSequence but collectibles rather than avoid-obstacles. Joe
// collects a set of rings (default 7, see RINGS.count in tuning.js) along
// the track.

export function buildRingLayout({ count = 1, spacing = 420, startX = 600 } = {}) {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    x: startX + i * spacing,
    collected: false,
  }));
}
