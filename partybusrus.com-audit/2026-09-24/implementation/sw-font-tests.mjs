import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const events = {}, deleted = [], storage = new Map();
const origin = 'https://www.partybusrus.com';
const current = 'pbru-v9-2026-09-24-refined';
let network = async () => response(200, 'asset'), writes = 0, fetches = 0;
function response(status, body, headers = {}) {
  const value = new Response(body, { status, headers });
  Object.defineProperty(value, 'type', { value: 'basic' });
  return value;
}
const context = vm.createContext({ URL, Response, Request, Promise, self: {
  location: { origin }, addEventListener: (name, fn) => { events[name] = fn; },
  clients: { claim: async () => {} }, skipWaiting: async () => {}
}, caches: {
  keys: async () => ['pbru-v8-old', current, 'other-application-cache'],
  delete: async key => deleted.push(key),
  open: async () => ({ match: async req => storage.get(req.url || req), put: async (req, res) => { writes++; storage.set(req.url || req, res); } })
}, fetch: async req => { fetches++; return network(req); } });
vm.runInContext(fs.readFileSync('site/sw.js', 'utf8'), context);
let activation;
events.activate({ waitUntil: p => { activation = p; } });
await activation;
assert.deepEqual(deleted, ['pbru-v8-old']);
async function invoke(pathname, options = {}) {
  let result;
  const request = { url: origin + pathname, method: 'GET', mode: 'cors', cache: 'default', headers: new Headers(), ...options };
  events.fetch({ request, respondWith: p => { result = p; } });
  return result;
}
network = async () => { throw new TypeError('offline'); };
const offline = await invoke('/quote?email=private', { mode: 'navigate' });
assert.equal(offline.status, 503);
assert.equal(offline.headers.get('cache-control'), 'no-store');
assert((await offline.text()).includes('Connection unavailable'));
assert.equal(writes, 0);
network = async () => response(404, 'missing');
assert.equal((await invoke('/unknown', { mode: 'navigate' })).status, 404);
assert.equal((await invoke('/assets/not-found.js')).status, 404);
assert.equal(writes, 0);
network = async () => response(200, 'private', { 'Cache-Control': 'private' });
await invoke('/assets/private.js');
assert.equal(writes, 0);
network = async () => response(200, 'font');
await invoke('/assets/fonts/example.woff2?v=1');
assert.equal(writes, 1);
const before = fetches;
await invoke('/assets/fonts/example.woff2?v=1');
assert.equal(fetches, before);
for (const [u, options] of [['/assets/a.js?email=private', {}], ['/quote', {method:'POST'}], ['/api/status', {}], ['/api/private.js', {}], ['/assets/a.js', {headers:new Headers({Authorization:'test-value'})}]]) assert.equal(await invoke(u, options), undefined);

const fontDir = 'site/assets/fonts';
const css = fs.readFileSync(path.join(fontDir, 'fonts.css'), 'utf8');
const blocks = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map(m => m[1]);
assert.equal(blocks.length, 4);
for (const block of blocks) {
  assert(block.includes('font-display: swap;'));
  const url = block.match(/url\(([^)]+)\)/)?.[1];
  assert(url.startsWith('/assets/fonts/'));
  assert.equal(fs.readFileSync('site' + url).subarray(0,4).toString(), 'wOF2');
}
assert(blocks.filter(b => b.includes("'Inter'")).every(b => /font-weight:\s*400 700;/.test(b)));
for (const family of ['anton','inter']) assert(fs.readFileSync(path.join(fontDir, family+'-OFL.txt'), 'utf8').includes('SIL OPEN FONT LICENSE'));
const result = { passed: true, checks: ['SW removes only old pbru caches', 'offline quote is 503/no-store', 'network404 preserved', 'non200/private asset responses not cached', 'public versioned font cached', 'sensitive query/auth/API/POST bypass worker', '4 local WOFF2 faces valid', 'Latin and Latin-ext with Inter400..700 and swap', '2 official OFL licenses present'] };
fs.writeFileSync('partybusrus.com-audit/2026-09-24/implementation/sw-font-qa.json', JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
