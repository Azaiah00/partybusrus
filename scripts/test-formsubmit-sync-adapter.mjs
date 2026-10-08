import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';

// Synthetic fixtures only. No network, Google account, mailbox or private workbook.
const coreSource = readFileSync(new URL('../integrations/formsubmit-sheet-sync/Core.gs', import.meta.url), 'utf8');
const adapterSource = readFileSync(new URL('../integrations/formsubmit-sheet-sync/Code.gs', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../integrations/formsubmit-sheet-sync/appsscript.json', import.meta.url), 'utf8'));
const NOW = Date.parse('2026-10-08T18:00:00Z');
const KEY = 'synthetic_api_key_never_live';
const REF = '11111111-2222-4333-8444-555555555555';
const plain = value => JSON.parse(JSON.stringify(value));
const archive = submissions => ({ success: true, submissions });
function record(data = {}, date = '2026-10-08 17:00:00.123456') {
  return { form_url: 'https://www.partybusrus.com/quote', form_data: { name: 'Synthetic Customer', email: 'customer@example.test', ...data },
    submitted_at: { date, timezone_type: 3, timezone: 'UTC' } };
}
function properties(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { data, getProperty: key => data.get(key) ?? null,
    setProperty(key, value) { data.set(key, String(value)); return this; },
    setProperties(values) { for (const [key, value] of Object.entries(values)) this.setProperty(key, value); return this; },
    deleteProperty(key) { data.delete(key); return this; } };
}

function boot({ records = [], configured = true } = {}) {
  const app = { now: NOW, fetches: [], writes: [], formats: [], responses: [], triggers: [], released: 0, held: false, hook: null };
  app.shared = properties(configured ? { CAPTURE_OWNER_TOKEN: 'synthetic-owner', CAPTURE_START_UTC: '2026-10-08T12:00:00Z' } : {});
  app.personal = properties(configured ? { CAPTURE_OWNER_TOKEN: 'synthetic-owner', FORMSUBMIT_API_KEY: KEY } : {});
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [app.now])); } static now() { return app.now; } }
  class Sheet {
    constructor(name) { this.name = name; this.cells = new Map(); this.maxRows = 1007; }
    cell(row, col) { return this.cells.get(`${row}:${col}`) || { value: '', formula: '' }; }
    seed(row, col, value, formula = '') { this.cells.set(`${row}:${col}`, { value, formula }); }
    row(row, width) { return Array.from({ length: width }, (_, index) => this.cell(row, index + 1).value); }
    getMaxRows() { return this.maxRows; }
    getRange(row, col, height = 1, width = 1) {
      const sheet = this;
      const range = { sheet: sheet.name, row, col, height, width,
        getValues() { return Array.from({ length: height }, (_, r) => Array.from({ length: width }, (_, c) => sheet.cell(row + r, col + c).value)); },
        getFormulas() { return Array.from({ length: height }, (_, r) => Array.from({ length: width }, (_, c) => sheet.cell(row + r, col + c).formula)); },
        setNumberFormat(format) { app.formats.push({ sheet: sheet.name, row, col, height, width, format }); return range; },
        setValues(values) {
          assert.equal(values.length, height); for (const cells of values) assert.equal(cells.length, width);
          const write = { sheet: sheet.name, row, col, height, width, values: values.map(cells => Array.from(cells)) };
          app.hook?.('before', write); app.writes.push(write);
          values.forEach((cells, r) => cells.forEach((value, c) => {
            // Sheets interprets a leading apostrophe as literal text, and '=' as a formula.
            const formula = typeof value === 'string' && value.startsWith('=') ? value : '';
            const stored = typeof value === 'string' && value.startsWith("'") ? value.slice(1) : value;
            sheet.seed(row + r, col + c, formula ? '' : stored, formula);
          }));
          app.hook?.('after', write); return range;
        }
      };
      return range;
    }
  }
  app.sheets = Object.fromEntries(['Inquiries', 'Captured forms', 'Submissions', 'Sync status'].map(name => [name, new Sheet(name)]));
  const ui = { Button: { OK: 'OK' }, ButtonSet: { OK_CANCEL: 'OK_CANCEL' },
    prompt: () => ({ getSelectedButton: () => app.promptCancel ? 'CANCEL' : 'OK', getResponseText: () => KEY }) };
  app.context = vm.createContext({ Date: Clock, JSON, Math, Object, Array, String, Number, RegExp, Error, isFinite,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: name => app.sheets[name] || null }), getUi: () => ui, flush: () => app.flush?.() },
    PropertiesService: { getScriptProperties: () => app.shared, getUserProperties: () => app.personal },
    LockService: { getScriptLock: () => ({ tryLock() { if (app.held || app.lockDenied) return false; app.held = true; return true; }, releaseLock() { app.held = false; app.released++; } }) },
    Utilities: { DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' }, getUuid: () => 'synthetic-owner',
      computeDigest: (_algorithm, text) => Array.from(createHash('sha256').update(text).digest()).map(n => n > 127 ? n - 256 : n) },
    UrlFetchApp: { fetch(url, options) {
      app.fetches.push({ url, options, reservedAttempts: JSON.parse(app.shared.getProperty('CAPTURE_ATTEMPTS') || '[]') });
      const next = app.responses.length ? app.responses.shift() : { body: archive(records) };
      if (next.error) throw next.error;
      return { getResponseCode: () => next.status ?? 200, getContentText: () => typeof next.body === 'string' ? next.body : JSON.stringify(next.body) };
    } },
    ScriptApp: { getProjectTriggers: () => app.triggers.slice(), deleteTrigger: trigger => { app.triggers.splice(app.triggers.indexOf(trigger), 1); },
      newTrigger(handler) { const builder = { timeBased: () => builder, everyHours(hours) { builder.hours = hours; return builder; },
        create() { const trigger = { getHandlerFunction: () => handler, hours: builder.hours }; app.triggers.push(trigger); return trigger; } }; return builder; } }
  });
  vm.runInContext(coreSource + '\n' + adapterSource, app.context);
  for (const [name, headers] of [['Inquiries', app.context.PBRU_SYNC.inquiryHeaders], ['Captured forms', app.context.PBRU_SYNC.captureHeaders], ['Submissions', app.context.PBRU_SYNC.submissionHeaders]]) {
    headers.forEach((header, col) => app.sheets[name].seed(7, col + 1, header));
  }
  for (let row = 8; row <= 1007; row++) {
    app.sheets.Inquiries.seed(row, 13, '', `=IF(A${row}="","","Record check")`);
    app.sheets.Inquiries.seed(row, 15, '', `=COUNTIF(Submissions!B8:B1007,A${row})`);
  }
  app.sync = () => app.context.syncQuoteArchive();
  app.captureRows = () => Array.from({ length: 1000 }, (_, i) => app.sheets['Captured forms'].row(i + 8, 28)).filter(row => row[0]);
  app.inquiryRows = () => Array.from({ length: 1000 }, (_, i) => app.sheets.Inquiries.row(i + 8, 19)).filter(row => row[0]);
  app.result = () => app.shared.getProperty('CAPTURE_LAST_RESULT');
  app.attempts = () => JSON.parse(app.shared.getProperty('CAPTURE_ATTEMPTS') || '[]');
  app.seedInquiry = (id, row = 8, extra = {}) => {
    app.sheets.Inquiries.seed(row, 1, id);
    for (const [col, value] of Object.entries(extra)) app.sheets.Inquiries.seed(row, Number(col), value);
  };
  return app;
}
function fails(work, code) { assert.throws(work, error => error.captureCode === code && error.message === 'Inquiry capture: ' + code); }
function formulaSnapshot(app) { return [13, 15].map(col => Array.from({ length: 1000 }, (_, i) => app.sheets.Inquiries.cell(i + 8, col).formula)); }
function rawWrite(app, sheet, row, col) {
  return app.writes.flatMap(write => write.sheet === sheet && row >= write.row && row < write.row + write.height && col >= write.col && col < write.col + write.width
    ? [write.values[row - write.row][col - write.col]] : []).at(-1);
}

