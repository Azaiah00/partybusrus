import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const script = readFileSync(new URL('../site/assets/analytics.js', import.meta.url), 'utf8');
const configSource = readFileSync(new URL('../site/assets/analytics-config.js', import.meta.url), 'utf8');
const configScope = { Object }; configScope.window = configScope;
vm.runInNewContext(configSource, configScope);
const shippingConfig = configScope.PBRU_ANALYTICS_CONFIG;
// VM-only fixture ID: no network facility exists in this fake DOM.
const ID = 'G-A1B2C3D4E5';
const CONSENT = 'pbru_analytics_consent_v1';
const SOURCE = 'pbru_form_source_v1';
function storage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
    removeItem: key => entries.delete(key),
    entries
  };
}
function boot(options = {}) {
  const documentListeners = {}, windowListeners = {}, cookieWrites = [];
  const elements = [];
  function node(tag) {
    const item = {
      tagName: tag.toUpperCase(), children: [], listeners: {}, attributes: {}, isConnected: true,
      appendChild(child) { this.children.push(child); child.parent = this; return child; },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; },
      getAttribute(name) { return this.attributes[name] || ''; },
      remove() { this.isConnected = false; if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); },
      focus() { document.activeElement = this; },
      closest() { return null; }
    };
    elements.push(item);
    return item;
  }
  const document = {
    head: node('head'), body: node('body'), footer: node('footer'),
    referrer: options.referrer || '', readyState: 'complete', activeElement: null,
    createElement: node,
    querySelector: selector => selector === 'footer' ? document.footer : null,
    addEventListener(name, fn) { documentListeners[name] = fn; }
  };
  let cookies = options.cookies || '';
  Object.defineProperty(document, 'cookie', {
    get: () => cookies,
    set: value => { cookieWrites.push(value); }
  });
  const location = new URL(options.url || 'https://www.partybusrus.com/');
  const sessionStorage = options.session || storage();
  const localStorage = options.local || storage();
  const context = {
    document, location, URL, URLSearchParams, console,
    sessionStorage, localStorage,
    PBRU_ANALYTICS_CONFIG: options.config ?? { measurementId: ID },
    addEventListener(name, fn) { windowListeners[name] = fn; }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(script, context);
  return {
    context, api: context.PBRUAnalytics, document, elements, sessionStorage, localStorage, cookieWrites,
    scripts: () => document.head.children.filter(el => el.tagName === 'SCRIPT'),
    events: () => (context.dataLayer || []).filter(args => args[0] === 'event').map(args => ({ name: args[1], params: args[2] })),
    click: target => documentListeners.click({ target }),
    storageChange: (key, newValue) => windowListeners.storage({ key, newValue }),
    rerun: () => vm.runInContext(script, context)
  };
}

test('empty rollback configuration has no collector, queue or prompt; local quote source is useful', () => {
  const app = boot({ config: { measurementId: '' }, url: 'https://www.partybusrus.com/?utm_source=google&utm_medium=organic', referrer: 'https://www.google.com/search?q=party+bus' });
  assert.equal(app.scripts().length, 0);
  assert.equal(app.context.dataLayer, undefined);
  assert.equal(app.elements.some(el => el.id === 'pbru-consent'), false);
  assert.equal(app.api.getAttribution().source_referrer, 'www.google.com');
  assert.equal(app.api.getAttribution().utm_source, 'google');
  assert.equal(app.api.track('quote_start', { form_id: 'quote-form' }), false);
});

test('shipping configuration uses the verified stream only after consent and supports withdrawal', () => {
  assert.equal(shippingConfig.measurementId, 'G-TM8WLPFQC3');
  assert.equal(shippingConfig.debug, false);
  const app = boot({ config: shippingConfig });
  assert.equal(app.scripts().length, 0);
  assert.equal(app.context.dataLayer, undefined);
  assert.ok(app.elements.find(el => el.id === 'pbru-consent'));
  app.api.setConsent('granted');
  assert.equal(app.scripts().length, 1);
  assert.ok(app.scripts()[0].src.endsWith('id=' + shippingConfig.measurementId));
  assert.equal(app.events().filter(event => event.name === 'page_view').length, 1);
  app.api.setConsent('denied');
  assert.equal(app.context['ga-disable-' + shippingConfig.measurementId], true);
  assert.equal(app.api.track('quote_start', {}), false);
});

