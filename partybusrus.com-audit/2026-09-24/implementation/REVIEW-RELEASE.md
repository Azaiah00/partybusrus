# Production release and follow-up — updated October 6, 2026

The owner approved publication. PR #1 merged at production commit `b07a0bf038eb349cd9835422b537b67f3c76ed08`. [PR #2](https://github.com/Azaiah00/partybusrus/pull/2) merged on October 6 at `fc3d8f1a12b817889342b5d1fd9605814bfdc242`, and [Vercel successfully deployed the follow-up](https://vercel.com/freds-projects-a353dcff/partybusrus/AKCcHdnKCCE8a64h21gNcLdjp6Po) to [the production site](https://www.partybusrus.com/).

## Original production verification

- Public HTTP checks: 95 pages, 61 assets and redirect/missing-page cases, 169 checks total. One transient request passed on retry. Five historical .html URLs have a two-step Vercel clean-URL redirect chain; final destinations and query preservation passed. Actual missing-page status: 404.
- The public Analytics configuration and service worker matched reviewed source. Analytics configuration returned Cache-Control: no-store.
- Browser consent checks: no Google loader before consent, after denial/reload, or after withdrawal/reload. Exactly one loader after allowing analytics.
- Google Realtime received the consented home and quote page views and quote_step_view, plus first_visit and session_start. This does not establish every event, network payload, cookie operation or email delivery.
- The earlier complete hosted review covered 92 linked indexable routes, nine redirects and ten mobile layouts. See hosted-preview-qa.json for that separate evidence.

## Deployed follow-up and October 6 verification

The mobile consent notice previously inherited an important page-wide section padding rule. It now uses a div with the same accessible region role so its intended spacing applies. Service worker v11 invalidates v9/v10 cached scripts.

Quote-button events were absent in earlier Realtime checks while the resulting page views and quote-step events arrived. Consented same-tab quote links now wait for event processing or an independent 250ms fallback before navigating. Modified/new-tab/download links and consent-off visits retain native behavior. Destination preferences are preserved. A processing callback is not itself a receipt from Google.

Validation at reviewed head `0f262a4ca21bc867a3913b6bd9c7d45a5ad43fc4`: 18 analytics tests, three cache regression tests and all 95 pages' markup/JavaScript checks passed. Tests cover callback/fallback navigation, once-only navigation, blocked analytics, preserved preferences, consent-off and modifier behavior. With the previously passed 14 quote tests, the behavior total is 35. No application code or tests changed on October 6.

- Public GET checks for `analytics.js`, `analytics-config.js` and `sw.js` returned 200 and matched reviewed source. The configuration retained `Cache-Control: no-store`. The first DNS attempt failed; the retry passed.
- At a 320px browser width (305px content width), the live consent notice was a `div` with 16px padding, no horizontal overflow and 44px allow/off/close controls that fit the viewport.
- A native browser quote-link interaction navigated successfully. Google Realtime received `cta_click`, alongside `page_view`, `quote_step_view`, `first_visit`, `session_start` and `user_engagement`. Earlier locator and keyboard checks navigated but did not independently establish CTA receipt; receipt for every input method is not claimed.
- Withdrawal followed by reload left zero Google loaders; allowing analytics loaded exactly one with the configured ID. The browser returned no console errors or warnings.

Evidence: `tracking-followup-production-qa.json`. These observations do not constitute complete network or cookie inspection and do not verify all tracking events or form delivery.

## Additional campaign correction — October 6

The original source retained for quote requests was also being used as a GA page-view campaign override. A later visit from a different campaign in the same tab therefore sent the old labels. GA now receives only the current page's sanitized campaign labels; the quote retains its original source. Untagged internal and external arrivals omit overrides so Google can manage attribution. Service worker v12 clears earlier cached scripts.

Three regression tests reproduced the old behavior before the fix. Afterward all 38 quote/analytics/cache tests passed (14/21/3). All 95 pages and seven external scripts passed markup/compilation checks with no failures or warnings. An independent code review found no blockers. The browser connection timed out during the follow-up, so account-side receipt of the corrected campaign parameters remains unverified. A fresh public mobile PageSpeed request also returned HTTP 429 quota exhaustion; it supplied no new score.

## Remaining measurement work

The owner uses phone and email, with no booking/CRM system identified. Search Console inspection has not completed because the browser connection timed out. The GA4 property cannot backfill traffic from before collection began. Completed calls, delivered inquiries, qualified leads, bookings and revenue require business-side records or a verified integration. Local inquiry workbooks are excluded from Git so future customer records are not included in website releases. No paid phone-tracking service, call recording, CRM or ad pixel has been installed. No real form or customer confirmation email was sent during QA, and delivery/autoresponse remain unverified.

The earlier browser policy block on a quote form date action remains respected. Hosted robots.txt was not retried through another mechanism after the browser-client block. The production HTTP record excludes it. Local static and HTTP checks remain separate evidence.

The site is live; no blanket claim that every tracking event or business outcome is verified is made.
