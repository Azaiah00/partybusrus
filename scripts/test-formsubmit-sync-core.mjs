import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../integrations/formsubmit-sheet-sync/Core.gs', import.meta.url), 'utf8'), context);
const core = context.FormSubmitSyncCore;
const hash = value => createHash('sha256').update(value, 'utf8').digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const archive = submissions => ({success: true, submissions});
function record(data = {}, overrides = {}) {
  return {form_url: 'https://www.partybusrus.com/quote', form_data: {name: 'Synthetic Example', email: 'example@example.test', ...data},
    submitted_at: {date: '2026-10-07 18:04:15.123456', timezone_type: 3, timezone: 'UTC'}, ...overrides};
}
const normalize = rows => core.normalizeArchive(archive(rows), hash);
function fails(work, code) {assert.throws(work, error => error.code === 'FORM_SYNC_' + code && !/example@test|secret-token|private-body/.test(error.message));}

test('official archive timestamps become UTC text without losing microseconds', () => {
  const [result] = core.normalizeArchive(JSON.stringify(archive([record()])), hash);
  assert.equal(result.submittedAtUtc, '2026-10-07T18:04:15.123456Z');
  assert.deepEqual(plain(result.submittedAtRaw), {date: '2026-10-07 18:04:15.123456', timezone: 'UTC', timezone_type: 3});
  assert.match(result.recordKey, /^[a-f0-9]{64}$/);
  const leap = normalize([record({}, {submitted_at: {date: '2024-02-29 00:00:00.000001', timezone_type: 3, timezone: 'UTC'}})])[0];
  assert.equal(leap.submittedAtUtc, '2024-02-29T00:00:00.000001Z');
});

test('trip dates recognize only validated ISO dates and the exact current English display format', () => {
  for (const [value, expected] of [['November 6, 2026', '2026-11-06'], ['2026-11-06', '2026-11-06'], ['February 29, 2024', '2024-02-29'],
    ['2000-02-29', '2000-02-29'], ['December 31, 2099', '2099-12-31'], ['January 1, 2026', '2026-01-01']]) assert.equal(core.tripDateIso(value), expected);
  for (const value of ['', undefined, null, '11/06/2026', '6 November 2026', 'november 6, 2026', 'November 06, 2026', 'February 29, 2026',
    'February 29, 2100', '2026-04-31', '2026-13-01', '0000-01-01', '2026-11-06T00:00:00Z', '=TODAY()']) assert.equal(core.tripDateIso(value), '', String(value));
});

test('current readable payload maps every canonical field and preserves full original evidence', () => {
  const data = {Phone: '+1 202-555-0147', 'Preferred contact': 'Text', 'Trip date': 'November 6, 2026', 'Pickup time': '6:30 PM',
    Passengers: '21–24', Duration: '4 hours', Event: 'Birthday', Vehicle: 'Diamond 24 · up to 24 passengers', Pickup: 'Arlington, VA',
    Stops: 'Synthetic venue', Notes: 'Synthetic note', 'Recorded source': 'newsletter', 'Recorded referrer': 'chatgpt.com',
    'Landing page': '/blog/how-much-does-a-party-bus-cost-dmv', Campaign: 'Medium: email; Campaign: fall_trips; Content: hero-a; Term: bus',
    Reference: 'synthetic-reference-1234', 'Unknown custom field': ['one', 'two']};
  const [result] = normalize([record(data)]);
  assert.deepEqual(plain(result.fields), {name: 'Synthetic Example', email: 'example@example.test', phone: '+1 202-555-0147', contact_pref: 'Text',
    event_date: 'November 6, 2026', pickup_time: '6:30 PM', headcount: '21–24', hours: '4 hours', event_type: 'Birthday',
    vehicle_preference: 'Diamond 24 · up to 24 passengers', pickup_location: 'Arlington, VA', destinations: 'Synthetic venue', notes: 'Synthetic note',
    source_page: '/blog/how-much-does-a-party-bus-cost-dmv', source_referrer: 'chatgpt.com', utm_source: 'newsletter', utm_medium: 'email',
    utm_campaign: 'fall_trips', utm_content: 'hero-a', utm_term: 'bus', request_reference: 'synthetic-reference-1234'});
  assert.equal(result.requestReference, 'synthetic-reference-1234');
  assert.deepEqual(JSON.parse(result.rawDataJson), record(data).form_data);
});

