# Current release handoff — October 7, 2026

The last verified production baseline before this update contains the owner-approved website work through [pull request #6](https://github.com/Azaiah00/partybusrus/pull/6), production commit `2343c3ff0f8330b7a0c1aab3dc6171331696ca1e`. [Vercel reports a successful production deployment](https://vercel.com/freds-projects-a353dcff/partybusrus/2WYFjDAnagpcPyTPZRyemSf1hTZz). The public website is [www.partybusrus.com](https://www.partybusrus.com/). Older Netlify, placeholder tracking and archived mobile-handoff instructions are superseded.

The release includes the SEO/design revision, mobile consent spacing, quote-click delivery, corrected campaign attribution, Search Console verification and removal of unverified sitemap modification dates. The live sitemap preserves all 92 canonical URLs in the reviewed order. Keep the homepage verification tag; only restore `lastmod` values when substantive per-page change dates are supported.

## Verified measurement and QA

- Search Console's October 7 sitemap report showed **Success**, 92 discovered pages, and October 6 submission/last-read dates. The Web performance report was still processing. Discovery does not establish that all pages are indexed, and no search-performance baseline is available yet.
- GA4, its website stream and eleven event-scoped reporting dimensions are configured. Enhanced Measurement is off. Realtime received tested page views, quote-step views and a native quote-click event. Two later QA arrivals in one tab each received their current campaign label. Those observations do not verify every input method, event or source/medium parameter.
- Live consent checks showed no Google loader after withdrawal/reload and exactly one with the configured ID after consent. At 320px browser width the corrected notice had 16px padding, 44px controls and no horizontal overflow. These DOM checks are separate from complete network/cookie inspection.
- Historical QA covered 95 HTML files, 173 local HTTP checks, 92 hosted linked pages, nine redirects and ten mobile layouts. The original production HTTP review passed 169 checks. The campaign release passed 38 behavior tests: 14 quote, 21 analytics and three cache tests. Its service worker v12 clears earlier cached scripts. These checks do not establish email delivery or blanket accessibility conformance.

See `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md`, `REVIEW-RELEASE.md` and `ANALYTICS-SETUP.md` for the scoped evidence and event contract.

## October 7 contrast follow-up

Local changes improve quote placeholders, hovered/active date chips, selected contact choices, the hovered Back button and consent keyboard focus. Static calculations give text contrast of at least 6.18:1 and focus contrast of 5.30:1 against the consent panel. Rendered local DOM checks confirmed placeholder and selected-contact styles, with no horizontal overflow at 1280px or 390px. Hover/focus states were reviewed from CSS and calculations, not exercised in the browser. Actual 200% zoom and physical Safari tests remain unverified.

The current implementation uses service worker `pbru-v13-2026-10-07-contrast` to clear earlier cached styles; all three updated cache tests passed. Current markup checks passed 95 pages and seven scripts with zero failures/warnings; the local browser returned no console errors or warnings, and independent code review found no actionable defects. The 35 quote/analytics tests are unchanged and were not rerun for this CSS/cache change. Deployment verification for this follow-up was pending when this handoff was prepared.

## Remaining owner actions

1. Verify one clearly labeled, authorized TEST quote: recipient inbox arrival, ability to reply to the sender, customer autoresponse and the expected return page. No real request was submitted during QA; actual delivery remains unverified.
2. Use the delivered `Party-Bus-R-Us-Inquiry-Tracker.xlsx` under the local `outputs/` directory for phone/email inquiries. Enter one row per inquiry, reuse its unique request reference, update quoted/booked outcomes and resolve duplicate-ID or booking-value warnings. Customer-reported source and website source metadata are distinct. This manual workbook is excluded from Git and has no inbox, phone or GA integration.
3. Recheck Search Console reports after processing and establish a dated baseline. Keep the existing property, verification tag and successful sitemap submission. GA4 cannot backfill visits from before collection began; clicks and form attempts do not prove calls, delivered emails or bookings.
4. Supply approved vehicle facts, booking policies and genuine review/case evidence before expanding content. Complete network/cookie inspection and the specific browser accessibility checks listed above separately; earlier automated checks are not a WCAG certification.
