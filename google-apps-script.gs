// RSVP + Jukebox backend for Pilar & Joe's wedding site — runs on Google's
// infra, not ours, so the site can stay a static/no-backend build. One Apps
// Script project serves both rsvp/index.html and jukebox/index.html: they
// share a spreadsheet (RSVPs in its first tab, songs in a "Songs" tab,
// created on first use), and since a project can only have one doPost/doGet,
// doPost below routes between the two on the request shape (the jukebox
// always sends {action: 'add'|'remove', guestId, ...}; the RSVP form never
// does) and doGet is jukebox-only (song list + iOS Safari search proxy).
//
// Setup (one-time, ~5 minutes):
//   1. Create a new Google Sheet — this becomes the live RSVP+Songs
//      spreadsheet (Google Sheets, downloadable as .xlsx any time via
//      File > Download).
//   2. Extensions > Apps Script. Delete the placeholder code and paste this
//      whole file in. (Bound this way, SPREADSHEET_ID below can stay empty.
//      If you'd rather run it as a standalone project at script.google.com
//      instead, paste the spreadsheet's ID — the long string between /d/
//      and /edit in its URL — into SPREADSHEET_ID first.)
//   3. NOTIFY_EMAIL below already points at pilar.esteban@gmail.com — change
//      it if you want RSVP notifications sent elsewhere.
//   4. Deploy > New deployment > type "Web app". Execute as "Me", who has
//      access "Anyone". Deploy, and authorize it with the Google account
//      that owns the spreadsheet.
//   5. Copy the Web app URL from the deployment dialog and paste it into
//      BOTH RSVP_ENDPOINT in rsvp/index.html AND JUKEBOX_ENDPOINT in
//      jukebox/index.html — one deployment serves both pages.
//   6. If you ever edit this script after redeploying, use Deploy > Manage
//      deployments > edit (pencil) > New version — editing the code alone
//      doesn't update a live deployment.
//
// Removing a song from the jukebox page only marks its row Status =
// "removed" (the row stays in the Songs tab). You can delete rows or
// hand-edit Status any time.

const SPREADSHEET_ID = '';        // only needed for a standalone project; empty = the Sheet this script is bound to
const NOTIFY_EMAIL = 'pilar.esteban@gmail.com';

// Email/Phone are appended at the end, not inserted earlier, so existing rows'
// columns (Levels, Special requirements, Message) don't shift under the new header.
const RSVP_HEADERS = ['Timestamp', 'Guests', 'Small humans', 'Levels', 'Special requirements', 'Message', 'Email', 'Phone'];

const SONGS_SHEET_NAME = 'Songs';       // the tab songs are written to
const SONG_HEADERS = [
  'Timestamp', 'Status', 'Guest', 'Title', 'Artist', 'Album', 'Source',
  'iTunes track ID', 'iTunes link', 'Song ID', 'Guest ID', 'Open in Spotify', 'Preview URL',
];
const COL = {
  ts: 0, status: 1, guest: 2, title: 3, artist: 4, album: 5, source: 6,
  trackId: 7, link: 8, songId: 9, guestId: 10, spotify: 11, previewUrl: 12,
};
const MAX_SONGS_PER_GUEST = 50;   // songs one guest can have on the list at once
const MAX_ATTEMPTS_PER_GUEST = 70; // rows per guest ever, incl. removed ones (add/remove loops)
const MAX_ROWS = 1500;            // whole-Sheet ceiling, in case someone scripts the endpoint
const MAX_GUEST_LEN = 24;
const MAX_TYPED_LEN = 80;

function getSpreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'search') return json_(searchTracks_(p.term));
  const guestId = cleanGuestId_(p.guestId);
  return json_(Object.assign({ ok: true, status: 'list' }, buildList_(readRows_(getSongsSheet_()), guestId)));
}

// The RSVP form and the jukebox both POST here. The jukebox always sends
// {action: 'add'|'remove', guestId, ...}; the RSVP form sends
// {guests, levels, ...} with no action — that's what tells them apart.
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, status: 'error' });
  }

  if (data.action === 'add' || data.action === 'remove') {
    try {
      const guestId = cleanGuestId_(data.guestId);
      if (guestId && data.action === 'add') return json_(addSong_(data, guestId));
      if (guestId && data.action === 'remove') return json_(removeSong_(data, guestId));
    } catch (err) {
      console.error(err);
    }
    return json_({ ok: false, status: 'error' });
  }

  try {
    return json_(submitRsvp_(data));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, status: 'error' });
  }
}

// ---- RSVP ----