test('repeat archive creates one capture/inquiry, leaves existing formulas and the historical email ledger untouched', () => {
  const app = boot({ records: [record({ Reference: REF, 'Trip date': '2026-11-12', 'Recorded referrer': 'www.partybusrus.com' })] });
  app.sheets.Submissions.seed(8, 1, 'synthetic-mailbox-record');
  const formulas = formulaSnapshot(app), emails = plain([...app.sheets.Submissions.cells]);
  app.sync(); app.sync();
  const [capture] = app.captureRows(), [inquiry] = app.inquiryRows();
  assert.equal(app.captureRows().length, 1); assert.equal(app.inquiryRows().length, 1);
  assert.equal(inquiry[0], 'FS-' + capture[0]); assert.equal(capture[3], inquiry[0]);
  assert.equal(inquiry[4], 'Unknown'); assert.equal(inquiry[5], 'Provider record'); assert.equal(inquiry[6], ''); assert.equal(inquiry[9], ''); assert.equal(inquiry[10], '');
  assert.equal(inquiry[15], 'Inquiry'); assert.equal(inquiry[17], 'Own-site referrer');
  assert.equal(inquiry[8].toISOString(), '2026-11-12T12:00:00.000Z');
  assert.deepEqual(formulaSnapshot(app), formulas); assert.deepEqual(plain([...app.sheets.Submissions.cells]), emails);
  assert.equal(app.writes.some(write => write.sheet === 'Submissions'), false);
  assert.match(app.result(), /^Success: 0 new archive records; 1 provider records checked$/);
});

