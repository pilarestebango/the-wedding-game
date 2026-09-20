// Jukebox backend for Pilar & Joe's wedding site — same idea as the RSVP form's
// script (rsvp/google-apps-script.gs): it runs on Google's infra, not ours, so
// the site can stay a static/no-backend build. Guests search songs on the page
// (Apple's iTunes Search API, straight from the browser); this script only
// stores and serves the shared song list.
//
// Setup (one-time, ~5 minutes) — use a NEW Sheet, not the RSVP one:
//   1. Create a new Google Sheet — this becomes the live song list. Every
//      submitted song is a row; each row has an "Open in Spotify" link so
//      adding it to your playlist is one click.
//   2. Extensions > Apps Script. Delete the placeholder code and paste this
//      whole file in.
//   3. Deploy > New deployment > type "Web app". Execute as "Me", who has
//      access "Anyone". Deploy, and authorize it with the Google account
//      that owns the Sheet.
//   4. Copy the Web app URL from the deployment dialog and paste it into
//      JUKEBOX_ENDPOINT in jukebox/index.html.
//   5. If you ever edit this script after redeploying, use Deploy > Manage
//      deployments > edit (pencil) > New version — editing the code alone
//      doesn't update a live deployment.
//
// Removing a song from the page only marks its row Status = "removed" (the row
// stays in the Sheet). You can delete rows or hand-edit Status any time.

const MAX_SONGS_PER_GUEST = 10;   // songs one guest can have on the list at once
const MAX_ATTEMPTS_PER_GUEST = 30; // rows per guest ever, incl. removed ones (add/remove loops)
const MAX_ROWS = 1500;            // whole-Sheet ceiling, in case someone scripts the endpoint
const MAX_GUEST_LEN = 24;
const MAX_TYPED_LEN = 80;

const HEADERS = [
  'Timestamp', 'Status', 'Guest', 'Title', 'Artist', 'Album', 'Source',
  'iTunes track ID', 'iTunes link', 'Song ID', 'Guest ID', 'Open in Spotify', 'Preview URL',
];
const COL = {
  ts: 0, status: 1, guest: 2, title: 3, artist: 4, album: 5, source: 6,
  trackId: 7, link: 8, songId: 9, guestId: 10, spotify: 11, previewUrl: 12,
};

function doGet(e) {
  const guestId = cleanGuestId_(e && e.parameter && e.parameter.guestId);
  return json_(Object.assign({ ok: true, status: 'list' }, buildList_(readRows_(getSheet_()), guestId)));
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, status: 'error' });
  }

  try {
    const guestId = cleanGuestId_(data.guestId);
    if (guestId && data.action === 'add') return json_(addSong_(data, guestId));
    if (guestId && data.action === 'remove') return json_(removeSong_(data, guestId));
  } catch (err) {
    console.error(err);
  }
  return json_({ ok: false, status: 'error' });
}

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
    const sheet = getSheet_();
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
      sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
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
    const sheet = getSheet_();
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
  return sheet.getRange(2, 1, last - 1, HEADERS.length).getValues().map((v, i) => ({
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

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
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
