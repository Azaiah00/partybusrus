/** @OnlyCurrentDoc */
// Bound to the private Live Inquiry Tracker. Never publish this as a web app.
var PBRU_SYNC = {
  firstRow: 8,
  lastRow: 1007,
  inquiryHeaders: ['Inquiry ID', 'First recorded date', 'Channel', 'Customer reference', 'Reported source', 'Source evidence', 'Status', 'Next follow-up', 'Trip date', 'Quoted amount', 'Booking value', 'Notes', 'Record check', 'Recorded referrer', 'Email count', 'Record type', 'Grouping review', 'Recorded source class', 'Grouping basis'],
  submissionHeaders: ['Mailbox ID', 'Inquiry ID', 'Received date', 'Submitted UTC', 'Channel', 'Record type', 'Grouping basis', 'Request reference', 'Recorded source page', 'Raw referrer', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'Mailbox folder', 'Mailbox URL', 'Evidence note', 'Observed UTC', 'Recorded source class', 'Referrer host', 'Received display'],
  captureHeaders: ['Capture ID', 'Submitted UTC', 'First seen UTC', 'Inquiry ID', 'Processing state', 'Reference', 'Customer', 'Email', 'Phone', 'Preferred contact', 'Trip date', 'Pickup time', 'Passengers', 'Duration', 'Event', 'Vehicle', 'Pickup', 'Stops', 'Notes', 'Recorded source page', 'Raw referrer', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'Form URL', 'Raw form JSON']
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Inquiry capture')
    .addItem('Configure private API key', 'configureInquiryCapture')
    .addItem('Sync now', 'syncQuoteArchive')
    .addItem('Enable automatic capture', 'enableAutomaticCapture')
    .addItem('Disable automatic capture', 'disableAutomaticCapture')
    .addToUi();
}

function captureError_(code) {
  var error = new Error('Inquiry capture: ' + code);
  error.captureCode = code;
  return error;
}

function captureSheets_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw captureError_('BOUND_SHEET_REQUIRED');
  var sheets = {
    book: book,
    inquiries: book.getSheetByName('Inquiries'),
    captures: book.getSheetByName('Captured forms'),
    submissions: book.getSheetByName('Submissions'),
    status: book.getSheetByName('Sync status')
  };
  if (!sheets.inquiries || !sheets.captures || !sheets.submissions || !sheets.status) throw captureError_('TRACKER_TABS_MISSING');
  [[sheets.inquiries, PBRU_SYNC.inquiryHeaders], [sheets.captures, PBRU_SYNC.captureHeaders], [sheets.submissions, PBRU_SYNC.submissionHeaders]].forEach(function (pair) {
    if (JSON.stringify(pair[0].getRange(7, 1, 1, pair[1].length).getValues()[0]) !== JSON.stringify(pair[1])) throw captureError_('TRACKER_HEADERS_CHANGED');
    if (pair[0].getMaxRows() < PBRU_SYNC.lastRow) throw captureError_('TRACKER_CAPACITY_CHANGED');
  });
  return sheets;
}

function captureOwner_() {
  var shared = PropertiesService.getScriptProperties();
  var personal = PropertiesService.getUserProperties();
  var owner = shared.getProperty('CAPTURE_OWNER_TOKEN');
  if (!owner || owner !== personal.getProperty('CAPTURE_OWNER_TOKEN')) throw captureError_('RUN_AS_CONFIGURED_OWNER');
  var key = personal.getProperty('FORMSUBMIT_API_KEY');
  if (!key || !/^[A-Za-z0-9_-]{16,256}$/.test(key)) throw captureError_('API_KEY_REQUIRED');
  return {shared: shared, personal: personal, key: key};
}

