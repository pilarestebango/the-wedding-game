// RSVP form backend for Pilar & Joe's wedding site — runs on Google's
// infra, not ours, so the site can stay a static/no-backend build.
//
// Setup (one-time, ~5 minutes):
//   1. Create a new Google Sheet — this becomes the live RSVP spreadsheet
//      (Google Sheets, downloadable as .xlsx any time via File > Download).
//   2. Extensions > Apps Script. Delete the placeholder code and paste this
//      whole file in.
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

const NOTIFY_EMAIL = 'pilar.esteban@gmail.com';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Guests', 'Small humans', 'Levels', 'Dietary']);
  }

  const guests = data.guests || [];
  const guestNames = guests.map((g) => g.name).join(', ');
  const childNames = guests.filter((g) => g.isChild).map((g) => g.name).join(', ');

  sheet.appendRow([
    new Date(),
    guestNames,
    childNames || '—',
    data.levels || '—',
    data.dietary || '—',
  ]);

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New wedding RSVP: ' + guestNames,
    body: [
      'Guests: ' + guestNames,
      'Small humans: ' + (childNames || 'none'),
      'Levels: ' + (data.levels || 'not specified'),
      'Dietary: ' + (data.dietary || 'none given'),
    ].join('\n'),
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
