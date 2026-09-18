// Shared EN/ES copy for every scene, plus the current-language singleton.
// Language choice is persisted under the SAME localStorage key the wedding
// site's toggle uses (see /index.html's `LANG_KEY`) — localStorage is scoped
// per-origin, not per-path, so a choice made on the site or in the game
// carries over to the other automatically.
const LANG_KEY = 'wedding-lang';

const STRINGS = {
  en: {
    charSelectTitle: 'PILAR VS JOE',
    charSelectSubtitle: 'CHOOSE YOUR PLAYER',
    charSelectHint: 'TAP A CHARACTER TO BEGIN',
    loading: 'LOADING... {pct}%',

    level1Title: 'LEVEL 1 — SINGLE LIFE',

    firstDateTitle: 'THE FIRST DATE',
    loopLabel: 'LOOP {n} / {total}',
    talkLabel: 'TALK',
    readyLabel: 'READY!',
    meterDrinkLabel: 'DRINK',
    firstDateIntro: "Pilar and Joe are sitting at a bar.\nIt's going... surprisingly well?\nTime to seal the deal.",
    firstDateDrinkLabel: 'DRINK!',
    firstDateTalkLabel: 'TALK!',
    firstDateWinText: "Congratulations — they're in love!",

    level2Title: 'LEVEL 2 — THE JOURNEY',
    journeyStageCar: 'LUCY',
    journeyStageTent: 'CAMPING',
    journeyStagePlane: 'TRAVELING THE WORLD',
    journeyStageIsland: 'ISLAND LIFE',
    journeyStageCampervan: 'ADVENTURES WITH THOR',
    journeyStageHouse: 'HOUSE',
    hintDrive: 'HOLD RIGHT / D-PAD TO DRIVE',
    hintMash: 'MASH SPACE / GO! TO CONTINUE',
    goLabel: 'GO!',
    meterProgressLabel: 'PROGRESS',

    houseBossTitle: 'BUYING THE HOUSE',
    forSaleLabel: 'FOR SALE',
    soldLabel: 'SOLD!',
    coinsLabel: 'COINS: {count} / {target}',
    houseBossIntro:
      'A car. A tent. A plane. An island. A camper van.\nTurns out none of those count as "a fixed address."\nTime to become responsible adults. Briefly.',
    houseBossPayLabel: 'PAY!',
    houseBossWinText: 'SOLD! Welcome home.',

    theWaitTitle: 'THE WAIT',
    waitHint: "You don't have to do anything except wait\n(tap SPACE or the arrows to make her strike a new dance pose!)",
    danceLabel: 'DANCE!',

    level3RingsTitle: 'LEVEL 3 — GETTING THE RING',
    ringLabel: 'RING: {count} / {total}',

    finalBossIntroPili: 'Pilar waited. And waited.\nWorth it.',
    finalBossIntroJoe: "Joe got the ring.\nHe's not stalling anymore.",
    finalBossProposeLabel: 'PROPOSE!',
    finalBossQuestion: 'WILL YOU MARRY ME?',
    finalBossWrongAnswer: 'ERROR: TRY AGAIN',
    finalBossYesText: 'YES!!!',
    theProposalTitle: 'THE PROPOSAL',
    kneelLabel: 'KNEEL',
    yesChoice: 'YES',
    noChoice: 'NO',

    youreInvited: "YOU'RE INVITED",
    gettingMarried: 'PILAR & JOE ARE GETTING MARRIED',
    rsvpNow: 'RSVP NOW',
    rsvpComingSoon: 'RSVP details coming soon',
    playAgain: '[ PLAY AGAIN ]',

    sfxOn: 'SFX ON',
    sfxOff: 'SFX OFF',
    jumpLabel: 'JUMP',
  },
  es: {
    charSelectTitle: 'PILAR VS JOE',
    charSelectSubtitle: 'ELIGE A TU JUGADOR',
    charSelectHint: 'TOCA A UN PERSONAJE PARA EMPEZAR',
    loading: 'CARGANDO... {pct}%',

    level1Title: 'NIVEL 1 — SOLTERÍA',

    firstDateTitle: 'LA PRIMERA CITA',
    loopLabel: 'RONDA {n} / {total}',
    talkLabel: 'HABLAR',
    readyLabel: '¡LISTOS!',
    meterDrinkLabel: 'BEBIDA',
    firstDateIntro: 'Pilar y Joe están sentados en un bar.\n¿Va... sorprendentemente bien?\nHora de sellar el trato.',
    firstDateDrinkLabel: '¡BEBE!',
    firstDateTalkLabel: '¡HABLA!',
    firstDateWinText: '¡Enhorabuena — están enamorados!',

    level2Title: 'NIVEL 2 — EL VIAJE',
    journeyStageCar: 'LUCY',
    journeyStageTent: 'CAMPING',
    journeyStagePlane: 'A RECORRER EL MUNDO',
    journeyStageIsland: 'VIDA ISLEÑA',
    journeyStageCampervan: 'AVENTURAS CON THOR',
    journeyStageHouse: 'CASA',
    hintDrive: 'MANTÉN DERECHA / D-PAD PARA CONDUCIR',
    hintMash: 'PULSA ESPACIO / ¡DALE! PARA CONTINUAR',
    goLabel: '¡DALE!',
    meterProgressLabel: 'PROGRESO',

    houseBossTitle: 'COMPRANDO LA CASA',
    forSaleLabel: 'SE VENDE',
    soldLabel: '¡VENDIDO!',
    coinsLabel: 'MONEDAS: {count} / {target}',
    houseBossIntro:
      'Un coche. Una tienda de campaña. Un avión. Una isla. Una autocaravana.\nResulta que nada de eso cuenta como "domicilio fijo".\nHora de ser adultos responsables. Brevemente.',
    houseBossPayLabel: '¡PAGA!',
    houseBossWinText: '¡VENDIDO! Bienvenidos a casa.',

    theWaitTitle: 'LA ESPERA',
    waitHint: 'No tienes que hacer nada, solo esperar\n(¡toca ESPACIO o las flechas para que haga un paso de baile nuevo!)',
    danceLabel: '¡BAILA!',

    level3RingsTitle: 'NIVEL 3 — A POR EL ANILLO',
    ringLabel: 'ANILLOS: {count} / {total}',

    finalBossIntroPili: 'Pilar esperó. Y esperó.\nMereció la pena.',
    finalBossIntroJoe: 'Joe consiguió el anillo.\nYa no tiene excusas.',
    finalBossProposeLabel: '¡PÍDESELO!',
    finalBossQuestion: '¿TE CASAS CONMIGO?',
    finalBossWrongAnswer: 'ERROR: INTÉNTALO DE NUEVO',
    finalBossYesText: '¡SÍ!!!',
    theProposalTitle: 'LA PROPUESTA',
    kneelLabel: 'DE RODILLAS',
    yesChoice: 'SÍ',
    noChoice: 'NO',

    youreInvited: 'LA INVITACIÓN',
    gettingMarried: 'PILAR Y JOE SE CASAN',
    rsvpNow: 'CONFIRMA YA',
    rsvpComingSoon: 'Los detalles para confirmar, muy pronto',
    playAgain: '[ JUGAR DE NUEVO ]',

    sfxOn: 'SFX SÍ',
    sfxOff: 'SFX NO',
    jumpLabel: 'SALTAR',
  },
};

function readStoredLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'es') return v;
  } catch (e) {
    // localStorage unavailable (private mode etc.) — fall back below.
  }
  return null;
}

let currentLang = readStoredLang() ?? 'en';
const listeners = new Set();

function applyDocumentLang() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }
}
applyDocumentLang();

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (lang !== 'en' && lang !== 'es') return;
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    // ignore — nothing to persist to, language just won't survive reload
  }
  applyDocumentLang();
  listeners.forEach((fn) => fn(currentLang));
}

export function toggleLang() {
  setLang(currentLang === 'en' ? 'es' : 'en');
  return currentLang;
}

// Called once by main.js with a function that restarts the active scene(s)
// so every Phaser Text object re-reads t() with the new language.
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, vars) {
  const dict = STRINGS[currentLang] ?? STRINGS.en;
  let str = dict[key] ?? STRINGS.en[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.split(`{${k}}`).join(v);
    });
  }
  return str;
}
