/* Pure normalization/planning core. No network, Sheet, logging, or credential access. */
var FormSubmitSyncCore = (function () {
  'use strict';
  var MAX_RESPONSE_CHARS = 5000000;
  var MAX_RAW_CHARS = 45000;
  var MAX_RECORDS = 5000;
  var errors = new WeakSet();
  var ALIASES = {
    name: 'name', email: 'email', phone: 'Phone', contact_pref: 'Preferred contact',
    event_date: 'Trip date', pickup_time: 'Pickup time', headcount: 'Passengers', hours: 'Duration',
    event_type: 'Event', vehicle_preference: 'Vehicle', pickup_location: 'Pickup', destinations: 'Stops', notes: 'Notes',
    source_page: 'Landing page', source_referrer: 'Recorded referrer', utm_source: 'Recorded source',
    utm_medium: 'utm_medium', utm_campaign: 'utm_campaign', utm_content: 'utm_content', utm_term: 'utm_term',
    request_reference: 'Reference'
  };
  var CAMPAIGN = {Medium: 'utm_medium', Campaign: 'utm_campaign', Content: 'utm_content', Term: 'utm_term'};
  function own(object, key) { return Object.prototype.hasOwnProperty.call(object, key); }
  function fail(code, index) {
    var error = new Error('FORM_SYNC_' + code + (typeof index === 'number' ? ' at record ' + index : ''));
    error.code = 'FORM_SYNC_' + code;
    if (typeof index === 'number') error.recordIndex = index;
    errors.add(error);
    throw error;
  }
  function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function guard(work) {
    try { return work(); } catch (error) {
      if (errors.has(error)) throw error;
      // Never surface provider bodies, customer values, injected hashing errors, or secrets.
      fail('UNEXPECTED_INPUT');
    }
  }
  function jsonValue(value, depth, index) {
    if (depth > 12) fail('DATA_DEPTH', index);
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (Array.isArray(value)) return value.map(function (item) { return jsonValue(item, depth + 1, index); });
    if (!object(value)) fail('DATA_TYPE', index);
    var prototype = Object.getPrototypeOf(value);
    if (prototype !== null && Object.getPrototypeOf(prototype) !== null) fail('DATA_TYPE', index);
    var result = Object.create(null);
    Object.keys(value).sort().forEach(function (key) {
      var descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !own(descriptor, 'value')) fail('DATA_TYPE', index);
      result[key] = jsonValue(descriptor.value, depth + 1, index);
    });
    return result;
  }
  function utcTimestamp(value, index) {
    if (!object(value) || value.timezone_type !== 3 || value.timezone !== 'UTC') fail('TIMESTAMP_ZONE', index);
    if (typeof value.date !== 'string') fail('TIMESTAMP_DATE', index);
    var parts = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{6})$/.exec(value.date);
    if (!parts) fail('TIMESTAMP_DATE', index);
    var year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
    var leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
        Number(parts[4]) > 23 || Number(parts[5]) > 59 || Number(parts[6]) > 59) fail('TIMESTAMP_DATE', index);
    // The documented archive timestamp explicitly supplies UTC. Preserve microseconds as text.
    return value.date.replace(' ', 'T') + 'Z';
  }
  function formUrl(value, index) {
    if (typeof value !== 'string' || value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(value)) fail('FORM_URL', index);
    // Provider referrer policies can reduce the original quote URL to its origin.
    // No credentials, alternate ports, fragments, lookalike hosts, preview hosts, or unknown forms.
    if (!/^https:\/\/(?:www\.)?partybusrus\.com(?::443)?(?:\/(?:quote(?:\.html)?\/?)?)?(?:\?[^#]*)?$/.test(value)) fail('FORM_URL', index);
    return value;
  }
  function checkedRecord(record, index) {
    if (!object(record) || !object(record.form_data)) fail('RECORD_SHAPE', index);
    var data = jsonValue(record.form_data, 0, index);
    var rawDataJson = JSON.stringify(data);
    if (rawDataJson.length > MAX_RAW_CHARS) fail('DATA_TOO_LARGE', index);
    if (Object.keys(data).length === 0) fail('DATA_EMPTY', index);
    return {form_url: formUrl(record.form_url, index), form_data: data,
      submitted_at: jsonValue(record.submitted_at, 0, index), submittedAtUtc: utcTimestamp(record.submitted_at, index), rawDataJson: rawDataJson};
  }
  function canonical(record) {
    return 'pbru-formsubmit-v1\n' + JSON.stringify(jsonValue({form_url: record.form_url, form_data: record.form_data, submitted_at: record.submitted_at}, 0));
  }
  function fieldsFrom(data, index) {
    var fields = Object.create(null), presence = Object.create(null);
    Object.keys(ALIASES).forEach(function (key) {
      var alias = ALIASES[key];
      // FormSubmit's delivered October 8 notification uses underscore labels.
      var names=[key,alias,alias.replace(/ /g,'_')].filter(function(name,i,all){return all.indexOf(name)===i&&own(data,name);});
      if(names.some(function(name){return typeof data[name]!=='string';}))fail('FIELD_TYPE',index);
      if(names.some(function(name){return data[name]!==data[names[0]];}))fail('FIELD_CONFLICT',index);
      fields[key] = names.length?data[names[0]]:'';
      presence[key] = names.length>0;
    });
    if (own(data, 'Campaign')) {
      if (typeof data.Campaign !== 'string') fail('FIELD_TYPE', index);
      if (data.Campaign !== '') {
        var seen = Object.create(null);
        data.Campaign.split('; ').forEach(function (part) {
          var match = /^(Medium|Campaign|Content|Term): ([A-Za-z0-9][A-Za-z0-9_-]{0,79})$/.exec(part);
          if (!match || /\d{7}/.test(match[2]) || own(seen, match[1])) fail('CAMPAIGN_FORMAT', index);
          seen[match[1]] = true;
          var key = CAMPAIGN[match[1]];
          if (own(data, key) && data[key] !== match[2]) fail('FIELD_CONFLICT', index);
          fields[key] = match[2];
          presence[key] = true;
        });
      }
    }
    return {fields: fields, presence: presence};
  }
  function normalizeArchive(body, sha256) {
    return guard(function () {
      if (typeof sha256 !== 'function') fail('HASH_REQUIRED');
      var response = body;
      if (typeof body === 'string') {
        if (body.length > MAX_RESPONSE_CHARS) fail('RESPONSE_TOO_LARGE');
        try { response = JSON.parse(body); } catch (_) { fail('RESPONSE_JSON'); }
      }
      if (!object(response) || response.success !== true || !Array.isArray(response.submissions)) fail('RESPONSE_SHAPE');
      if (response.submissions.length > MAX_RECORDS) fail('TOO_MANY_RECORDS');
      // Complete validation before returning any records: callers must not write a partial batch.
      return response.submissions.map(function (item, index) {
        var record = checkedRecord(item, index), mapped = fieldsFrom(record.form_data, index), fields = mapped.fields, digest;
        try { digest = sha256(canonical(record)); } catch (_) { fail('HASH_FAILURE', index); }
        if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) fail('HASH_RESULT', index);
        return {recordKey: digest, submittedAtUtc: record.submittedAtUtc, submittedAtRaw: record.submitted_at,
          formUrl: record.form_url, fields: fields, fieldPresence: mapped.presence, rawDataJson: record.rawDataJson, requestReference: fields.request_reference};
      });
    });
  }
  function planImport(records, existing) {
    return guard(function () {
      if (!Array.isArray(records) || !Array.isArray(existing)) fail('PLAN_SHAPE');
      var keys = Object.create(null), references = Object.create(null), newRecords = [], duplicateCount = 0;
      function remember(record, index) {
        if (!object(record) || typeof record.recordKey !== 'string' || !/^[a-f0-9]{64}$/.test(record.recordKey) || typeof record.requestReference !== 'string') fail('PLAN_RECORD', index);
        if (own(keys, record.recordKey)) {
          if (keys[record.recordKey] !== record.requestReference) fail('KEY_CONFLICT', index);
          return false;
        }
        keys[record.recordKey] = record.requestReference;
        if (record.requestReference !== '') {
          if (!own(references, record.requestReference)) references[record.requestReference] = [];
          references[record.requestReference].push(record.recordKey);
        }
        return true;
      }
      existing.forEach(function (record, index) { remember(record, index); });
      records.forEach(function (record, index) {
        if (remember(record, index)) newRecords.push(record); else duplicateCount += 1;
      });
      var referenceConflicts = Object.keys(references).sort().filter(function (reference) { return references[reference].length > 1; }).map(function (reference) {
        return {requestReference: reference, recordKeys: references[reference].slice()};
      });
      return {newRecords: newRecords.map(function (record) {
        var copy = Object.assign({}, record);
        copy.referenceConflict = record.requestReference !== '' && references[record.requestReference].length > 1;
        return copy;
      }), duplicateCount: duplicateCount, referenceConflicts: referenceConflicts};
    });
  }
  function safeCell(value) {
    if (typeof value !== 'string') fail('CELL_TYPE');
    if (value.length > MAX_RAW_CHARS) fail('CELL_TOO_LARGE');
    // Literal text for Sheets setValues and later CSV exports; preserve the source in raw JSON.
    return /^[\s\u0000-\u001f\u007f\u200b-\u200d\u2060\ufeff]*[=+\-@]/.test(value) ? "'" + value : value;
  }
  function tripDateIso(value) {
    if (typeof value !== 'string') return '';
    var iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value), year, month, day;
    if (iso) {
      year = Number(iso[1]); month = Number(iso[2]); day = Number(iso[3]);
    } else {
      // Exact quote.js readableDate output; never infer an ambiguous locale or timezone.
      var readable = /^(January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[12]\d|3[01]), (\d{4})$/.exec(value);
      if (!readable) return '';
      year = Number(readable[3]); day = Number(readable[2]);
      month = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(readable[1]) + 1;
    }
    var leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) return '';
    return String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }
  return Object.freeze({normalizeArchive: normalizeArchive, planImport: planImport, safeCell: safeCell,
    canonicalRecordInput: function (record) { return guard(function () { return canonical(checkedRecord(record)); }); },
    tripDateIso: tripDateIso, fieldNames: Object.freeze(Object.keys(ALIASES)), maxRawChars: MAX_RAW_CHARS});
})();