test('historical exact UUID links without overwriting outcomes, notes, money or test exclusion', () => {
  const app = boot({ records: [record({ Reference: REF }, '2026-10-01 10:00:00.000000')] });
  app.seedInquiry(REF, 8, { 4: 'Existing private reference', 7: 'Booked', 10: 1500, 11: 1200, 12: 'Owner note', 16: 'Test' });
  const before = plain([...app.sheets.Inquiries.cells]);
  app.sync();
  assert.equal(app.captureRows()[0][3], REF); assert.equal(app.captureRows()[0][4], 'Linked to existing inquiry');
  assert.deepEqual(plain([...app.sheets.Inquiries.cells]), before); assert.equal(app.inquiryRows().length, 1);
});

test('historical reference can link through the preserved email ledger without guessing contact matches', () => {
  const app = boot({ records: [record({ Reference: REF }, '2026-10-01 10:00:00.000000')] });
  app.seedInquiry('MAIL-SYNTHETIC'); app.sheets.Submissions.seed(8, 2, 'MAIL-SYNTHETIC'); app.sheets.Submissions.seed(8, 8, REF);
  app.sync(); assert.equal(app.captureRows()[0][3], 'MAIL-SYNTHETIC'); assert.equal(app.inquiryRows().length, 1);
});

test('pre-cutover unmatched records and the exact cutover boundary remain unlinked review records', () => {
  const app = boot({ records: [record({}, '2026-10-01 10:00:00.000000'), record({ name: 'At boundary' }, '2026-10-08 12:00:00.000000')] });
  app.seedInquiry('existing-same-contact', 8, { 4: 'Synthetic Customer' }); app.sync();
  assert.equal(app.captureRows().length, 2); assert.equal(app.inquiryRows().length, 1);
  for (const row of app.captureRows()) { assert.equal(row[3], ''); assert.equal(row[4], 'Review: historical capture needs matching'); }
});

test('absent versus explicitly blank metadata remains distinct and neither invents acquisition', () => {
  const app = boot({ records: [record(), record({ name: 'Explicit blank', source_referrer: '', utm_source: '' })] }); app.sync();
  assert.equal(app.captureRows()[0][20], 'Not recorded'); assert.equal(app.captureRows()[0][21], 'Not recorded');
  assert.equal(app.captureRows()[1][20], ''); assert.equal(app.captureRows()[1][21], '');
  for (const row of app.inquiryRows()) { assert.equal(row[4], 'Unknown'); assert.equal(row[17], 'Blank / absent'); }
});

test('customer formula-like text is written literally while original values survive in raw JSON', () => {
  const values = { name: '=IMPORTXML("https://example.test","x")', phone: '+1234', notes: '\t=1+1', source_referrer: '@example', destinations: '-1+2' };
  const app = boot({ records: [record(values)] }); app.sync();
  assert.equal(rawWrite(app, 'Captured forms', 8, 7), "'" + values.name);
  assert.equal(rawWrite(app, 'Captured forms', 8, 9), "'" + values.phone);
  assert.equal(rawWrite(app, 'Captured forms', 8, 19), "'" + values.notes);
  assert.equal(rawWrite(app, 'Inquiries', 8, 4), "'" + values.name);
  assert.deepEqual(JSON.parse(app.captureRows()[0][27]), record(values).form_data);
  for (const sheet of [app.sheets['Captured forms'], app.sheets.Inquiries]) {
    for (const [key, cell] of sheet.cells) if (cell.formula) assert.ok(sheet.name === 'Inquiries' && /:(13|15)$/.test(key), key);
  }
});

