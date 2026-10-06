import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../site/sw.js', import.meta.url), 'utf8');
function boot() {
  const listeners = {}, deleted = [], hits = [];
  const cached = new Response('cached public asset');
  const context = {
    URL, Request, Response,
    self: {
      location: { origin: 'https://www.partybusrus.com' },
      addEventListener: (name, fn) => { listeners[name] = fn; },
      skipWaiting: async () => {}, clients: { claim: async () => {} }
    },
    caches: {
      keys: async () => ['pbru-v9-2026-09-24-refined', 'pbru-v10-2026-09-24-analytics', 'pbru-v11-2026-09-24-consent', 'unrelated-app'],
      delete: async key => { deleted.push(key); return true; },
      open: async () => ({ match: async request => { hits.push(request.url); return cached; } })
    },
    fetch: async () => { throw new Error('Network unavailable in test'); }
  };
  vm.runInNewContext(source, context);
  return { listeners, deleted, hits };
}

test('activation purges the previous cached configuration without deleting other apps', async () => {
  const app = boot(); let completion;
  app.listeners.activate({ waitUntil: promise => { completion = promise; } });
  await completion;
  assert.deepEqual(app.deleted, ['pbru-v9-2026-09-24-refined', 'pbru-v10-2026-09-24-analytics']);
});

test('analytics activation and rollback configuration always bypass the service worker cache', () => {
  const app = boot();
  for (const suffix of ['', '?v=20260924']) {
    let intercepted = false;
    app.listeners.fetch({
      request: new Request('https://www.partybusrus.com/assets/analytics-config.js' + suffix),
      respondWith: () => { intercepted = true; }
    });
    assert.equal(intercepted, false, suffix);
  }
  assert.deepEqual(app.hits, []);
  const config = JSON.parse(readFileSync(new URL('../site/vercel.json', import.meta.url), 'utf8'));
  const rule = config.headers.find(item => item.source === '/assets/analytics-config.js');
  assert.equal(rule.headers.find(item => item.key === 'Cache-Control').value, 'no-store');
});

test('ordinary public assets retain cache support', async () => {
  const app = boot(); let response;
  app.listeners.fetch({
    request: new Request('https://www.partybusrus.com/assets/fonts/fonts.css'),
    respondWith: promise => { response = promise; }
  });
  assert.equal(await (await response).text(), 'cached public asset');
  assert.equal(app.hits.length, 1);
});
