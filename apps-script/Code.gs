/**
 * Saurabh AI Creates – Customer Review backend (Google Apps Script)
 * Stores reviews in the Google Sheet this script is bound to.
 */
const SHEET_NAME = 'Reviews';
const HEADERS = ['ID', 'Submitted At', 'Name', 'Contact', 'Service', 'Rating', 'Review', 'Suggestions', 'Allow Public', 'Approved'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").trim().slice(0, max); }

function rows_() {
  const sh = sheet_();
  const data = sh.getDataRange().getValues();
  data.shift();
  return data.map(r => ({
    id: r[0], date: r[1], name: r[2], contact: r[3], service: r[4], rating: Number(r[5]),
    review: r[6], suggestions: r[7], allowPublic: r[8] === 'Yes', approved: r[9] === 'Yes'
  }));
}

function isAdmin_(b) {
  return b && b.username === 'saurabh' && b.password === 'saurabh@93';
}

// GET ?action=public -> approved reviews only (no contact info)
function doGet(e) {
  const list = rows_().filter(r => r.approved && r.allowPublic)
    .map(r => ({ name: r.name, service: r.service, rating: r.rating, review: r.review, date: r.date }))
    .reverse();
  return json_({ ok: true, reviews: list });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Bad request' }); }

  if (b.action === 'submit') {
    const rating = Math.max(1, Math.min(5, parseInt(b.rating, 10) || 0));
    if (!b.name || !b.review || !rating) return json_({ ok: false, error: 'Name, rating and review are required' });
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      sheet_().appendRow([
        Utilities.getUuid().slice(0, 8), new Date(),
        clean_(b.name, 80), clean_(b.contact, 100), clean_(b.service, 60), rating,
        clean_(b.review, 2000), clean_(b.suggestions, 2000), b.allowPublic ? 'Yes' : 'No', 'No'
      ]);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  }

  if (!isAdmin_(b)) return json_({ ok: false, error: 'Invalid username or password' });

  if (b.action === 'login' || b.action === 'list') return json_({ ok: true, reviews: rows_().reverse() });

  if (b.action === 'setApproved') {
    const sh = sheet_();
    const ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues().map(r => String(r[0]));
    const i = ids.indexOf(String(b.id));
    if (i < 0) return json_({ ok: false, error: 'Not found' });
    sh.getRange(i + 2, 10).setValue(b.approved ? 'Yes' : 'No');
    return json_({ ok: true });
  }
  return json_({ ok: false, error: 'Unknown action' });
}