test('failed fetches consume the same four-attempt rolling budget as manual successful syncs', () => {
  const app = boot(); app.responses.push({ error: new Error('private body ' + KEY) }, { status: 503, body: 'private response' });
  fails(app.sync, 'PROVIDER_FETCH_FAILED'); fails(app.sync, 'PROVIDER_HTTP_ERROR'); app.sync(); app.sync(); app.sync();
  assert.equal(app.fetches.length, 4); assert.equal(app.attempts().length, 4); assert.match(app.result(), /^Deferred:/);
  app.now += 86400000 - 1; app.sync(); assert.equal(app.fetches.length, 4);
  app.now++; app.sync(); assert.equal(app.fetches.length, 5); assert.equal(app.attempts().length, 1);
  assert.equal(app.held, false);
});

test('attempt is reserved before network and redirects are never followed', () => {
  const app = boot(); app.responses.push({ status: 302, body: 'https://outside.example/private' });
  fails(app.sync, 'PROVIDER_HTTP_ERROR'); assert.equal(app.attempts().length, 1);
  assert.deepEqual(app.fetches[0].reservedAttempts, [NOW]);
  assert.equal(app.fetches[0].options.followRedirects, false); assert.equal(app.fetches[0].options.muteHttpExceptions, true);
  assert.equal(app.captureRows().length, 0); assert.equal(app.shared.getProperty('CAPTURE_LAST_SUCCESS'), null);
  assert.deepEqual(manifest.urlFetchWhitelist, ['https://formsubmit.co/api/get-submissions/']);
});

test('unexpected service errors and provider data errors do not leak response text, key or customer values', () => {
  for (const response of [{ error: new Error('secret ' + KEY + ' customer@example.test') }, { body: '{private-body:' + KEY }, { status: 500, body: 'customer@example.test' }]) {
    const app = boot(); app.responses.push(response); assert.throws(app.sync, /^Error: Inquiry capture: PROVIDER_/);
    const exposed = JSON.stringify([...app.shared.data]) + JSON.stringify(app.sheets['Sync status'].row(6, 2));
    assert.doesNotMatch(exposed, /synthetic_api_key|customer@example|private-body/); assert.equal(app.captureRows().length, 0);
  }
});

test('malformed request budget fails closed without a provider request', () => {
  for (const value of ['not-json', '{}', JSON.stringify([NOW + 1]), JSON.stringify(['123'])]) {
    const app = boot(); app.shared.setProperty('CAPTURE_ATTEMPTS', value); fails(app.sync, 'REQUEST_BUDGET_INVALID'); assert.equal(app.fetches.length, 0);
  }
});

test('caller owner mismatch and concurrent execution are rejected before any fetch or mutation', () => {
  const app = boot(); app.personal.setProperty('CAPTURE_OWNER_TOKEN', 'other-owner'); fails(app.sync, 'RUN_AS_CONFIGURED_OWNER');
  assert.equal(app.fetches.length, 0); assert.equal(app.writes.length, 0); assert.equal(app.held, false);
  app.personal.setProperty('CAPTURE_OWNER_TOKEN', 'synthetic-owner'); app.lockDenied = true; fails(app.sync, 'SYNC_ALREADY_RUNNING');
  assert.equal(app.fetches.length, 0);
});

for (const point of ['after-ledger', 'before-inquiry', 'after-inquiry', 'before-link', 'after-link']) {
  test('partial-write retry recovers once without an incomplete inquiry: ' + point, () => {
    const app = boot({ records: [record({ Reference: REF })] }); const formulas = formulaSnapshot(app); let fired = false;
    app.hook = (phase, write) => {
      const hit = point === 'after-ledger' ? phase === 'after' && write.sheet === 'Captured forms' && write.col === 1
        : point === 'before-inquiry' ? phase === 'before' && write.sheet === 'Inquiries' && write.col === 1
        : point === 'after-inquiry' ? phase === 'after' && write.sheet === 'Inquiries' && write.col === 1
        : point === 'before-link' ? phase === 'before' && write.sheet === 'Captured forms' && write.col === 4
        : phase === 'after' && write.sheet === 'Captured forms' && write.col === 4;
      if (!fired && hit) { fired = true; throw new Error('private service exception'); }
    };
    fails(app.sync, 'SYNC_FAILED'); assert.equal(fired, true); app.hook = null;
    // Saved ledger rows must recover even if the provider no longer returns them.
    if (point === 'after-ledger') app.responses.push({ body: archive([]) });
    app.sync(); app.sync();
    assert.equal(app.captureRows().length, 1); assert.equal(app.inquiryRows().length, 1);
    const [capture] = app.captureRows(), [inquiry] = app.inquiryRows();
    assert.equal(capture[3], inquiry[0]); assert.equal(inquiry[15], 'Inquiry'); assert.equal(inquiry[4], 'Unknown');
    assert.equal(inquiry[6], ''); assert.equal(inquiry[10], ''); assert.deepEqual(formulaSnapshot(app), formulas);
    assert.equal(app.held, false); assert.match(app.result(), /^Success:/);
  });
}

