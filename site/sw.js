// Party Bus R Us: cache public static files only. Forms and HTML stay on the network.
const CACHE_PREFIX = 'pbru-';
const CACHE_VERSION = 'pbru-v9-2026-09-24-refined';
const STATIC_ASSETS = [
  '/manifest.json', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png',
  '/favicon-32.png', '/assets/fonts/fonts.css'
];

function isPublicAsset(request, url) {
  if (request.method !== 'GET' || url.origin !== self.location.origin) return false;
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return false;
  if (request.mode === 'navigate' || request.headers.get('authorization') || request.cache === 'no-store') return false;
  if ([...url.searchParams.keys()].some(key => key !== 'v')) return false;
  return url.pathname === '/manifest.json' || /\.(?:css|js|woff2?|png|jpe?g|webp|avif|gif|svg|ico)$/i.test(url.pathname);
}

function mayCache(response) {
  return response && response.status === 200 && response.type === 'basic' && !response.redirected &&
    !/private|no-store/i.test(response.headers.get('cache-control') || '');
}

async function assetResponse(request) {
  let cache;
  try {
    cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    if (cached) return cached;
  } catch { /* Continue on the network if browser storage is unavailable. */ }
  const response = await fetch(request);
  if (cache && mayCache(response)) {
    try { await cache.put(request, response.clone()); } catch { /* Storage is optional. */ }
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(STATIC_ASSETS.map(async url => {
      try {
        const response = await fetch(new Request(url, { cache: 'reload', credentials: 'omit' }));
        if (mayCache(response)) await cache.put(url, response);
      } catch { /* A failed optional asset must not block a safer worker update. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Preserve real 404 and other network statuses. Never substitute the homepage or a success page.
    event.respondWith(fetch(request).catch(() => new Response(
      '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Connection unavailable | Party Bus R Us</title><body><main><h1>Connection unavailable</h1><p>This page cannot load right now. Reconnect and try again.</p><p>A quote request is not a confirmed reservation. If you already sent a request, contact us before sending it again.</p><p><a href="tel:+17033994394">Call (703) 399-4394</a></p></main></body></html>',
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
    )));
  } else if (isPublicAsset(request, url)) {
    event.respondWith(assetResponse(request));
  }
  // All non-static requests, cross-origin calls, and POSTs bypass this worker.
});
