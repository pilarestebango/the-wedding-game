// EN/ES copy for ALBA & SOFIA ADVENTURE, merged into the shared t() dictionary
// (game/src/config/i18n.js) at import time — main.js imports this first.
//
// The heading font (Press Start 2P) has no arrow glyphs or en dash, so the
// canvas copy sticks to plain ASCII punctuation ("13-18", ">").
import { registerStrings } from '../shared.js';

registerStrings({
  en: {
    gameTitle: 'ALBA & SOFIA ADVENTURE',

    introTitle: 'SOFIA & ALBA',
    introText: 'AN INTERGALACTIC ADVENTURE',
    introAccept: 'ACCEPT THE CHALLENGE',

    startLabel: 'START',
    spaceGoals: 'COLLECT {target} COINS\nREACH THE PIRATE FLAG\nFALL AND YOU DIE',
    marsGoals: 'CROSS THE LAVA\nJUMP THE BLUE MONSTERS\nSHOOT THE BIG ONES\nONE TOUCH AND YOU DIE',
    bossGoals: 'SHOOT DOWN THE WARSHIP\nDODGE ITS SHOTS\nYOU HAVE {hearts} HEARTS',

    spaceTitle: 'LEVEL 1 - SPACE',
    coinsHud: 'COINS {count} / {target}',

    marsTitle: 'LEVEL 2 - MARS WASTELANDS',
    marsHint: "JUMP THE BLUE ONES, DON'T SHOOT THEM. SHOOT THE BIG ONES.",

    bossTitle: 'BIG MESSY BOSS',
    bossHint: 'DODGE AND SHOOT UP!',

    talkContinue: 'TAP OR PRESS ENTER',
    levelClearTitle: 'LEVEL CLEARED',
    levelClearSpace: 'SPACE CONQUERED\nNEXT STOP: MARS',
    levelClearMars: 'MARS IS HISTORY\nNOW FOR THE BIG BOSS',
    levelClearNext: 'CONTINUE THE ADVENTURE',
    gameClearTitle: 'YOU DID IT',
    gameClearText: 'THE GALAXY IS SAFE\nTHANKS TO SOFIA & ALBA',
    gameClearNext: 'PLAY AGAIN',

    deadTitle: "YOU'RE DEAD",
    deadNotEnoughCoins: 'NOT ENOUGH COINS: {count} / {target}',
    retry: 'RETRY',

    finaleTitle: "YOU'RE INVITED",
    finaleText: 'A WEEK IN THE MOUNTAINS WITH PILAR & JOE\n13-18 SEPTEMBER 2027',
    finaleDetails: 'FULL DETAILS >',
  },
  es: {
    gameTitle: 'LA AVENTURA DE ALBA Y SOFIA',

    introTitle: 'SOFIA & ALBA',
    introText: 'UNA AVENTURA INTERGALÁCTICA',
    introAccept: 'ACEPTAR EL RETO',

    startLabel: 'EMPEZAR',
    spaceGoals: 'CONSIGUE {target} MONEDAS\nLLEGA A LA BANDERA PIRATA\nSI TE CAES, MUERES',
    marsGoals: 'CRUZA LA LAVA\nSALTA A LOS AZULES\nDISPARA A LOS GRANDES\nSI TE TOCAN, MUERES',
    bossGoals: 'DERRIBA LA NAVE\nESQUIVA SUS DISPAROS\nTIENES {hearts} CORAZONES',

    spaceTitle: 'NIVEL 1 - EL ESPACIO',
    coinsHud: 'MONEDAS {count} / {target}',

    marsTitle: 'NIVEL 2 - LOS PÁRAMOS DE MARTE',
    marsHint: 'SALTA A LOS AZULES, NO LES DISPARES. DISPARA A LOS GRANDES.',

    bossTitle: 'EL GRAN JEFE',
    bossHint: '¡ESQUIVA Y DISPARA HACIA ARRIBA!',

    talkContinue: 'TOCA O PULSA ENTER',
    levelClearTitle: 'NIVEL SUPERADO',
    levelClearSpace: 'ESPACIO CONQUISTADO\nPRÓXIMA PARADA: MARTE',
    levelClearMars: 'MARTE YA ES HISTORIA\nA POR EL GRAN JEFE',
    levelClearNext: 'CONTINUAR AVENTURA',
    gameClearTitle: 'LO HABÉIS CONSEGUIDO',
    gameClearText: 'LA GALAXIA ESTÁ A SALVO\nGRACIAS A SOFIA & ALBA',
    gameClearNext: 'JUGAR OTRA VEZ',

    deadTitle: 'HAS MUERTO',
    deadNotEnoughCoins: 'FALTAN MONEDAS: {count} / {target}',
    retry: 'REINTENTAR',

    finaleTitle: 'LA INVITACIÓN',
    finaleText: 'UNA SEMANA EN LA SIERRA CON PILAR Y JOE\n13-18 DE SEPTIEMBRE DE 2027',
    finaleDetails: 'TODOS LOS DETALLES >',
  },
});