test('two provider records reusing one reference remain review-only and do not create two inquiries', () => {
  const app = boot({ records: [record({ Reference: REF }), record({ Reference: REF, notes: 'Distinct payload' })] }); app.sync();
  assert.equal(app.captureRows().length, 2); assert.equal(app.inquiryRows().length, 0);
  for (const row of app.captureRows()) assert.equal(row[4], 'Review: reference used by multiple captures');
});

test('a reused reference discovered later flags both records but preserves the already-created inquiry', () => {
  const app = boot(); app.responses.push({ body: archive([record({ Reference: REF })]) }, { body: archive([record({ Reference: REF }), record({ Reference: REF, notes: 'New record' })]) });
  app.sync(); app.sheets.Inquiries.seed(8, 7, 'Quoted'); app.sheets.Inquiries.seed(8, 10, 1500); app.sync();
  assert.equal(app.inquiryRows().length, 1); assert.equal(app.inquiryRows()[0][6], 'Quoted'); assert.equal(app.inquiryRows()[0][9], 1500);
  for (const row of app.captureRows()) assert.equal(row[4], 'Review: reference used by multiple captures');
});

test('ambiguous historical references are not linked and missing linked inquiries stay visible', () => {
  const app = boot({ records: [record({ Reference: REF })] }); app.seedInquiry('historical-a'); app.seedInquiry('historical-b', 9);
  for (const [row, id] of [[8, 'historical-a'], [9, 'historical-b']]) { app.sheets.Submissions.seed(row, 2, id); app.sheets.Submissions.seed(row, 8, REF); }
  app.sync(); assert.equal(app.captureRows()[0][4], 'Review: ambiguous historical reference'); assert.equal(app.inquiryRows().length, 2);
  app.sheets['Captured forms'].seed(8, 4, 'missing-owner-link'); app.sync(); assert.equal(app.captureRows()[0][4], 'Review: linked inquiry is missing');
});

test('full capture capacity fails visibly without overwriting or creating an inquiry', () => {
  const app = boot({ records: [record()] });
  for (let i = 0; i < 1000; i++) app.sheets['Captured forms'].seed(i + 8, 1, i.toString(16).padStart(64, '0'));
  fails(app.sync, 'CAPTURE_CAPACITY_REACHED'); assert.equal(app.captureRows().length, 1000); assert.equal(app.inquiryRows().length, 0);
  assert.match(app.result(), /Failed: CAPTURE_CAPACITY_REACHED/); assert.equal(app.shared.getProperty('CAPTURE_LAST_SUCCESS'), null);
});

test('full inquiry capacity keeps the pending capture for a safe retry after space is available', () => {
  const app = boot({ records: [record()] }); for (let i = 0; i < 1000; i++) app.seedInquiry('occupied-' + i, i + 8);
  fails(app.sync, 'INQUIRY_CAPACITY_REACHED'); assert.equal(app.captureRows().length, 1); assert.equal(app.captureRows()[0][4], 'Pending');
  app.sheets.Inquiries.seed(1007, 1, ''); app.sync(); assert.equal(app.inquiryRows().length, 1000); assert.match(app.captureRows()[0][3], /^FS-/);
});

test('a partially occupied manual inquiry row is skipped, and missing template formulas fail visibly', () => {
  const app = boot({ records: [record()] }); app.sheets.Inquiries.seed(8, 12, 'Owner has begun entering a record'); app.sync();
  assert.equal(app.sheets.Inquiries.cell(8, 1).value, ''); assert.match(app.sheets.Inquiries.cell(9, 1).value, /^FS-/);
  const bad = boot({ records: [record()] }); bad.sheets.Inquiries.seed(8, 13, ''); fails(bad.sync, 'INQUIRY_FORMULAS_MISSING');
  assert.equal(bad.inquiryRows().length, 0); assert.equal(bad.captureRows().length, 1);
});

