// Ordered stage list driving Level2's internal machine (one continuous shared
// scene, not six separate Scene classes — see GAME_SPEC.md §6 Level 2).

// `labelKey` looks up the actual display text in config/i18n.js (t()) at the
// point of use, so it stays correct across a language toggle.
export const JOURNEY_STAGES = [
  { id: 'car', type: 'advance', labelKey: 'journeyStageCar' },
  { id: 'tent', type: 'meter', labelKey: 'journeyStageTent' },
  { id: 'plane', type: 'advance', labelKey: 'journeyStagePlane' },
  { id: 'island', type: 'meter', labelKey: 'journeyStageIsland' },
  { id: 'campervan', type: 'advance', labelKey: 'journeyStageCampervan' },
  { id: 'house', type: 'boss-handoff', labelKey: 'journeyStageHouse' },
];

export function stageIndexById(id) {
  return JOURNEY_STAGES.findIndex((s) => s.id === id);
}

export function nextStage(currentId) {
  const idx = stageIndexById(currentId);
  if (idx === -1 || idx + 1 >= JOURNEY_STAGES.length) return null;
  return JOURNEY_STAGES[idx + 1];
}
