// Centralizes the one pili/joe -> Level 3 scene decision, so it's not scattered
// as ad-hoc `if (char === ...)` checks across scenes.

export function resolveLevel3Scene(char) {
  return char === 'joe' ? 'Level3Rings' : 'Level3Wait';
}

export function resolveLevel3Slug(char) {
  return char === 'joe' ? 'level3-rings' : 'level3-wait';
}
