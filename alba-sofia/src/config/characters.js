// Who is in this game. The guest plays Sofia or Alba (sprites and portraits
// in ../assets/, cut from the pictures in reference/alba-sofia/); Pili and Joe
// are the hosts waiting at the end of each level, and their art is borrowed
// from PILAR vs JOE (../game/assets/).
//
// PILAR vs JOE's own gameState only knows 'pili' and 'joe', so which of the
// two the guest picked is kept here instead.

export const PLAYERS = ['sofia', 'alba'];
export const HOSTS = ['pili', 'joe'];
const POSES = ['idle', 'run-0', 'run-1', 'jump'];

export function charKey(char, pose) {
  return `${char}-${pose}`;
}

export function runFrameKeys(char) {
  return [charKey(char, 'run-0'), charKey(char, 'run-1')];
}

export function portraitKey(char) {
  return `${char}-portrait`;
}

let picked = null;

export function setPlayer(char) {
  if (PLAYERS.includes(char)) picked = char;
}

export function getPlayer() {
  return picked ?? PLAYERS[0];
}

// Every character image, with its path relative to this game's index.html.
export const CHARACTER_MANIFEST = [
  ...PLAYERS.flatMap((char) => [
    ...POSES.map((pose) => ({ key: charKey(char, pose), path: `assets/${char}-${pose}.png` })),
    { key: portraitKey(char), path: `assets/${char}-portrait.webp` },
  ]),
  ...HOSTS.flatMap((char) => [
    { key: charKey(char, 'idle'), path: `../game/assets/sprites/characters/${char}-idle.png` },
    { key: portraitKey(char), path: `../game/assets/illustrations/${char}-portrait.png` },
  ]),
];
