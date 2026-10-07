# Current release handoff — October 7, 2026

The last verified production baseline before this update contains the owner-approved website work through [pull request #7](https://github.com/Azaiah00/partybusrus/pull/7), production commit `979f51281d2b40285890d8b743bb2fc54fb0593b`. [Vercel reports a successful production deployment](https://vercel.com/freds-projects-a353dcff/partybusrus/9giX6UkN3RAymp1p9DXiLVgMJyKr). The public website is [www.partybusrus.com](https://www.partybusrus.com/). Older Netlify, placeholder tracking and archived mobile-handoff instructions are superseded.

The release includes the SEO/design revision, mobile consent spacing, quote-click delivery, corrected campaign attribution, Search Console verification, sitemap date cleanup and five contrast fixes. The live sitemap preserves all 92 canonical URLs in the reviewed order. Keep the homepage verification tag; only restore `lastmod` values when substantive per-page change dates are supported.

## Verified measurement and QA

- Search Console's October 7 sitemap report showed **Success**, 92 discovered pages, and October 6 submission/last-read dates. That afternoon Overview still showed Performance and Indexing processing. Discovery does not establish that all pages are indexed, and no completed search-performance/indexing baseline is available yet.
- GA4, its website stream and eleven event-scoped reporting dimensions are configured. Enhanced Measurement is off. Realtime received tested page views, quote-step views and a native quote-click event. Two later QA arrivals in one tab each received their current campaign label. Those observations do not verify every input method, event or source/medium parameter.
- Live consent checks showed no Google loader after withdrawal/reload and exactly one with the configured ID after consent. At 320px browser width the corrected notice had 16px padding, 44px controls and no horizontal overflow. These DOM checks are separate from complete network/cookie inspection.
- Historical QA covered 95 HTML files, 173 local HTTP checks, 92 hosted linked pages, nine redirects and ten mobile layouts. The original production HTTP review passed 169 checks. The campaign release passed 38 behavior tests: 14 quote, 21 analytics and three cache tests. Its service worker v12 clears earlier cached scripts. These checks do not establish email delivery or blanket accessibility conformance.

See `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md`, `REVIEW-RELEASE.md` and `ANALYTICS-SETUP.md` for the scoped evidence and event contract.

## Published contrast follow-up and current SEO repair

PR #7 improves quote placeholders, hovered/active date chips, selected contact choices, the hovered Back button and consent keyboard focus. Static calculations give text contrast of at least 6.18:1 and focus contrast of 5.30:1 against the consent panel. Production CSS and service-worker files returned 200 and matched reviewed source. After reload, rendered placeholder/contact-choice styles matched; footer privacy and consent-panel keyboard focus both showed the corrected purple outline with `:focus-visible`. There was no desktop overflow or console warning/error; no Google loader was present while analytics was off. Local checks also showed no overflow at 390px. Other hover states, actual 200% zoom and physical Safari remain unverified.

The published service worker is `pbru-v13-2026-10-07-contrast`; its three cache tests passed. PR #7 markup checks passed 95 pages and seven scripts with zero failures/warnings, and independent code review found no actionable defects. The 35 quote/analytics tests were unchanged and not rerun for that CSS/cache change.

The current SEO follow-up corrects misleading gallery metadata and removes remaining Vehicle markup from Midnight 20 and Bridal 25. All seven Service and seven BreadcrumbList blocks are preserved byte-for-byte. The strengthened SEO audit first caught both Vehicle nodes, then passed 95 pages/92 indexable URLs with zero failures/warnings after removal; markup checks passed 95 pages/seven scripts and independent review found no actionable issues. No service-worker or behavior changes were made. Search Console showed one affected Midnight 20 Product item missing offers/review/aggregateRating, last crawled September 29. Publication and Google validation remain separate; do not describe the reported issue as cleared merely because local checks pass.

## Operations and remaining work

The owner reports receiving inquiry emails and directed that the TEST submission be skipped. No independent mailbox/provider receipt check occurred; autoresponse and Reply-To remain unestablished. These are optional future diagnostics if a delivery issue arises, not a required owner action now.

1. Use the delivered `Party-Bus-R-Us-Inquiry-Tracker.xlsx` under the local `outputs/` directory for phone/email inquiries. Enter one row per inquiry, reuse its unique request reference, update quoted/booked outcomes and resolve duplicate-ID or booking-value warnings. Customer-reported source and website source metadata are distinct. This manual workbook is excluded from Git and has no inbox, phone or GA integration.
2. Recheck Search Console reports after processing and establish a dated baseline. Keep the existing property, verification tag and successful sitemap submission. GA4 cannot backfill visits from before collection began; clicks and form attempts do not prove calls, delivered emails or bookings.
3. Supply approved vehicle facts, booking policies and genuine review/case evidence before expanding content. Complete network/cookie inspection and the specific browser accessibility checks listed above separately; earlier automated checks are not a WCAG certification.
