// This game opens in Spanish, whatever language the rest of the site is in,
// and remembers its own choice under its own key. The shared i18n module
// (game/src/config/i18n.js) only knows the site-wide `wedding-lang` key and
// writes to it on every change, so each time the language is set here the
// site's value is put back: toggling EN/ES in this game never changes the
// language of the site, PILAR vs JOE or THE GETAWAY, and theirs never changes
// this one.
import { setLang, onLangChange } from '../shared.js';

const SITE_KEY = 'wedding-lang';
const OWN_KEY = 'alba-sofia-lang';
const DEFAULT_LANG = 'es';

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null; // localStorage unavailable (private mode etc.)
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (e) {
    // ignore — nothing to persist to, the choice just won't survive a reload
  }
}

const siteLang = read(SITE_KEY);
const stored = read(OWN_KEY);

onLangChange((lang) => {
  write(OWN_KEY, lang);
  write(SITE_KEY, siteLang);
});

setLang(stored === 'en' || stored === 'es' ? stored : DEFAULT_LANG);
write(SITE_KEY, siteLang);