test('legacy raw fields retain supplied values; importer invents no booking or attribution claims', () => {
  const data = {phone: '202-555-0147', contact_pref: 'call', event_date: '2026-11-06', pickup_time: '18:30', headcount: '21-24', hours: 'unsure',
    event_type: 'Birthday', vehicle_preference: 'bus-24pax', pickup_location: 'Synthetic pickup', destinations: '', notes: 'TEST booked paid $9999 organic',
    source_page: '/quote', source_referrer: 'www.partybusrus.com', utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '',
    request_reference: '  exact original reference  '};
  const [result] = normalize([record(data)]);
  for (const [key, value] of Object.entries(data)) assert.equal(result.fields[key], value, key);
  assert.equal(result.requestReference, '  exact original reference  ');
  assert.deepEqual(Object.keys(result.fields).sort(), Array.from(core.fieldNames).sort());
  for (const invented of ['status', 'booked', 'revenue', 'isTest', 'organic', 'sourceCategory']) assert.equal(invented in result, false);
});

test('absent, blank, partial and unknown attribution stay distinct in raw evidence', () => {
  const results = normalize([record(), record({utm_source: '', utm_medium: ''}), record({Campaign: 'Content: footer-a'}), record({'Recorded referrer': 'unrecognized.example', Campaign: ''})]);
  assert.equal(results[0].fields.utm_source, '');assert.equal(results[1].fields.utm_source, '');
  assert.equal(results[0].fieldPresence.utm_source, false);assert.equal(results[1].fieldPresence.utm_source, true);
  assert.equal(Object.hasOwn(JSON.parse(results[0].rawDataJson), 'utm_source'), false);
  assert.equal(Object.hasOwn(JSON.parse(results[1].rawDataJson), 'utm_source'), true);
  assert.equal(results[2].fields.utm_content, 'footer-a');assert.equal(results[2].fields.utm_medium, '');
  assert.equal(results[2].fieldPresence.utm_content, true);assert.equal(results[2].fieldPresence.utm_medium, false);
  assert.equal(results[3].fields.source_referrer, 'unrecognized.example');assert.equal(results[3].fields.utm_medium, '');
  assert.equal(results[3].fieldPresence.source_referrer, true);assert.equal(results[3].fieldPresence.utm_medium, false);
  assert.notEqual(results[0].recordKey, results[1].recordKey);
});