function configureInquiryCapture() {
  captureSheets_();
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Private FormSubmit API key', 'Paste the API key delivered to the website inquiry mailbox. It is saved in this Google account’s private script properties, never in cells or source code. Only trusted owners should have edit access to this workbook.', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() !== ui.Button.OK) return;
  var key = result.getResponseText().trim();
  if (!/^[A-Za-z0-9_-]{16,256}$/.test(key)) throw captureError_('API_KEY_FORMAT');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw captureError_('SYNC_ALREADY_RUNNING');
  try {
    var shared = PropertiesService.getScriptProperties();
    var personal = PropertiesService.getUserProperties();
    var owner = shared.getProperty('CAPTURE_OWNER_TOKEN');
    if (owner && owner !== personal.getProperty('CAPTURE_OWNER_TOKEN')) throw captureError_('RUN_AS_CONFIGURED_OWNER');
    owner = owner || Utilities.getUuid();
    personal.setProperties({CAPTURE_OWNER_TOKEN: owner, FORMSUBMIT_API_KEY: key});
    shared.setProperty('CAPTURE_OWNER_TOKEN', owner);
    // Keep the first cutover even after a key rotation or reconfiguration.
    if (!shared.getProperty('CAPTURE_START_UTC')) shared.setProperty('CAPTURE_START_UTC', new Date().toISOString());
    shared.setProperty('CAPTURE_SETUP', 'Configured; run Sync now before enabling automatic capture');
    updateCaptureStatus_(captureSheets_(), shared);
  } finally { lock.releaseLock(); }
}

function captureAttempts_(shared, now) {
  var attempts;
  try { attempts = JSON.parse(shared.getProperty('CAPTURE_ATTEMPTS') || '[]'); }
  catch (_) { throw captureError_('REQUEST_BUDGET_INVALID'); }
  if (!Array.isArray(attempts) || attempts.some(function (n) { return typeof n !== 'number' || !isFinite(n) || n > now; })) throw captureError_('REQUEST_BUDGET_INVALID');
  return attempts.filter(function (n) { return now - n < 86400000; });
}

function captureHash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (n) { return ('0' + (n & 255).toString(16)).slice(-2); }).join('');
}