function submitRsvp_(data) {
  // Always the first tab: the Songs tab (created after it) must never catch these.
  const sheet = getSpreadsheet_().getSheets()[0];

  // Row 1 is always the header. Rewriting it every time also brings a sheet
  // created by an older version of this script (a "Dietary" column, no
  // "Message") up to date the first time a new RSVP comes in.
  sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]);

  const guests = data.guests || [];
  const guestNames = guests.map((g) => g.name).join(', ');
  const childNames = guests.filter((g) => g.isChild).map((g) => g.name).join(', ');

  sheet.appendRow([
    new Date(),
    guestNames,
    childNames || '—',
    data.levels || '—',
    data.requirements || '—',
    data.message || '—',
    data.email || '—',
    data.phone || '—',
  ]);

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New wedding RSVP: ' + guestNames,
    body: [
      'Guests: ' + guestNames,
      'Small humans: ' + (childNames || 'none'),
      'Email: ' + (data.email || 'none given'),
      'Phone: ' + (data.phone || 'none given'),
      'Levels: ' + (data.levels || 'not specified'),
      'Special requirements: ' + (data.requirements || 'none given'),
      'Message: ' + (data.message || 'none given'),
    ].join('\n'),
  });

  return { ok: true };
}

// ---- Jukebox ----

function addSong_(data, guestId) {
  const guest = cleanText_(data.guest, MAX_GUEST_LEN);
  if (!guest) return { ok: false, status: 'error' };

  let song;
  if (data.trackId) {
    // Title/artist come from Apple, not from the browser, so they can't be forged.
    song = lookupTrack_(data.trackId);
  } else {
    const typed = cleanText_(data.typedText, MAX_TYPED_LEN);
    if (typed.length >= 2) song = { source: 'typed', trackId: '', title: typed, artist: '', album: '', link: '', previewUrl: '' };
  }
  if (!song) return { ok: false, status: 'error' };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSongsSheet_();
    const rows = readRows_(sheet);
    const active = rows.filter((r) => r.status === 'active');
    const key = songKey_(song.title, song.artist);

    let status = 'added';
    if (rows.length >= MAX_ROWS || rows.filter((r) => r.guestId === guestId).length >= MAX_ATTEMPTS_PER_GUEST
        || active.filter((r) => r.guestId === guestId).length >= MAX_SONGS_PER_GUEST) {
      status = 'limit';
    } else if (active.some((r) => (song.trackId && r.trackId === song.trackId) || songKey_(r.title, r.artist) === key)) {
      status = 'duplicate';
    }

    if (status === 'added') {
      const row = sheet.getLastRow() + 1;
      const songId = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
      // Plain-text format first, so a title like "=SUM(1)" or "1999" is stored
      // as text and never evaluated as a formula or coerced to a number.
      sheet.getRange(row, COL.status + 1, 1, COL.guestId - COL.status + 1).setNumberFormat('@');
      sheet.getRange(row, COL.previewUrl + 1).setNumberFormat('@');
      sheet.getRange(row, 1, 1, SONG_HEADERS.length).setValues([[
        new Date(), 'active', guest, song.title, song.artist, song.album, song.source,
        song.trackId, song.link, songId, guestId, spotifyLink_(song.title, song.artist), song.previewUrl,
      ]]);
      rows.push({
        ts: Date.now(), status: 'active', guest: guest, title: song.title, artist: song.artist,
        trackId: song.trackId, previewUrl: song.previewUrl, songId: songId, guestId: guestId,
      });
    }
    return Object.assign({ ok: true, status: status }, buildList_(rows, guestId));
  } finally {
    lock.releaseLock();
  }
}

function removeSong_(data, guestId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSongsSheet_();
    const rows = readRows_(sheet);
    // Only the guest who added a song can remove it; anything else looks like "not found".
    const target = rows.find((r) => r.status === 'active' && r.songId === String(data.id) && r.guestId === guestId);
    let status = 'not_found';
    if (target) {
      sheet.getRange(target.sheetRow, COL.status + 1).setValue('removed');
      target.status = 'removed';
      status = 'removed';
    }
    return Object.assign({ ok: true, status: status }, buildList_(rows, guestId));
  } finally {
    lock.releaseLock();
  }
}

// The list the page renders: newest first, numbered by submission order. Never
// includes anyone's Guest ID — "mine" is worked out here.
function buildList_(rows, guestId) {
  const active = rows.filter((r) => r.status === 'active').sort((a, b) => a.ts - b.ts);
  const songs = active.map((r, i) => ({
    n: i + 1,
    id: r.songId,
    title: r.title,
    artist: r.artist,
    trackId: r.trackId,
    previewUrl: r.previewUrl,
    guest: r.guest,
    mine: !!guestId && r.guestId === guestId,
  })).reverse();
  return {
    songs: songs,
    used: songs.filter((s) => s.mine).length,
    max: MAX_SONGS_PER_GUEST,
  };
}

function readRows_(sheet) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, SONG_HEADERS.length).getValues().map((v, i) => ({
    sheetRow: i + 2,
    ts: new Date(v[COL.ts]).getTime() || 0,
    status: String(v[COL.status]),
    guest: String(v[COL.guest]),
    title: String(v[COL.title]),
    artist: String(v[COL.artist]),
    trackId: String(v[COL.trackId]),
    previewUrl: String(v[COL.previewUrl] || ''),
    songId: String(v[COL.songId]),
    guestId: String(v[COL.guestId]),
  }));
}