test('fingerprint includes exact timestamp, form URL and complete data with stable key ordering', () => {
  const first = record({custom: {b: 2, a: 1}, Reference: 'same'});
  const reordered = {submitted_at: {timezone: 'UTC', timezone_type: 3, date: first.submitted_at.date}, form_data: {Reference: 'same', custom: {a: 1, b: 2}, email: 'example@example.test', name: 'Synthetic Example'}, form_url: first.form_url};
  assert.equal(core.canonicalRecordInput(first), core.canonicalRecordInput(reordered));
  assert.match(core.canonicalRecordInput(first), /^pbru-formsubmit-v1\n\{/);
  const base = normalize([first])[0].recordKey;
  assert.equal(normalize([reordered])[0].recordKey, base);
  for (const changed of [record({custom: {b: 3, a: 1}, Reference: 'same'}), {...first, form_url: first.form_url + '?bus=bus-24pax'},
    {...first, submitted_at: {...first.submitted_at, date: '2026-10-07 18:04:15.123457'}}]) assert.notEqual(normalize([changed])[0].recordKey, base);
});

test('repeated archives deduplicate across previous imports and within a batch', () => {
  const records = normalize([record({Reference: 'one'}), record({Reference: 'two'})]);
  const initial = core.planImport([records[0], records[0], records[1]], []);
  assert.equal(initial.newRecords.length, 2);assert.equal(initial.duplicateCount, 1);
  const existing = initial.newRecords.map(({recordKey, requestReference}) => ({recordKey, requestReference}));
  const repeat = core.planImport(records, existing);
  assert.equal(repeat.newRecords.length, 0);assert.equal(repeat.duplicateCount, 2);assert.equal(repeat.referenceConflicts.length, 0);
});

test('same reference with changed payload is retained separately and flags all related record keys', () => {
  const rows = normalize([record({Reference: 'same-reference', Notes: 'Original details'}), record({Reference: 'same-reference', Notes: 'Changed details'})]);
  const first = core.planImport(rows, []);
  assert.equal(first.newRecords.length, 2);assert.equal(first.newRecords.every(row => row.referenceConflict), true);
  assert.deepEqual(plain(first.referenceConflicts), [{requestReference: 'same-reference', recordKeys: rows.map(row => row.recordKey)}]);
  const previous = [{recordKey: rows[0].recordKey, requestReference: 'same-reference'}];
  const next = core.planImport(rows, previous);
  assert.equal(next.newRecords.length, 1);assert.equal(next.newRecords[0].referenceConflict, true);assert.equal(next.duplicateCount, 1);
  assert.deepEqual(plain(next.referenceConflicts[0].recordKeys), rows.map(row => row.recordKey));
  assert.equal(Object.hasOwn(rows[0], 'referenceConflict'), false);
});

test('empty references are not grouped and prototype-like references are safe', () => {
  const empty = core.planImport(normalize([record(), record({notes: 'Different'})]), []);
  assert.equal(empty.newRecords.length, 2);assert.equal(empty.referenceConflicts.length, 0);
  const names = core.planImport(normalize([record({Reference: '__proto__'}), record({Reference: '__proto__', Notes: 'Changed'})]), []);
  assert.equal(names.referenceConflicts[0].requestReference, '__proto__');
  const special = JSON.parse('{"name":"Synthetic","__proto__":{"polluted":true},"constructor":"retained"}');
  const row = normalize([record({}, {form_data: special})])[0];
  assert.equal(JSON.parse(row.rawDataJson).__proto__.polluted, true);assert.equal({}.polluted, undefined);
});

test('only known production quote URLs or origin-only provider referrers are accepted', () => {
  for (const url of ['https://partybusrus.com', 'https://www.partybusrus.com/', 'https://partybusrus.com:443/quote', 'https://www.partybusrus.com/quote/', 'https://partybusrus.com/quote.html?bus=bus-24pax']) assert.equal(normalize([record({}, {form_url: url})])[0].formUrl, url);
  for (const url of ['http://www.partybusrus.com/quote', 'https://partybusrus.com.evil.example/quote', 'https://evilpartybusrus.com/quote', 'https://user@partybusrus.com/quote',
    'https://partybusrus.com:444/quote', 'https://preview.vercel.app/quote', 'https://www.partybusrus.com/contact', 'https://www.partybusrus.com/quote#x',
    'https://www.partybusrus.com/quote\\evil', 'https://www.partybusrus.com/quote\n', 'https://www.partybusrus.com/%71uote']) fails(() => normalize([record({}, {form_url: url})]), 'FORM_URL');
});

test('invalid calendar values and absent or unsupported timezone metadata are rejected without guessing', () => {
  for (const date of ['2026-02-29 00:00:00.000000', '2100-02-29 00:00:00.000000', '0000-01-01 00:00:00.000000', '2026-13-01 00:00:00.000000',
    '2026-01-00 00:00:00.000000', '2026-10-07 24:00:00.000000', '2026-10-07 23:60:00.000000', '2026-10-07 23:59:60.000000', '2026-10-07T18:00:00Z']) fails(() => normalize([record({}, {submitted_at: {date, timezone_type: 3, timezone: 'UTC'}})]), 'TIMESTAMP_DATE');
  for (const stamp of [null, {}, {date: '2026-10-07 18:00:00.000000'}, {date: '2026-10-07 18:00:00.000000', timezone_type: 3, timezone: 'America/New_York'},
    {date: '2026-10-07 18:00:00.000000', timezone_type: '3', timezone: 'UTC'}]) fails(() => normalize([record({}, {submitted_at: stamp})]), 'TIMESTAMP_ZONE');
});

test('malformed archive responses fail visibly with sanitized errors and no partial result', () => {
  for (const body of [null, [], {}, {success: 'true', submissions: []}, {success: false, message: 'secret-token private-body', submissions: []}, {success: true, submissions: {}}]) fails(() => core.normalizeArchive(body, hash), 'RESPONSE_SHAPE');
  fails(() => core.normalizeArchive('private-body secret-token {', hash), 'RESPONSE_JSON');
  fails(() => normalize([record(), record({}, {form_data: null})]), 'RECORD_SHAPE');
  fails(() => normalize([record({}, {form_data: {}})]), 'DATA_EMPTY');
  fails(() => normalize([record({Notes: {private: 'private-body'}})]), 'FIELD_TYPE');
  assert.deepEqual(plain(core.normalizeArchive({success: true, submissions: []}, hash)), []);
  let result;
  assert.throws(() => {result = normalize([record(), record({}, {form_url: 'https://private-body.example/'})]);}, error => error.recordIndex === 1 && error.message === 'FORM_SYNC_FORM_URL at record 1');
  assert.equal(result, undefined);
});

test('alias conflicts and malformed campaign summaries cannot silently lose evidence', () => {
  fails(() => normalize([record({phone: 'one', Phone: 'two'})]), 'FIELD_CONFLICT');
  fails(() => normalize([record({Campaign: 'Medium: email', utm_medium: 'organic'})]), 'FIELD_CONFLICT');
  for (const Campaign of ['Source: google', 'Medium: email; Medium: social', 'Medium: email; private-body', 'Term: 1234567', 'Campaign: =SUM(A1)']) fails(() => normalize([record({Campaign})]), 'CAMPAIGN_FORMAT');
  const equal = normalize([record({phone: 'same', Phone: 'same'})])[0];assert.equal(equal.fields.phone, 'same');
});

test('raw JSON is capped without truncation; oversized or non-JSON values fail the batch', () => {
  fails(() => normalize([record({notes: 'x'.repeat(core.maxRawChars)})]), 'DATA_TOO_LARGE');
  fails(() => core.normalizeArchive(' '.repeat(5000001), hash), 'RESPONSE_TOO_LARGE');
  fails(() => normalize([record({custom: Infinity})]), 'DATA_TYPE');
  fails(() => normalize([record({custom: new Date()})]), 'DATA_TYPE');
  let nested = 'leaf';for (let i = 0; i < 14; i++) nested = {nested};
  fails(() => normalize([record({custom: nested})]), 'DATA_DEPTH');
  fails(() => core.normalizeArchive(archive(Array(5001).fill(record())), hash), 'TOO_MANY_RECORDS');
});

test('all untrusted text is formula-safe at the Sheet boundary without changing raw evidence', () => {
  for (const attack of ['=HYPERLINK("https://example.test","x")', '+SUM(A1)', '-1+2', '@SUM(A1)', '\t=IMPORTXML("x","y")', '\r\n=1', ' \u200b=1']) assert.equal(core.safeCell(attack), "'" + attack);
  for (const safe of ['', 'Plain text', "'=already literal", 'Text = does not start a formula']) assert.equal(core.safeCell(safe), safe);
  const data = {};for (const key of core.fieldNames) data[key] = '=SyntheticFormula()';
  const [row] = normalize([record(data)]);
  for (const key of core.fieldNames) assert.equal(core.safeCell(row.fields[key]), "'=SyntheticFormula()", key);
  assert.equal(JSON.parse(row.rawDataJson).name, '=SyntheticFormula()');assert.equal(core.safeCell(row.rawDataJson), row.rawDataJson);
  fails(() => core.safeCell(12), 'CELL_TYPE');fails(() => core.safeCell('x'.repeat(core.maxRawChars + 1)), 'CELL_TOO_LARGE');
});

test('hash and unexpected input errors never expose injected secrets or customer text', () => {
  fails(() => core.normalizeArchive(archive([record()]), () => {throw Error('secret-token private-body');}), 'HASH_FAILURE');
  fails(() => core.normalizeArchive(archive([record()]), () => 'secret-token'), 'HASH_RESULT');
  fails(() => core.normalizeArchive(archive([record()]), null), 'HASH_REQUIRED');
  const body = {};Object.defineProperty(body, 'success', {get() {throw Object.assign(Error('secret-token private-body'), {code: 'FORM_SYNC_RESPONSE_SHAPE'});}});
  fails(() => core.normalizeArchive(body, hash), 'UNEXPECTED_INPUT');
  const hostileError = {};Object.defineProperty(hostileError, 'code', {get() {throw Error('secret-token private-body');}});
  const hostileInput = {};Object.defineProperty(hostileInput, 'success', {get() {throw hostileError;}});
  fails(() => core.normalizeArchive(hostileInput, hash), 'UNEXPECTED_INPUT');
  const rows = normalize([record({Reference: 'one'})]);
  fails(() => core.planImport(rows, [{recordKey: rows[0].recordKey, requestReference: 'two'}]), 'KEY_CONFLICT');
  fails(() => core.planImport(rows, [{recordKey: 'invalid-secret-token', requestReference: 'private-body'}]), 'PLAN_RECORD');
});