test('valid production ID stays fully off until affirmative consent', () => {
  const app = boot();
  assert.equal(app.scripts().length, 0);
  assert.equal(app.context.dataLayer, undefined);
  assert.equal(app.cookieWrites.length, 0);
  assert.equal(app.sessionStorage.getItem(SOURCE), null);
  assert.equal(app.api.getDebugState().consent, 'unknown');
  assert.equal(app.api.track('quote_start', {}), false);
  assert.ok(app.elements.find(el => el.id === 'pbru-consent'));
  const buttons = app.elements.filter(el => el.tagName === 'BUTTON').map(el => el.textContent);
  assert.ok(buttons.includes('Keep analytics off'));
  assert.ok(buttons.includes('Allow analytics'));
});

test('repeated consent and duplicate script include do not duplicate loader/page view', () => {
  const app = boot({ url: 'https://partybusrus.com/quote?email=user@example.com&utm_source=google&utm_campaign=prom_2027' });
  app.api.setConsent('granted');
  app.api.setConsent('granted');
  app.rerun();
  assert.equal(app.scripts().length, 1);
  assert.equal(app.events().filter(event => event.name === 'page_view').length, 1);
  const page = app.events()[0].params;
  assert.equal(page.page_location, 'https://partybusrus.com/quote');
  assert.equal(page.campaign_source, 'google');
  assert.equal(page.campaign_name, 'prom_2027');
  assert.equal(JSON.stringify(app.context.dataLayer).includes('user@example.com'), false);
  assert.equal(app.api.getDebugState().deliveryVerified, false);
});

test('preview and local hosts never load collectors, even with consent', () => {
  for (const url of ['http://localhost:3000/', 'https://pbru-preview.vercel.app/', 'https://partybusrus.com.evil.example/']) {
    const app = boot({ url, config: shippingConfig });
    app.api.setConsent('granted');
    assert.equal(app.scripts().length, 0, url);
    assert.equal(app.context.dataLayer, undefined, url);
  }
});

test('invalid IDs and placeholder/test IDs never collect', () => {
  for (const measurementId of ['', 'G-XXXXXXXXXX', 'G-TEST123456', 'G-DEMO123456', 'G-0000000000', 'G-abc1234567', 'GTM-ABCDEFG', 'G-A1B2C3D4E5<script>']) {
    const app = boot({ config: { measurementId } });
    app.api.setConsent('granted');
    assert.equal(app.scripts().length, 0, measurementId);
  }
});

test('source persists across internal navigation, never forwards raw URLs or PII', () => {
  const session = storage();
  const home = boot({ session, config: {}, url: 'https://www.partybusrus.com/?utm_source=google&utm_medium=cpc&utm_campaign=fall-party&utm_term=7033994394&utm_content=person%40example.com&email=person%40example.com', referrer: 'https://www.google.com/search?q=private' });
  const quote = boot({ session, config: {}, url: 'https://www.partybusrus.com/quote', referrer: 'https://www.partybusrus.com/fleet/bus-35pax' });
  const source = quote.api.getAttribution();
  assert.equal(source.source_page, '/');
  assert.equal(source.source_referrer, 'www.google.com');
  assert.equal(source.utm_campaign, 'fall-party');
  assert.equal(source.utm_term, '');
  assert.equal(source.utm_content, '');
  assert.equal(JSON.stringify(source).includes('private'), false);
  source.utm_source = 'tampered';
  assert.equal(quote.api.getAttribution().utm_source, 'google');
  assert.equal(home.scripts().length, 0);
});

test('consent denial and withdrawal clear source/GA cookies and stop all later events', () => {
  const app = boot({ cookies: '_ga=abc; _ga_A1B2C3D4E5=def; _gid=123; booking_session=keep' });
  app.api.setConsent('granted');
  assert.ok(app.sessionStorage.getItem(SOURCE));
  app.api.setConsent('denied');
  assert.equal(app.context['ga-disable-' + ID], true);
  assert.equal(app.sessionStorage.getItem(SOURCE), null);
  assert.deepEqual(Object.keys(app.api.getAttribution()), []);
  assert.equal(app.api.track('contact_click', { contact_method: 'call' }), false);
  assert.equal(app.events().length, 0);
  assert.ok(app.cookieWrites.some(value => value.startsWith('_ga=;')));
  assert.ok(app.cookieWrites.some(value => value.includes('domain=.partybusrus.com')));
  assert.equal(app.cookieWrites.some(value => value.startsWith('booking_session=')), false);
  const reopened = boot({ local: app.localStorage });
  assert.equal(reopened.scripts().length, 0);
  assert.equal(reopened.api.getDebugState().consent, 'denied');
  assert.equal(reopened.api.openConsentPreferences(), true);
});

