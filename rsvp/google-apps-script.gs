// RSVP form backend for Pilar & Joe's wedding site — runs on Google's
// infra, not ours, so the site can stay a static/no-backend build.
//
// Setup (one-time, ~5 minutes). This can be either bound to the Sheet
// (Extensions > Apps Script from inside it, leaving SPREADSHEET_ID empty) or
// its own standalone project at script.google.com, same as the jukebox's —
// if you do the latter, paste the Sheet's ID into SPREADSHEET_ID below, or
// every RSVP will silently fail to save (getActiveSpreadsheet() has nothing
// to resolve to outside a bound script, and the page's fetch can't see the
// failure — see the mode: 'no-cors' note in rsvp/index.html):
//   1. Create a new Google Sheet — this becomes the live RSVP spreadsheet
//      (Google Sheets, downloadable as .xlsx any time via File > Download).
//      The jukebox's song list goes in a "Songs" tab of this same spreadsheet.
//   2. Extensions > Apps Script. Delete the placeholder code and paste this
//      whole file in. (Or, for a standalone project instead, paste the
//      spreadsheet's ID — the long string between /d/ and /edit in its URL —
//      into SPREADSHEET_ID below first.)
//   3. NOTIFY_EMAIL below already points at pilar.esteban@gmail.com — change
//      it if you want notifications sent elsewhere.
//   4. Deploy > New deployment > type "Web app". Execute as "Me", who has
//      access "Anyone". Deploy, and authorize it with the Google account
//      that owns the Sheet.
//   5. Copy the Web app URL from the deployment dialog and paste it into
//      RSVP_ENDPOINT in rsvp/index.html.
//   6. If you ever edit this script after redeploying, use Deploy > Manage
//      deployments > edit (pencil) > New version — editing the code alone
//      doesn't update a live deployment.

const SPREADSHEET_ID = '';        // only needed for a standalone project; empty = the Sheet this script is bound to
const NOTIFY_EMAIL = 'pilar.esteban@gmail.com';
// Email/Phone are appended at the end, not inserted earlier, so existing rows'
// columns (Levels, Special requirements, Message) don't shift under the new header.
const HEADERS = ['Timestamp', 'Guests', 'Small humans', 'Levels', 'Special requirements', 'Message', 'Email', 'Phone'];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  // Always the first tab: the jukebox adds a "Songs" tab to this same spreadsheet
  // (jukebox/google-apps-script.gs), and getActiveSheet() could land on it.
  const sheet = ss.getSheets()[0];

  // Row 1 is always the header. Rewriting it every time also brings a sheet
  // created by an older version of this script (a "Dietary" column, no
  // "Message") up to date the first time a new RSVP comes in.
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

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

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