function captureSourceClass_(value) {
  var raw = String(value || '').trim().toLowerCase();
  if (!raw || raw === 'not recorded') return 'Blank / absent';
  if (raw === 'direct') return 'Unverified direct label';
  var match = raw.match(/^(?:https?:\/\/)?([a-z0-9.-]+)(?::\d+)?(?:[\/?#]|$)/);
  if (!match) return 'Blank / absent';
  var host = match[1];
  if (host === 'chatgpt.com') return 'ChatGPT referral';
  if (host === 'partybusrus.com' || host === 'www.partybusrus.com') return 'Own-site referrer';
  return host.indexOf('.') >= 0 ? 'Other external' : 'Blank / absent';
}

function captureField_(record, field) {
  if (record.fieldPresence && record.fieldPresence[field] === false) return 'Not recorded';
  var value = record.fields[field];
  return value === undefined || value === null ? 'Not recorded' : String(value);
}

function captureRow_(record, firstSeen) {
  var fields = ['name', 'email', 'phone', 'contact_pref', 'event_date', 'pickup_time', 'headcount', 'hours', 'event_type', 'vehicle_preference', 'pickup_location', 'destinations', 'notes', 'source_page', 'source_referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  return [record.recordKey, record.submittedAtUtc, firstSeen, '', 'Pending', record.requestReference || '']
    .concat(fields.map(function (field) { return captureField_(record, field); }))
    .concat([record.formUrl, record.rawDataJson]);
}

function writeCaptureText_(range, rows) {
  range.setNumberFormat('@');
  range.setValues(rows.map(function (row) { return row.map(FormSubmitSyncCore.safeCell); }));
}

function captureUniqueIds_(rows, code) {
  var map = Object.create(null);
  rows.forEach(function (row, index) {
    if (!row[0]) return;
    var id = String(row[0]);
    if (Object.prototype.hasOwnProperty.call(map, id)) throw captureError_(code);
    map[id] = index;
  });
  return map;
}

function captureValidReference_(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function captureReferences_(inquiries, emails, captures) {
  var refs = Object.create(null);
  function add(ref, id) {
    if (!captureValidReference_(ref) || !id) return;
    if (!refs[ref]) refs[ref] = [];
    if (refs[ref].indexOf(String(id)) < 0) refs[ref].push(String(id));
  }
  inquiries.forEach(function (row) { add(row[0], row[0]); });
  emails.forEach(function (row) { add(row[7], row[1]); });
  captures.forEach(function (row) { add(row[5], row[3]); });
  return {values: refs, add: add};
}

function captureEmptyInquiry_(row) {
  // M/O are formulas. Every other input must be empty before a row is reusable.
  return row.every(function (value, index) { return index === 12 || index === 14 || value === '' || value === null; });
}

function processCaptureRows_(sheets, records, shared, nowIso) {
  var count = PBRU_SYNC.lastRow - PBRU_SYNC.firstRow + 1;
  var inquiries = sheets.inquiries.getRange(8, 1, count, 19).getValues();
  var inquiryFormulas = sheets.inquiries.getRange(8, 1, count, 19).getFormulas();
  var captures = sheets.captures.getRange(8, 1, count, 28).getValues();
  var emails = sheets.submissions.getRange(8, 1, count, 22).getValues();
  var inquiryIds = captureUniqueIds_(inquiries, 'DUPLICATE_INQUIRY_IDS');
  var captureIds = captureUniqueIds_(captures, 'DUPLICATE_CAPTURE_IDS');
  var references = captureReferences_(inquiries, emails, captures);
  var start = Date.parse(shared.getProperty('CAPTURE_START_UTC') || '');
  if (!isFinite(start)) throw captureError_('CAPTURE_START_REQUIRED');
  var planned = FormSubmitSyncCore.planImport(records, captures.filter(function (row) { return row[0]; }).map(function (row) { return {recordKey: String(row[0]), requestReference: String(row[5] || '')}; }));
  var conflicts = Object.create(null);
  // A repeated reference with a different provider record always requires review.
  var byRef = Object.create(null);
  captures.filter(function (row) { return row[0] && row[5]; }).forEach(function (row) {
    if (!byRef[row[5]]) byRef[row[5]] = [];
    if (byRef[row[5]].indexOf(row[0]) < 0) byRef[row[5]].push(row[0]);
  });
  records.forEach(function (record) {
    if (!record.requestReference) return;
    if (!byRef[record.requestReference]) byRef[record.requestReference] = [];
    if (byRef[record.requestReference].indexOf(record.recordKey) < 0) byRef[record.requestReference].push(record.recordKey);
  });
  Object.keys(byRef).forEach(function (ref) { if (byRef[ref].length > 1) byRef[ref].forEach(function (key) { conflicts[key] = true; }); });
  var inserted = 0;
  planned.newRecords.forEach(function (record) {
    var slot = captures.findIndex(function (row) { return row.every(function (value) { return value === '' || value === null; }); });
    if (slot < 0) throw captureError_('CAPTURE_CAPACITY_REACHED');
    var values = captureRow_(record, nowIso);
    writeCaptureText_(sheets.captures.getRange(slot + 8, 1, 1, 28), [values]);
    captures[slot] = values;
    captureIds[record.recordKey] = slot;
    inserted++;
  });
  // Process saved Pending rows too: this repairs a crash after writing the ledger.
  captures.forEach(function (row, slot) {
    if (!row[0]) return;
    var captureId = String(row[0]);
    var derivedId = 'FS-' + captureId;
    var linked = row[3] ? String(row[3]) : '';
    var state = String(row[4] || 'Pending');
    if (linked) {
      if (!Object.prototype.hasOwnProperty.call(inquiryIds, linked)) {
        writeCaptureText_(sheets.captures.getRange(slot + 8, 5, 1, 1), [['Review: linked inquiry is missing']]);
        return;
      }
      if (conflicts[captureId]) writeCaptureText_(sheets.captures.getRange(slot + 8, 5, 1, 1), [['Review: reference used by multiple captures']]);
      else if (state.indexOf('Review:') === 0 || state === 'Pending') writeCaptureText_(sheets.captures.getRange(slot + 8, 5, 1, 1), [['Linked by owner']]);
      return;
    }
    var target = '';
    if (Object.prototype.hasOwnProperty.call(inquiryIds, derivedId)) {
      target = derivedId;
      state = 'New inquiry captured';
    } else if (conflicts[captureId]) {
      state = 'Review: reference used by multiple captures';
    } else if (row[5] && !captureValidReference_(String(row[5]))) {
      state = 'Review: unrecognized reference';
    } else {
      var matches = references.values[String(row[5])] || [];
      if (matches.length === 1 && Object.prototype.hasOwnProperty.call(inquiryIds, matches[0])) {
        target = matches[0];
        state = 'Linked to existing inquiry';
      } else if (matches.length > 0) {
        state = 'Review: ambiguous historical reference';
      } else if (!isFinite(Date.parse(row[1])) || Date.parse(row[1]) <= start) {
        state = 'Review: historical capture needs matching';
      } else {
        var inquirySlot = inquiries.findIndex(captureEmptyInquiry_);
        if (inquirySlot < 0) throw captureError_('INQUIRY_CAPACITY_REACHED');
        target = derivedId;
        var sourceClass = captureSourceClass_(row[20]);
        // First recorded date is when this private tracker first observed it.
        var firstSeen = new Date(row[2]);
        if (!isFinite(firstSeen.getTime())) throw captureError_('CAPTURE_TIMESTAMP_INVALID');
        var customer = row[6] === 'Not recorded' ? '' : String(row[6]);
        var notes = 'Captured from FormSubmit archive. Original trip/contact details are in Captured forms. No booking outcome established.';
        var first = [target, firstSeen, 'Web quote', customer, 'Unknown', 'Provider record', '', '', '', '', '', notes];
        // Parse only the site's explicit ISO or English-month formats.
        var tripDateIso = FormSubmitSyncCore.tripDateIso(String(row[10] || ''));
        if (tripDateIso) first[8] = new Date(tripDateIso + 'T12:00:00Z');
        var checks = inquiryFormulas[inquirySlot];
        if (!checks || !checks[12] || !checks[14]) throw captureError_('INQUIRY_FORMULAS_MISSING');
        var complete = first.concat(['', row[20] === 'Not recorded' ? '' : row[20], '', 'Inquiry', 'Not required', sourceClass, 'One provider record; no inferred contact-based merging']);
        var saved = complete.map(function (value) { return value instanceof Date ? value : FormSubmitSyncCore.safeCell(value); });
        // Carry both existing formulas unchanged in the same row write, so a retry
        // cannot leave an ID committed before its record type/source metadata.
        saved[12] = checks[12]; saved[14] = checks[14];
        sheets.inquiries.getRange(inquirySlot + 8, 1, 1, 19).setValues([saved]);
        sheets.inquiries.getRange(inquirySlot + 8, 2).setNumberFormat('mm/dd/yy');
        sheets.inquiries.getRange(inquirySlot + 8, 9).setNumberFormat('mm/dd/yy');
        inquiries[inquirySlot] = complete;
        inquiryIds[target] = inquirySlot;
        state = 'New inquiry captured';
      }
    }
    writeCaptureText_(sheets.captures.getRange(slot + 8, 4, 1, 2), [[target, state]]);
    row[3] = target; row[4] = state;
    if (target) references.add(String(row[5]), target);
  });
  return inserted;
}

function updateCaptureStatus_(sheets, shared) {
  var captures = sheets.captures.getRange(8, 1, 1000, 5).getValues().filter(function (row) { return row[0]; });
  var attempts;
  try { attempts = captureAttempts_(shared, Date.now()).length; } catch (_) { attempts = 'Budget needs review'; }
  var data = [
    ['Setup', shared.getProperty('CAPTURE_SETUP') || 'Not configured'],
    ['Last attempt (UTC)', shared.getProperty('CAPTURE_LAST_ATTEMPT') || ''],
    ['Last successful fetch (UTC)', shared.getProperty('CAPTURE_LAST_SUCCESS') || ''],
    ['Last result', shared.getProperty('CAPTURE_LAST_RESULT') || 'No live fetch yet'],
    ['Attempts in rolling 24h', attempts],
    ['Captures needing review', '=COUNTIFS(\'Captured forms\'!A8:A1007,"<>")-COUNTIFS(\'Captured forms\'!A8:A1007,"<>",\'Captured forms\'!D8:D1007,"<>",\'Captured forms\'!E8:E1007,"New inquiry captured")-COUNTIFS(\'Captured forms\'!A8:A1007,"<>",\'Captured forms\'!D8:D1007,"<>",\'Captured forms\'!E8:E1007,"Linked to existing inquiry")-COUNTIFS(\'Captured forms\'!A8:A1007,"<>",\'Captured forms\'!D8:D1007,"<>",\'Captured forms\'!E8:E1007,"Linked by owner")'],
    ['Capture start (UTC)', shared.getProperty('CAPTURE_START_UTC') || ''],
    ['Retention warning', shared.getProperty('CAPTURE_RETENTION_WARNING') || 'Provider archive retains 30 days; older records require mailbox evidence.'],
    ['Automatic schedule', shared.getProperty('CAPTURE_SCHEDULE') || 'Not enabled'],
    ['Total captured forms', '=COUNTIFS(\'Captured forms\'!A8:A1007,"<>")'],
    ['Scope', 'Website form archive only. Direct emails and calls need manual entries.']
  ];
  sheets.status.getRange(3, 1, data.length, 2).setValues(data);
}

function syncQuoteArchive() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw captureError_('SYNC_ALREADY_RUNNING');
  var sheets, shared;
  try {
    sheets = captureSheets_();
    var owner = captureOwner_(); shared = owner.shared;
    var now = Date.now(); var nowIso = new Date(now).toISOString();
    var attempts = captureAttempts_(shared, now);
    if (attempts.length >= 4) {
      shared.setProperty('CAPTURE_LAST_RESULT', 'Deferred: four attempts already reserved in rolling 24h');
      updateCaptureStatus_(sheets, shared);
      return;
    }
    // Reserve before network I/O; failures and manual attempts use the same budget.
    attempts.push(now);
    shared.setProperties({CAPTURE_ATTEMPTS: JSON.stringify(attempts), CAPTURE_LAST_ATTEMPT: nowIso});
    var response;
    try {
      response = UrlFetchApp.fetch('https://formsubmit.co/api/get-submissions/' + encodeURIComponent(owner.key), {
        method: 'get', followRedirects: false, muteHttpExceptions: true,
        headers: {Accept: 'application/json'}
      });
    } catch (_) { throw captureError_('PROVIDER_FETCH_FAILED'); }
    if (response.getResponseCode() !== 200) throw captureError_('PROVIDER_HTTP_ERROR');
    var records;
    try { records = FormSubmitSyncCore.normalizeArchive(response.getContentText(), captureHash_); }
    catch (_) { throw captureError_('PROVIDER_DATA_INVALID'); }
    var prior = Date.parse(shared.getProperty('CAPTURE_LAST_SUCCESS') || shared.getProperty('CAPTURE_START_UTC') || '');
    if (isFinite(prior) && now - prior > 30 * 86400000) shared.setProperty('CAPTURE_RETENTION_WARNING', 'A gap exceeded the provider’s 30-day archive window. Review mailbox evidence; this fetch cannot recover that gap.');
    var inserted = processCaptureRows_(sheets, records, shared, nowIso);
    SpreadsheetApp.flush();
    shared.setProperties({CAPTURE_LAST_SUCCESS: nowIso, CAPTURE_LAST_RESULT: 'Success: ' + inserted + ' new archive records; ' + records.length + ' provider records checked'});
    updateCaptureStatus_(sheets, shared);
  } catch (error) {
    // Never expose provider response text, request URL/API key, or customer data.
    var code = error && /^[A-Z_]+$/.test(error.captureCode || '') ? error.captureCode : 'SYNC_FAILED';
    if (shared && sheets) {
      shared.setProperty('CAPTURE_LAST_RESULT', 'Failed: ' + code + '. Correct the issue and retry; existing records are retained.');
      try { updateCaptureStatus_(sheets, shared); } catch (_) { /* Preserve the sanitized original failure. */ }
    }
    throw captureError_(code);
  } finally { lock.releaseLock(); }
}

function enableAutomaticCapture() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw captureError_('SYNC_ALREADY_RUNNING');
  try {
    var sheets = captureSheets_(); var owner = captureOwner_();
    if (!owner.shared.getProperty('CAPTURE_LAST_SUCCESS')) throw captureError_('SUCCESSFUL_SYNC_REQUIRED');
    var triggers = ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === 'syncQuoteArchive'; });
    if (!triggers.length) ScriptApp.newTrigger('syncQuoteArchive').timeBased().everyHours(6).create();
    if (triggers.length > 1) triggers.slice(1).forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
    owner.shared.setProperties({CAPTURE_SCHEDULE: 'Every 6 hours; at most 4 requests in rolling 24h', CAPTURE_SETUP: 'Automatic capture enabled'});
    updateCaptureStatus_(sheets, owner.shared);
  } finally { lock.releaseLock(); }
}

function disableAutomaticCapture() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) throw captureError_('SYNC_ALREADY_RUNNING');
  try {
    var sheets = captureSheets_(); var owner = captureOwner_();
    ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === 'syncQuoteArchive'; })
      .forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
    owner.shared.setProperties({CAPTURE_SCHEDULE: 'Disabled', CAPTURE_SETUP: 'Configured; automatic capture disabled'});
    updateCaptureStatus_(sheets, owner.shared);
  } finally { lock.releaseLock(); }
}
