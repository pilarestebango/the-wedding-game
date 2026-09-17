// The one mutable runtime singleton: which character the player picked, and
// whether audio is muted. Scenes read/write this instead of passing character
// through every single scene transition by hand.

const state = {
  character: null,
  muted: false,
};

export const gameState = {
  setCharacter(c) {
    if (c === 'pili' || c === 'joe') state.character = c;
  },
  getCharacter() {
    return state.character ?? 'pili';
  },
  get muted() {
    return state.muted;
  },
  toggleMuted() {
    state.muted = !state.muted;
    return state.muted;
  },
  setMuted(v) {
    state.muted = !!v;
  },
};