test('withdrawal in another tab disables this tab; stale/deleted consent does not enable', () => {
  const app = boot();
  app.api.setConsent('granted');
  app.storageChange(CONSENT, JSON.stringify({ value: 'denied', time: Date.now() }));
  assert.equal(app.api.track('quote_start', {}), false);
  assert.equal(app.context['ga-disable-' + ID], true);
  app.storageChange(CONSENT, null);
  assert.equal(app.api.getDebugState().consent, 'unknown');
  assert.equal(app.api.track('quote_start', {}), false);
});

test('malformed, expired and future consent remain off; malformed source is safely replaced', () => {
  for (const value of ['{bad', JSON.stringify({ value: 'granted', time: 1 }), JSON.stringify({ value: 'granted', time: Date.now() + 86400000 }), 'null']) {
    const app = boot({ local: storage({ [CONSENT]: value }) });
    assert.equal(app.scripts().length, 0);
    assert.equal(app.api.getDebugState().consent, 'unknown');
  }
  const app = boot({ config: {}, session: storage({ [SOURCE]: '{bad' }), url: 'https://partybusrus.com/fleet/bus-35pax' });
  assert.equal(app.api.getAttribution().source_page, '/fleet/bus-35pax');
  const poisoned = boot({ config: {}, session: storage({ [SOURCE]: JSON.stringify({ source_page: '/person@example.com', source_referrer: 'https://private/path', utm_source: 'person@example.com' }) }) });
  assert.equal(poisoned.api.getAttribution().source_page, '/');
  assert.equal(poisoned.api.getAttribution().utm_source, '');
});

test('expired consent cleans old analytics cookies and previously saved provenance', () => {
  const app = boot({
    local: storage({ [CONSENT]: JSON.stringify({ value: 'granted', time: 1 }) }),
    session: storage({ [SOURCE]: JSON.stringify({ source_page: '/', utm_source: 'google' }) }),
    cookies: '_ga=expired-consent-client'
  });
  assert.equal(app.scripts().length, 0);
  assert.equal(app.sessionStorage.getItem(SOURCE), null);
  assert.ok(app.cookieWrites.some(value => value.startsWith('_ga=;')));
});

test('blocked storage never breaks page, consent or safe in-memory source', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  const app = boot({ local: blocked, session: blocked });
  assert.equal(app.api.setConsent('granted'), true);
  assert.equal(app.api.getAttribution().source_page, '/');
  assert.equal(app.api.setConsent('denied'), true);
  assert.equal(app.api.track('quote_start', {}), false);
});

test('event allowlist excludes success claims and PII; accepted params remain useful', () => {
  const app = boot(); app.api.setConsent('granted');
  assert.equal(app.api.track('generate_lead', { confirmed: true }), false);
  assert.equal(app.api.track('lead_confirmed', {}), false);
  assert.equal(app.api.track('page_view', {}), false);
  assert.equal(app.api.track('constructor', {}), false);
  assert.equal(app.api.track('quote_step_view', { form_id: 'quote-form', step: 2, direction: 'forward', email: 'person@example.com', notes: 'private notes' }), true);
  const event = app.events().at(-1);
  assert.equal(event.name, 'quote_step_view');
  assert.equal(event.params.step, 2);
  assert.equal(event.params.email, undefined);
  assert.equal(event.params.notes, undefined);
  assert.equal(app.api.track('quote_provider_return', { form_id: 'quote-form' }), true);
});

test('delegated contact links work for nested and dynamically-added targets, never expose href', () => {
  const app = boot(); app.api.setConsent('granted');
  for (const [href, method] of [['tel:+17033994394', 'call'], ['sms:+17033994394?body=private', 'sms'], ['mailto:info@partybusrus.com?subject=private', 'email'], ['https://wa.me/17033994394', 'whatsapp']]) {
    const anchor = { getAttribute: key => key === 'href' ? href : '', closest: () => null };
    app.click({ closest: () => anchor });
    const event = app.events().at(-1);
    assert.equal(event.params.contact_method, method);
    assert.equal(JSON.stringify(event).includes('17033994394'), false);
    assert.equal(JSON.stringify(event).includes('private'), false);
  }
  assert.equal(app.events().filter(event => event.name === 'contact_click').length, 4);
});

test('direct thank-you visits emit no lead or provider-return claims', () => {
  const app = boot({ url: 'https://www.partybusrus.com/thank-you', local: storage({ [CONSENT]: JSON.stringify({ value: 'granted', time: Date.now() }) }) });
  assert.deepEqual(Array.from(app.events(), event => event.name), ['page_view']);
});
