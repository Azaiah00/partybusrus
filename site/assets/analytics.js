/* Party Bus R Us: consent-gated GA4 and minimal, local quote provenance. */
(function () {
  'use strict';
  if (window.PBRUAnalytics) return;

  var config = window.PBRU_ANALYTICS_CONFIG || {};
  var id = typeof config.measurementId === 'string' ? config.measurementId.trim() : '';
  var productionHost = /^(?:www\.)?partybusrus\.com$/.test(location.hostname);
  var configured = productionHost && /^G-[A-Z0-9]{10}$/.test(id) &&
    !/(?:X{4}|0{6}|TEST|DEMO|EXAMPLE|PLACEHOLDER|YOUR)/.test(id);
  var debug = config.debug === true && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var CONSENT_KEY = 'pbru_analytics_consent_v1';
  var SOURCE_KEY = 'pbru_form_source_v1';
  var CHOICE_DAYS = 180;
  var consent = 'unknown';
  var started = false;
  var pageSent = false;
  var loader = null;
  var panel = null;
  var preferencesButton = null;
  var previousFocus = null;
  var eventCount = 0;
  var lastEvent = null;
  var provenance = null;
  var safeOwn = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };

  function store(kind, operation, key, value) {
    try { return window[kind][operation](key, value); } catch (_) { return null; }
  }

  function readChoice(raw) {
    try {
      var choice = JSON.parse(raw);
      if (!choice || (choice.value !== 'granted' && choice.value !== 'denied') ||
        !Number.isFinite(choice.time) || choice.time > Date.now() ||
        Date.now() - choice.time > CHOICE_DAYS * 86400000) return 'unknown';
      return choice.value;
    } catch (_) { return 'unknown'; }
  }

  function campaign(value) {
    if (typeof value !== 'string') return '';
    var text = value.trim();
    // Campaign labels only: no emails, phone numbers, URLs, free text or encodings.
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(text) || /\d{7}/.test(text)) return '';
    return text;
  }

  function safePath(value) {
    if (typeof value !== 'string' || value.length > 160 || /[%@?#]|\d{7}/.test(value)) return '/';
    // Static public routes only. Avoid recording arbitrary private URL paths.
    if (/^\/(?:index\.html)?$/.test(value)) return '/';
    if (/^\/(?:fleet|services|cities|blog|es)\/?$/.test(value)) return value.replace(/\/$/, '') || '/';
    if (/^\/(?:fleet|services|cities|blog|es)\/[a-z0-9-]+(?:\.html)?\/?$/.test(value)) return value;
    if (/^\/(?:about|contact|quote|thank-you|privacy|terms|pricing|gallery|reviews|faq|fleet|weddings-portfolio|404)(?:\.html)?\/?$/.test(value)) return value;
    return '/';
  }

  function host(value) {
    if (typeof value !== 'string' || value.length > 253) return '';
    var clean = value.toLowerCase();
    if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(clean)) return '';
    return clean;
  }

  function externalReferrer() {
    try {
      var referrer = new URL(document.referrer);
      var hostname = host(referrer.hostname);
      if (!/^https?:$/.test(referrer.protocol) ||
        hostname.replace(/^www\./, '') === location.hostname.replace(/^www\./, '')) return '';
      return hostname;
    } catch (_) { return ''; }
  }

  function cleanSource(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof value.source_page !== 'string') return null;
    var clean = { source_page: safePath(value.source_page), source_referrer: host(value.source_referrer) };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
      clean[key] = campaign(value[key]);
    });
    return clean;
  }

  function captureSource() {
    var params = new URLSearchParams(location.search);
    var source = { source_page: safePath(location.pathname), source_referrer: externalReferrer() };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
      source[key] = campaign(params.get(key));
    });
    return source;
  }

  function sourceAllowed() {
    // Unconfigured analytics: provenance is local quote context, not exported telemetry.
    // Configured analytics: retain source only following an affirmative choice.
    return consent !== 'denied' && (!configured || consent === 'granted');
  }

  function ensureSource() {
    if (!sourceAllowed()) return;
    if (!provenance) {
      var raw = store('sessionStorage', 'getItem', SOURCE_KEY);
      try { provenance = cleanSource(JSON.parse(raw)); } catch (_) { provenance = null; }
      if (!provenance) provenance = captureSource();
    }
    store('sessionStorage', 'setItem', SOURCE_KEY, JSON.stringify(provenance));
  }

  function getAttribution() {
    ensureSource();
    var result = sourceAllowed() && provenance ? provenance : {};
    return Object.assign({}, result);
  }

  function pageType() {
    var path = safePath(location.pathname);
    if (path === '/') return 'home';
    var first = path.split('/')[1].replace(/\.html$/, '');
    return campaign(first) || 'other';
  }

  var allowedEvents = {
    cta_click: ['cta_id', 'placement', 'destination_path'],
    contact_click: ['contact_method', 'placement'],
    quote_start: ['form_id'],
    quote_step_view: ['form_id', 'step', 'direction'],
    quote_validation_error: ['form_id', 'step', 'field_name', 'error_code'],
    quote_submit_attempt: ['form_id', 'event_type', 'passenger_band', 'vehicle_id'],
    quote_submit_error: ['form_id', 'error_code'],
    quote_provider_return: ['form_id']
  };

  function sanitizeEvent(name, values) {
    if (!safeOwn(allowedEvents, name)) return null;
    var result = { page_type: pageType(), page_path: safePath(location.pathname) };
    var input = values && typeof values === 'object' ? values : {};
    allowedEvents[name].forEach(function (key) {
      var value = input[key];
      if (key === 'step') {
        if (Number.isInteger(value) && value >= 1 && value <= 3) result.step = value;
      } else if (key === 'destination_path') {
        if (typeof value === 'string') result[key] = safePath(value);
      } else {
        var clean = campaign(value);
        if (clean) result[key] = clean;
      }
    });
    if (result.contact_method && !/^(call|sms|email|whatsapp)$/.test(result.contact_method)) delete result.contact_method;
    return result;
  }

  function command() { window.dataLayer.push(arguments); }

  function send(name, values) {
    if (!configured || consent !== 'granted' || !started || window['ga-disable-' + id]) return false;
    command('event', name, Object.assign({ send_to: id, transport_type: 'beacon' }, values));
    eventCount += 1;
    lastEvent = name;
    if (debug && window.console) window.console.debug('[PBRU analytics]', name, values);
    return true;
  }

  function track(name, values) {
    var clean = sanitizeEvent(name, values);
    return clean ? send(name, clean) : false;
  }

  function start() {
    if (!configured || consent !== 'granted') return;
    window['ga-disable-' + id] = false;
    if (!started) {
      started = true;
      window.dataLayer = window.dataLayer || [];
      command('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      command('consent', 'update', { analytics_storage: 'granted' });
      command('js', new Date());
      command('config', id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + safePath(location.pathname),
        page_referrer: externalReferrer() ? 'https://' + externalReferrer() + '/' : '',
        page_title: 'Party Bus R Us | ' + pageType(),
        cookie_flags: 'SameSite=Lax;Secure'
      });
      loader = document.createElement('script');
      loader.id = 'pbru-ga4-loader';
      loader.async = true;
      loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(loader);
    } else {
      command('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!pageSent) {
      var data = getAttribution();
      var view = { page_location: location.origin + safePath(location.pathname), page_type: pageType() };
      // Supplying sanitized campaign values retains acquisition without raw query strings.
      ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (key) {
        if (data['utm_' + key]) view[key === 'campaign' ? 'campaign_name' : 'campaign_' + key] = data['utm_' + key];
      });
      pageSent = send('page_view', view);
    }
  }

  function clearAnalyticsCookies() {
    var domains = [''];
    var parts = location.hostname.split('.');
    for (var i = 0; i < parts.length - 1; i += 1) {
      domains.push(parts.slice(i).join('.'), '.' + parts.slice(i).join('.'));
    }
    document.cookie.split(';').forEach(function (entry) {
      var name = entry.split('=')[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
          (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
      });
    });
  }

  function deny() {
    if (configured) window['ga-disable-' + id] = true;
    // Discard queued, not-yet-processed events before a pending loader can run.
    if (window.dataLayer && Array.isArray(window.dataLayer)) window.dataLayer.length = 0;
    if (started) command('consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    clearAnalyticsCookies();
    store('sessionStorage', 'removeItem', SOURCE_KEY);
    provenance = null;
  }

  function closePanel() {
    if (!panel) return;
    panel.remove();
    panel = null;
    if (previousFocus && previousFocus.isConnected && previousFocus.focus) previousFocus.focus();
    previousFocus = null;
  }

  function setConsent(value) {
    if (value !== 'granted' && value !== 'denied') return false;
    consent = value;
    store('localStorage', 'setItem', CONSENT_KEY, JSON.stringify({ value: value, time: Date.now() }));
    if (value === 'granted') { ensureSource(); start(); } else { deny(); }
    closePanel();
    return true;
  }

  function button(label, action) {
    var element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', action);
    return element;
  }

  function showPanel(manual) {
    if (!configured || panel) return false;
    previousFocus = manual ? document.activeElement : null;
    panel = document.createElement('section');
    panel.id = 'pbru-consent';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Analytics privacy choices');
    var description = document.createElement('p');
    description.textContent = 'May we use Google Analytics to understand visits and improve this website? Optional analytics stays off unless you allow it.';
    var controls = document.createElement('div');
    controls.className = 'pbru-consent-actions';
    var reject = button('Keep analytics off', function () { setConsent('denied'); });
    controls.appendChild(reject);
    controls.appendChild(button('Allow analytics', function () { setConsent('granted'); }));
    var privacy = document.createElement('a');
    privacy.href = '/privacy';
    privacy.textContent = 'Privacy policy';
    controls.appendChild(privacy);
    if (manual) controls.appendChild(button('Close', closePanel));
    panel.appendChild(description);
    panel.appendChild(controls);
    document.body.appendChild(panel);
    if (manual) reject.focus();
    return true;
  }

  function initUI() {
    if (!configured) return;
    var style = document.createElement('style');
    style.textContent = '#pbru-consent{position:fixed;bottom:82px;left:12px;right:12px;margin:auto;max-width:620px;z-index:10000;padding:16px;background:#faf7ef;color:#221b27;border:1px solid #b8a37b;border-radius:8px;box-shadow:0 4px 24px #0003;font:14px/1.5 system-ui,sans-serif;max-height:55vh;overflow:auto}#pbru-consent p{margin:0 0 12px;color:inherit;font:inherit}.pbru-consent-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}#pbru-consent button,#pbru-privacy-choice{font:inherit;min-height:44px;padding:8px 12px;background:#fff;color:#221b27;border:1px solid #675a48;border-radius:4px;cursor:pointer}#pbru-consent a{color:#33234a;text-decoration:underline}#pbru-consent :focus-visible,#pbru-privacy-choice:focus-visible{outline:3px solid #7156b5;outline-offset:3px}#pbru-privacy-choice{margin:12px;font:13px system-ui,sans-serif}';
    document.head.appendChild(style);
    preferencesButton = button('Analytics privacy choices', function () { showPanel(true); });
    preferencesButton.id = 'pbru-privacy-choice';
    (document.querySelector('footer') || document.body).appendChild(preferencesButton);
    if (consent === 'unknown') showPanel(false);
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!target) return;
    var href = target.getAttribute('href') || '';
    var method = /^tel:/i.test(href) ? 'call' : /^sms:/i.test(href) ? 'sms' : /^mailto:/i.test(href) ? 'email' : '';
    if (!method) {
      try { if (new URL(href, location.origin).hostname === 'wa.me') method = 'whatsapp'; } catch (_) {}
    }
    var placement = target.closest('header, nav') ? 'header' : target.closest('footer') ? 'footer' :
      target.closest('.float-cta, .mobile-cta, .sticky-cta') ? 'floating' : 'content';
    if (method) {
      track('contact_click', { contact_method: method, placement: placement });
      return;
    }
    try {
      var destination = new URL(href, location.origin);
      if (destination.origin === location.origin && /^\/quote(?:\.html)?\/?$/.test(destination.pathname)) {
        track('cta_click', { cta_id: campaign(target.getAttribute('data-cta')) || 'request_quote',
          placement: placement, destination_path: '/quote' });
      }
    } catch (_) {}
  });

  window.addEventListener('storage', function (event) {
    if (event.key !== CONSENT_KEY) return;
    consent = readChoice(event.newValue);
    if (consent === 'granted') { ensureSource(); start(); } else { deny(); }
    if (consent !== 'unknown') closePanel();
  });

  window.PBRUAnalytics = Object.freeze({
    track: track,
    getAttribution: getAttribution,
    setConsent: setConsent,
    openConsentPreferences: function () { return showPanel(true); },
    getDebugState: function () {
      return Object.freeze({ configured: configured, consent: consent, started: started,
        pageViewQueued: pageSent, eventsQueued: eventCount, lastEvent: lastEvent,
        provenanceStored: !!store('sessionStorage', 'getItem', SOURCE_KEY),
        debug: debug, deliveryVerified: false });
    }
  });

  consent = readChoice(store('localStorage', 'getItem', CONSENT_KEY));
  if (consent === 'denied' || (configured && consent !== 'granted')) deny();
  ensureSource();
  if (consent === 'granted') start();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI, { once: true });
  else initUI();
})();
