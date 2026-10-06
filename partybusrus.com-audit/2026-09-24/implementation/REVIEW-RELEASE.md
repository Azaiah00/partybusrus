# Production release and follow-up — September 24, 2026

The owner approved publication. PR #1 merged at production commit b07a0bf038eb349cd9835422b537b67f3c76ed08, and Vercel successfully deployed https://www.partybusrus.com/.

## Verified production results

- Public HTTP checks: 95 pages, 61 assets and redirect/missing-page cases, 169 checks total. One transient request passed on retry. Five historical .html URLs have a two-step Vercel clean-URL redirect chain; final destinations and query preservation passed. Actual missing-page status: 404.
- The public Analytics configuration and service worker matched reviewed source. Analytics configuration returned Cache-Control: no-store.
- Browser consent checks: no Google loader before consent, after denial/reload, or after withdrawal/reload. Exactly one loader after allowing analytics.
- Google Realtime received the consented home and quote page views and quote_step_view, plus first_visit and session_start. This does not establish every event, network payload, cookie operation or email delivery.
- The earlier complete hosted review covered 92 linked indexable routes, nine redirects and ten mobile layouts. See hosted-preview-qa.json for that separate evidence.

## Follow-up in this branch

The mobile consent notice previously inherited an important page-wide section padding rule. It now uses a div with the same accessible region role so its intended spacing applies. Service worker v11 invalidates v9/v10 cached scripts.

Quote-button events were absent in two Realtime checks while the resulting page views and quote-step events arrived. Consented same-tab quote links now wait for event processing or an independent 250ms fallback before navigating. Modified/new-tab/download links and consent-off visits retain native behavior. Destination preferences are preserved. This is a best-effort delivery improvement; production receipt must be checked after deployment.

Validation: 18 analytics tests, three cache regression tests and all 95 pages' markup/JavaScript checks pass. Tests cover callback/fallback navigation, once-only navigation, blocked analytics, preserved preferences, consent-off and modifier behavior. Production verification of this follow-up is recorded in the continuation notes after deployment.

## Remaining measurement work

The owner uses phone and email, with no booking/CRM system identified. Search Console is not connected. Completed calls, delivered inquiries, qualified leads, bookings and revenue require business-side records or a verified integration. No paid phone-tracking service, call recording, CRM or ad pixel has been installed. No real form or customer confirmation email was sent during QA.

The earlier browser policy block on a quote form date action remains respected. Hosted robots.txt was not retried through another mechanism after the browser-client block. The production HTTP record excludes it. Local static and HTTP checks remain separate evidence.

The site is live; no blanket claim that every tracking event or business outcome is verified is made.