function getSongsSheet_() {
  const ss = getSpreadsheet_();
  // Added after the existing tabs, so the RSVP tab stays first.
  const sheet = ss.getSheetByName(SONGS_SHEET_NAME) || ss.insertSheet(SONGS_SHEET_NAME, ss.getSheets().length);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SONG_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, SONG_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Fallback for the jukebox page's own search: on real iPhone/iPad Safari, iTunes'
// search endpoint redirects the browser's fetch() to a musics:// deep link instead
// of returning JSON (it's trying to hand the tap off to the Music app), which
// fetch() can't follow and always fails. A server-side request isn't sent by a
// browser at all, so it never gets that redirect — the page calls this once its
// own direct attempt throws. Same endpoint and shape iTunes returns, so the
// page's existing result-parsing code doesn't need to know which path it came from.
function searchTracks_(rawTerm) {
  const term = cleanText_(rawTerm, 100);
  if (term.length < 2) return { results: [] };
  const url = 'https://itunes.apple.com/search?media=music&entity=song&limit=14&term=' + encodeURIComponent(term);
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return { results: [] };
  try {
    return { results: JSON.parse(res.getContentText()).results || [] };
  } catch (err) {
    return { results: [] };
  }
}

function lookupTrack_(rawId) {
  const id = String(rawId);
  if (!/^\d{1,12}$/.test(id)) return null;
  const res = UrlFetchApp.fetch('https://itunes.apple.com/lookup?id=' + id, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  const hit = (JSON.parse(res.getContentText()).results || [])[0];
  // "kind" filters out artists/albums — only an actual song can go on the list.
  if (!hit || hit.wrapperType !== 'track' || hit.kind !== 'song') return null;
  const link = String(hit.trackViewUrl || '');
  const preview = String(hit.previewUrl || '');
  return {
    source: 'itunes',
    trackId: id,
    title: cleanText_(hit.trackName, 120),
    artist: cleanText_(hit.artistName, 80),
    album: cleanText_(hit.collectionName, 120),
    link: /^https:\/\/[a-z0-9.-]*apple\.com\//.test(link) ? link : '',
    // Kept so a tap on the list can start the 30s preview instantly (phones only allow
    // audio that starts straight from a tap). Only Apple hosts are accepted.
    previewUrl: /^https:\/\/[a-z0-9.-]+\.(apple\.com|mzstatic\.com)\//.test(preview) ? preview : '',
  };
}

function spotifyLink_(title, artist) {
  const url = 'https://open.spotify.com/search/' + encodeURIComponent((title + ' ' + artist).trim());
  return '=HYPERLINK("' + url + '","Open in Spotify")';
}

// "Dancing Queen" / "dancing  queen!" / "Dancing Queén" all collapse to one key. Title and
// artist are joined first, so a typed "Mr. Brightside — The Killers" matches the iTunes
// entry for the same song.
function songKey_(title, artist) {
  const text = (title + ' ' + artist).trim();
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ').trim() || text.toLowerCase();
}

function cleanText_(s, max) {
  return String(s == null ? '' : s)
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanGuestId_(s) {
  return /^[A-Za-z0-9_-]{16,64}$/.test(String(s)) ? String(s) : '';
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run from the editor (pick checkSetup > Run) after pasting the script or whenever
// adding songs or RSVPs fails. It walks the steps without writing a row, so Google
// shows its authorization prompt here and the first thing that breaks is named in
// the log, instead of a page's bare "something went wrong".
function checkSetup() {
  if (!SPREADSHEET_ID && !SpreadsheetApp.getActiveSpreadsheet()) {
    throw new Error('Paste the shared spreadsheet ID into SPREADSHEET_ID at the top of this file.');
  }
  const ss = getSpreadsheet_();
  const rsvpSheet = ss.getSheets()[0];
  console.log('RSVP tab OK: "' + rsvpSheet.getName() + '" in "' + ss.getName() + '".');

  const songsSheet = getSongsSheet_();
  console.log('Songs tab OK: "' + SONGS_SHEET_NAME + '" tab, ' + readRows_(songsSheet).length + ' song rows.');

  const testId = '1422648513'; // Dancing Queen
  const code = UrlFetchApp.fetch('https://itunes.apple.com/lookup?id=' + testId, { muteHttpExceptions: true }).getResponseCode();
  console.log('Apple lookup: HTTP ' + code + (code === 200 ? '' : ' - adding songs fails until this is 200.'));
  const song = lookupTrack_(testId);
  if (!song) throw new Error('Apple answered, but lookupTrack_ found no song in the reply.');
  console.log('Song OK: ' + song.title + ' - ' + song.artist + (song.previewUrl ? ' (preview saved)' : ' (NO preview url)'));

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  lock.releaseLock();
  console.log('Lock OK. Setup looks good.');
}
