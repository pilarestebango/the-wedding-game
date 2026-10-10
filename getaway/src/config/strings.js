// EN/ES copy for the getaway game, merged into the shared t() dictionary
// (game/src/config/i18n.js) at import time — main.js imports this first.
//
// The heading font (Press Start 2P) has no arrow glyphs or en dash, so the
// canvas copy sticks to plain ASCII punctuation ("13-18", ">").
import { registerStrings } from '../shared.js';

registerStrings({
  en: {
    getawayTitle: 'THE GETAWAY',

    introTitle: 'CONGRATS!',
    introText: "YOU'VE BEEN CHOSEN",
    introAccept: 'ACCEPT THE CHALLENGE',

    startLabel: 'START',
    spaceGoals: 'COLLECT {target} COINS\nREACH THE PIRATE FLAG\nFALL AND YOU DIE',
    marsGoals: 'CROSS THE LAVA ON THE PLATFORMS\nJUMP THE BLUE MONSTERS - SHOOT ONE AND IT SPLITS IN TWO\nSHOOT THE BIG ONES - THE LAST ONE SHOOTS BACK\nTOUCH ONE OR FALL AND YOU DIE',
    bossGoals: 'SHOOT DOWN THE WARSHIP\nDODGE ITS SHOTS\nYOU HAVE {hearts} HEARTS',

    spaceTitle: 'LEVEL 1 - SPACE',
    coinsHud: 'COINS {count} / {target}',

    marsTitle: 'LEVEL 2 - MARS WASTELANDS',
    marsHint: "JUMP THE BLUE ONES, DON'T SHOOT THEM. SHOOT THE BIG ONES.",

    bossTitle: 'BIG MESSY BOSS',
    bossHint: 'DODGE AND SHOOT UP!',

    talkContinue: 'TAP OR PRESS ENTER',
    rewardDateLabel: 'DATE UNLOCKED',
    rewardDateMonth: 'SEPTEMBER',
    rewardDateValue: '13-18 SEPTEMBER 2027',
    rewardDateNext: 'LEARN MORE > NEXT LEVEL',
    rewardLocationLabel: 'LOCATION UNLOCKED',
    rewardLocationValue: 'ROBLEDO DE CHAVELA\nDIRECT TRAIN TO MADRID: 55 MIN',
    rewardLocationNext: 'LEARN MORE > FINAL BOSS',
    nextLabel: 'NEXT',

    deadTitle: "YOU'RE DEAD",
    deadNotEnoughCoins: 'NOT ENOUGH COINS: {count} / {target}',
    retry: 'RETRY',

    finaleTitle: "YOU'RE INVITED",
    finaleText: 'A WEEK IN THE MOUNTAINS WITH PILAR & JOE\n13-18 SEPTEMBER 2027',
    finaleDetails: 'FULL DETAILS >',
  },
  es: {
    getawayTitle: 'LA ESCAPADA',

    introTitle: '¡ENHORABUENA!',
    introText: 'TE HEMOS ELEGIDO',
    introAccept: 'ACEPTAR EL RETO',

    startLabel: 'EMPEZAR',
    spaceGoals: 'CONSIGUE {target} MONEDAS\nLLEGA A LA BANDERA PIRATA\nSI TE CAES, MUERES',
    marsGoals: 'CRUZA LA LAVA POR LAS PLATAFORMAS\nSALTA A LOS MONSTRUOS AZULES: SI LES DISPARAS, SE DUPLICAN\nDISPARA A LOS GRANDES: EL ÚLTIMO TAMBIÉN DISPARA\nSI TE TOCAN O TE CAES, MUERES',
    bossGoals: 'DERRIBA LA NAVE\nESQUIVA SUS DISPAROS\nTIENES {hearts} CORAZONES',

    spaceTitle: 'NIVEL 1 - EL ESPACIO',
    coinsHud: 'MONEDAS {count} / {target}',

    marsTitle: 'NIVEL 2 - LOS PÁRAMOS DE MARTE',
    marsHint: 'SALTA A LOS AZULES, NO LES DISPARES. DISPARA A LOS GRANDES.',

    bossTitle: 'EL GRAN JEFE',
    bossHint: '¡ESQUIVA Y DISPARA HACIA ARRIBA!',

    talkContinue: 'TOCA O PULSA ENTER',
    rewardDateLabel: 'FECHA DESBLOQUEADA',
    rewardDateMonth: 'SEPTIEMBRE',
    rewardDateValue: '13-18 DE SEPTIEMBRE DE 2027',
    rewardDateNext: 'SABER MÁS > SIGUIENTE NIVEL',
    rewardLocationLabel: 'LUGAR DESBLOQUEADO',
    rewardLocationValue: 'ROBLEDO DE CHAVELA\nTREN DIRECTO A MADRID: 55 MIN',
    rewardLocationNext: 'SABER MÁS > JEFE FINAL',
    nextLabel: 'SEGUIR',

    deadTitle: 'HAS MUERTO',
    deadNotEnoughCoins: 'FALTAN MONEDAS: {count} / {target}',
    retry: 'REINTENTAR',

    finaleTitle: 'LA INVITACIÓN',
    finaleText: 'UNA SEMANA EN LA SIERRA CON PILAR Y JOE\n13-18 DE SEPTIEMBRE DE 2027',
    finaleDetails: 'TODOS LOS DETALLES >',
  },
});
