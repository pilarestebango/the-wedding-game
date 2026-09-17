// Boss intro/label copy, sourced from the EN/ES dictionary in i18n.js so it
// switches with the shared language toggle. Kept as this thin function layer
// (same exported names as before, now callable) so scene files barely change.
import { t } from './i18n.js';

export const FIRST_DATE_INTRO = () => t('firstDateIntro').split('\n');
export const FIRST_DATE_DRINK_LABEL = () => t('firstDateDrinkLabel');
export const FIRST_DATE_TALK_LABEL = () => t('firstDateTalkLabel');
export const FIRST_DATE_WIN_TEXT = () => t('firstDateWinText');

export const HOUSE_BOSS_INTRO = () => t('houseBossIntro').split('\n');
export const HOUSE_BOSS_PAY_LABEL = () => t('houseBossPayLabel');
export const HOUSE_BOSS_WIN_TEXT = () => t('houseBossWinText');

// Text shown depends on which Level 3 branch the player just came from, which
// is determined by the starting character (see CharacterBranch.js): choosing
// Pili plays "The Wait", choosing Joe plays "Getting the Ring".
export const FINAL_BOSS_INTRO_PILI = () => t('finalBossIntroPili').split('\n');
export const FINAL_BOSS_INTRO_JOE = () => t('finalBossIntroJoe').split('\n');
export const FINAL_BOSS_PROPOSE_LABEL = () => t('finalBossProposeLabel');
export const FINAL_BOSS_QUESTION = () => t('finalBossQuestion');
export const FINAL_BOSS_WRONG_ANSWER = () => t('finalBossWrongAnswer');
export const FINAL_BOSS_YES_TEXT = () => t('finalBossYesText');
