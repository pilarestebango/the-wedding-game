// DRAFT joke/intro copy for the First Date and House-buying boss scenes.
// GAME_SPEC.md §8 flagged this text as unwritten ("who's writing these?").
// This is placeholder copy the user asked me to draft — please read and
// rewrite freely before treating the game as finished; nothing here is final.

export const FIRST_DATE_INTRO = [
  'Pilar and Joe are sitting at a bar.',
  "It's going... surprisingly well?",
  'Time to seal the deal.',
];

export const FIRST_DATE_DRINK_LABEL = 'DRINK!';
export const FIRST_DATE_TALK_LABEL = 'TALK!';
export const FIRST_DATE_WIN_TEXT = "Congratulations — they're in love!";

export const HOUSE_BOSS_INTRO = [
  'A car. A tent. A plane. An island. A camper van.',
  'Turns out none of those count as "a fixed address."',
  'Time to become responsible adults. Briefly.',
];

export const HOUSE_BOSS_PAY_LABEL = 'PAY!';
export const HOUSE_BOSS_WIN_TEXT = 'SOLD! Welcome home.';

// Text shown depends on which Level 3 branch the player just came from, which
// is determined by the starting character (see CharacterBranch.js): choosing
// Pili plays "The Wait", choosing Joe plays "Getting the Ring".
export const FINAL_BOSS_INTRO_PILI = ['Pilar waited. And waited.', 'Worth it.'];
export const FINAL_BOSS_INTRO_JOE = ['Joe got the ring.', "He's not stalling anymore."];
export const FINAL_BOSS_PROPOSE_LABEL = 'PROPOSE!';
export const FINAL_BOSS_QUESTION = 'WILL YOU MARRY ME?';
export const FINAL_BOSS_WRONG_ANSWER = 'ERROR: TRY AGAIN';
export const FINAL_BOSS_YES_TEXT = 'YES!!!';
