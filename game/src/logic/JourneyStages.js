// Ordered stage list driving Level2's internal machine (one continuous shared
// scene, not six separate Scene classes — see GAME_SPEC.md §6 Level 2).

export const JOURNEY_STAGES = [
  { id: 'car', type: 'advance', label: 'LUCY' },
  { id: 'tent', type: 'meter', label: 'CAMPING' },
  { id: 'plane', type: 'advance', label: 'TRAVELING THE WORLD' },
  { id: 'island', type: 'meter', label: 'ISLAND LIFE' },
  { id: 'campervan', type: 'advance', label: 'ADVENTURES WITH THOR' },
  { id: 'house', type: 'boss-handoff', label: 'HOUSE' },
];

export function stageIndexById(id) {
  return JOURNEY_STAGES.findIndex((s) => s.id === id);
}

export function nextStage(currentId) {
  const idx = stageIndexById(currentId);
  if (idx === -1 || idx + 1 >= JOURNEY_STAGES.length) return null;
  return JOURNEY_STAGES[idx + 1];
}