test('duplicate stable IDs and changed headers fail closed instead of overwriting records', () => {
  const app = boot({ records: [record()] }); app.seedInquiry('duplicate', 8); app.seedInquiry('duplicate', 9); fails(app.sync, 'DUPLICATE_INQUIRY_IDS');
  assert.equal(app.captureRows().length, 0);
  const bad = boot(); bad.sheets.Inquiries.seed(7, 1, 'Changed header'); fails(bad.sync, 'TRACKER_HEADERS_CHANGED'); assert.equal(bad.fetches.length, 0);
});

test('changed historical email columns or capacity cannot silently mislink request references', () => {
  const app = boot({ records: [record({ Reference: REF })] });
  app.sheets.Submissions.seed(7, 8, 'Moved request reference');
  fails(app.sync, 'TRACKER_HEADERS_CHANGED'); assert.equal(app.fetches.length, 0); assert.equal(app.writes.length, 0);
  const short = boot(); short.sheets.Submissions.maxRows = 1006;
  fails(short.sync, 'TRACKER_CAPACITY_CHANGED'); assert.equal(short.fetches.length, 0); assert.equal(short.writes.length, 0);
});

test('retention gaps remain explicitly flagged after a successful current fetch', () => {
  const app = boot(); app.shared.setProperty('CAPTURE_LAST_SUCCESS', '2026-08-01T12:00:00Z'); app.sync();
  assert.match(app.shared.getProperty('CAPTURE_RETENTION_WARNING'), /gap exceeded.*30-day/); app.sync();
  assert.match(app.shared.getProperty('CAPTURE_RETENTION_WARNING'), /cannot recover that gap/);
});

test('configuration stores the key only in owner properties and never schedules automatically', () => {
  const app = boot({ configured: false }); app.context.configureInquiryCapture();
  assert.equal(app.personal.getProperty('FORMSUBMIT_API_KEY'), KEY); assert.equal(app.shared.getProperty('FORMSUBMIT_API_KEY'), null);
  assert.equal(app.triggers.length, 0); assert.equal(app.fetches.length, 0); assert.doesNotMatch(JSON.stringify(app.writes), new RegExp(KEY));
  const start = app.shared.getProperty('CAPTURE_START_UTC'); app.now += 1000; app.context.configureInquiryCapture(); assert.equal(app.shared.getProperty('CAPTURE_START_UTC'), start);
  fails(() => app.context.enableAutomaticCapture(), 'SUCCESSFUL_SYNC_REQUIRED'); assert.equal(app.triggers.length, 0);
});

test('enable is idempotent, removes only redundant capture triggers, and disable preserves unrelated jobs', () => {
  const app = boot(); app.sync(); assert.equal(app.triggers.length, 0);
  const unrelated = { getHandlerFunction: () => 'ownerUnrelatedJob' }; app.triggers.push(unrelated);
  app.context.enableAutomaticCapture(); app.context.enableAutomaticCapture();
  assert.equal(app.triggers.length, 2); assert.equal(app.triggers.find(trigger => trigger !== unrelated).hours, 6);
  app.triggers.push({ getHandlerFunction: () => 'syncQuoteArchive' }); app.context.enableAutomaticCapture(); assert.equal(app.triggers.length, 2);
  app.context.disableAutomaticCapture(); app.context.disableAutomaticCapture(); assert.deepEqual(app.triggers, [unrelated]);
  assert.equal(app.shared.getProperty('CAPTURE_SCHEDULE'), 'Disabled');
});

test('owner mismatch cannot configure, enable or disable the owner schedule', () => {
  const app = boot(); app.sync(); app.context.enableAutomaticCapture(); const before = app.triggers.slice();
  app.personal.setProperty('CAPTURE_OWNER_TOKEN', 'other-owner');
  for (const action of ['configureInquiryCapture', 'enableAutomaticCapture', 'disableAutomaticCapture']) fails(() => app.context[action](), 'RUN_AS_CONFIGURED_OWNER');
  assert.deepEqual(app.triggers, before); assert.equal(app.held, false);
});
