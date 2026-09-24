# Service worker and font delivery — 24 September 2026

## Local implementation

`site/sw.js` now uses `pbru-v9-2026-09-24-refined`. Activation removes only older cache names beginning `pbru-`; unrelated application caches are preserved. Public static files are cached only for same-origin GET requests with safe paths and no query parameters other than the existing `v` asset version. Authenticated, API, no-store, cross-origin and non-GET requests bypass caching. Non-200, redirected, private and no-store responses are never written to Cache Storage. Storage failures fall back to the network for assets.

HTML and quote/confirmation pages are never cached. Network navigation keeps its actual status, including 404. Offline navigation returns an explicit 503/no-store connection message with contact information; it does not substitute the homepage or imply a completed reservation. Current static assets receive a fresh cache namespace, including self-hosted fonts.

`scripts/fetch-fonts.mjs` downloads only from official Google Fonts CSS, fonts.gstatic.com WOFF2 files and Google Fonts' GitHub OFL license paths. Redirect destinations are restricted to the same approved host allowlist, HTTPS is required, and WOFF2 signatures/licenses are checked. No third-party package was installed. Font files use content-hashed names and source SHA256 records are retained in `site/assets/fonts/sources.json`.

`site/assets/fonts/fonts.css` supplies four local font faces: Anton Latin and Latin-ext, plus variable Inter Latin and Latin-ext covering weights 400–700. Each face uses `font-display: swap`. Four WOFF2 files total 183,292 bytes (about 179 KiB); unicode-range rules let browsers request the applicable subsets. Both official OFL licenses are included beside the fonts. The existing `refined.css` import resolves to this stylesheet.

## Verification

- `node --check site/sw.js` and `node --check scripts/fetch-fonts.mjs` pass.
- `sw-font-tests.mjs` uses a mocked service-worker environment to verify cache isolation, offline quote503/no-store, preserved404, exclusion of private/non200 responses, reuse of a public versioned asset, and bypass for sensitive queries/auth/API/POST.
- Every font CSS URL resolves locally; all four files have WOFF2 signatures, Inter descriptors cover400–700, all faces use swap, and both OFL files are present.
- Results saved in `sw-font-qa.json`.

This verifies local source and deterministic worker behavior. It does not claim a production rollout or measured Core Web Vitals improvement. Full HTML normalization was not run by this task.
