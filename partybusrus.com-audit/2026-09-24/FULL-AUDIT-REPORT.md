# Party Bus R Us — website, SEO, tracking and growth audit

**September 24, 2026 · https://www.partybusrus.com/**

## Executive decision

The website has a useful foundation and Fred reports receiving calls. It merits focused improvement. However, the inspected production code has **no active GA4, Google Tag Manager, Meta Pixel or CallRail collection**, so we cannot yet establish that SEO is causing those inquiries or calculate its return. Potential historical Search Console, hosting, phone-provider or account records were not available to this audit; they may still exist.

Prioritize measurement and inquiry reliability, correct conflicting business information, clean up URL/schema/internal-link issues, then refine mobile conversion and the strongest landing pages. Keep the brand's nightlife character and existing useful URLs. Do not launch a broad redesign or expand location-page production before establishing a baseline.

## What was actually checked

| Workstream | Coverage and result |
|---|---|
| Local inventory | 95 HTML files, current shared CSS/JS and Vercel configuration; older documentation treated as historical |
| Public crawl | 92 sitemap URLs plus linked variations: 98 requested documents resolving to 92 unique live pages; all final responses HTTP 200 |
| SEO source checks | Titles, descriptions, H1, canonical, robots, schema, links, images and main content across the 92 final pages |
| Asset checks | 40 unique inline-image URLs returned 200; 269 image elements examined. This does not cover every CSS background, video or external destination |
| Tracking | 95 local files plus five live HTML samples and the live shared script; source-based audit, not analytics-account receipt verification |
| Browser checks | Homepage desktop 1440 × 1000 and phone 390 × 844; quote/fleet at 320 px; wedding service at 768 px. Quote validation and advancement through all three steps tested without submitting |
| Design framework | Read Fred's actual Website Design System folder, installed FRED//FORM skill, core design rules, QA checklist and September presentation standard |
| Public discovery | Own site, sibling official site, selected competitor primary sites, public listings and primary sources for factual content checks |
| Changes | Audit files only. No production site, analytics-account, DNS, hosting or business-policy changes |

**Not measured:** Google rankings/traffic trends, complete index coverage, GBP calls/map-pack position, backlink profile, AI citation share, actual inbox delivery, booked revenue, fresh Lighthouse/CrUX metrics or full accessibility compliance. Google PageSpeed returned HTTP 429. Configured Google SEO credentials were not found in the skill's standard config/token paths. The browser offered no existing signed-in analytics session. These are evidence limitations, not findings that accounts or traffic do not exist.

## SEO status: technically accessible, commercially unmeasured

The sampled public search results surface the homepage and planning articles. That is evidence of discoverability, not a controlled rank report or proof of growth. The complete crawl shows a static, crawlable site with substantial service, fleet and location coverage. All 92 final pages have titles, meta descriptions, a single H1 and viewport tags. There were no duplicate titles/descriptions, exact duplicate main text, JSON-LD parse errors or broken inline-image URLs within this scope. A nonexistent URL correctly returns 404.

There are nonetheless meaningful defects:

1. **All 92 canonicals disagree with the final URL.** Production resolves to `https://www.partybusrus.com/` and clean paths; canonical tags use the apex host and often `.html`. All 92 sitemap entries also redirect. Adopt the current final www URLs consistently in canonical tags, sitemap, internal links, hreflang, Open Graph and schema identifiers. Retain redirects for existing links. This is a consistency improvement, not evidence the site is deindexed. [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
2. **15 sitemap pages are not reachable from the homepage through the crawled anchor-link graph.** They include birthdays, Sweet 16, NYE, holiday lights, funerals and anniversaries, plus nine city pages. Add useful links from service and regional hubs. Sitemaps alone do not create a usable browsing path. Complete URL list: `technical/analysis-summary.json`.
3. **Structured data needs semantic correction.** `LimousineService` appears on 63 pages but is not a recognized Schema.org type in the checked vocabulary. Use an appropriate supported business type with separate Service descriptions. Aggregate ratings on 61 pages need source verification and must not be treated as eligible self-serving local-business review stars. JSON parsing success is not semantic or rich-result validation. [Schema.org LocalBusiness](https://schema.org/LocalBusiness), [Google review policy](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).
4. **Local business identity needs reconciliation.** The sibling official site uses another number and Vienna location; public listings show further address variants. Confirm valid current numbers, business address/service-area treatment, GBP ownership and the relationship between the domains before editing listings. Differences are not automatically errors, and this audit did not inspect the private GBP account.
5. **Improve existing local pages using real operations.** Local inventory contains 41 location pages with a median of 312 main-content words. Word count is not a Google requirement and these pages are not exact copies. Add useful pickup/staging guidance, actual route experience, permission-cleared trip photos and appropriate vehicle links to pages with demonstrated demand. Do not mass-delete or inflate pages. [Google people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

HTTPS and several security headers are present. Missing CSP is a hardening opportunity, not an SEO crisis; any policy needs testing against fonts, scripts and the form provider. `llms.txt` and permissive named AI crawler rules exist, but neither proves AI visibility. Correct, sourced content and normal search accessibility take priority over special AI files.

## Are we tracking everything?

**No. The visible implementation is effectively unmeasured.** Older inner templates keep queue-only analytics stubs with comments saying tracking was parked for performance. The homepage has no analytics implementation. A queue or placeholder is not data delivery to an account.

| Question | Current answer | What closes the gap |
|---|---|---|
| How many visits and which source? | Not collected by the inspected analytics frontend | One owned GA4 implementation with verified receipt |
| Which searches bring people? | Unknown | Search Console query/page/device/date reports |
| How many calls came from the site? | Phone links work as destinations; no active call collection | Contact-click events plus answered/missed/qualified outcomes from phone records |
| Are quote emails arriving? | FormSubmit endpoint is configured for `info@partybusrus.com`; receipt unverified | Existing provider/mailbox records, then one authorized labeled delivery test |
| Which channels produced the quote? | Quote-page UTMs and immediate referrer only | Persist initial landing/source through internal navigation |
| How many leads became bookings? | No integration found | Lead log/CRM stages tied to an opaque lead ID and actual booking value |
| Are texts, WhatsApp and email counted? | No active dedicated reporting | Distinct channel intent events; actual messages/outcomes logged separately |

Do not simply reconnect the old scripts. They contain two Meta Lead calls on a quote submit and unguarded thank-you-page conversion calls. Submit attempts are not accepted inquiries, and direct thank-you visits or reloads must not inflate success counts. Keep form failures visible and preserve draft recovery until acceptance.

Use **one accepted inquiry event**, then qualified lead and booked-customer stages. Count contact clicks as intent, not completed calls or messages. Never put customer names, email, phone, precise pickup addresses or free-text form notes into analytics events. Current privacy copy promises an update and consent banner before analytics activation; honor the published behavior. Details and exact event definitions are in [TRACKING-AUDIT.md](tracking/TRACKING-AUDIT.md). [Google lead-event reference](https://support.google.com/analytics/answer/9267735?hl=en).

## Content issues to address before further promotion

### Safety and capacity advice

The deployed prom guide assigns 21–26 children to a 25-passenger bus and 27–35 to a 30-passenger bus, before reserving chaperone seats. Correct those ranges against verified passenger capacities. Its standing advice also conflicts with the site's terms. The article's insurance minimum needs operator review against the relevant rules: FMCSA guidance distinguishes vehicles designed for 16+ people from smaller vehicles for applicable interstate for-hire operations. This is an error in published guidance, not evidence that the actual business lacks coverage. [FMCSA primary guidance](https://www.fmcsa.dot.gov/safety/passenger-safety/licensing-and-insurance-requirements-hire-motor-carriers-passengers-parts).

### Booking expectations

The pricing article, pricing page, FAQ and terms disagree on deposit refunds, final payment (7 versus 14 days), quote validity (7 versus 14 days) and weather handling. Homepage “instant quote” language also conflicts with a manually answered inquiry form. Have the operator identify the actual booking agreement and reuse its approved policy wording everywhere. This audit does not select contract terms for the business.

### Route accuracy and proof

The 2026 brewery itinerary recommends One-Eight Distilling even though an official 2024 order canceled its license after surrender. The named Smoking Goose food stop needs correction/clarification against the actual Indianapolis business. Verify all suggested stops before presenting them as a bookable itinerary. [Official cancellation order](https://abca.dc.gov/sites/default/files/dc/sites/abra/publication/attachments/One-EightDistilling-432024.pdf), [Smoking Goose official site](https://www.smokinggoose.com/).

“Most-booked,” comparative claims about typical competitors, precise response guarantees, testimonials, named preferred-vendor relationships and the repeated “2 buses available tonight” banner need documentary or current operational backing. The availability count is hard-coded in inspected templates, not demonstrated live inventory. The audit cannot establish whether testimonials are authentic from their wording; retain them only with traceable sources/permission. A verified review link and an actual trip story are stronger proof than more unsupported superlatives.

Full content inventory, sources and contradictions: [content-local-search-audit.md](content/content-local-search-audit.md).

## Fred's design system: recommended evolution

Recommend **Afterglow, Refined**: retain the dark, energetic identity and authentic bus imagery, simplify the accent palette and typography, put verified proof earlier, and make the quote journey clearer. The alternatives are **The Grand Arrival** for a more wedding/corporate editorial feel and **DMV After Dark** for a stronger local nightlife voice. Their palettes, type posture, composition, motion, trade-offs and asset needs are documented in [FRED-FORM-REVIEW.md](design/FRED-FORM-REVIEW.md).

The mobile hero currently spends a large amount of the first screen on empty sky. At 390 × 844 the primary hero quote button starts about 781 px down and sits behind the sticky contact area; a header and sticky quote link still give access. Improve the crop and vertical rhythm. The service-page hero emphasizes sharing before the quote; prioritize the inquiry action. Keep useful phone/text/WhatsApp choices, with consistent labels and placement across page families.

“Reserve This Bus” should preserve the chosen vehicle through the quote form. The visible phone/email in the quote sidebar should be tappable. The availability close button is too small against Fred's 44 px target standard. Correct the visible `? Back` label. The tested form progression works; final delivery remains unverified.

Reuse real existing media before generating or commissioning more. Separate AI transformation clips from documentary fleet proof. Create a verified vehicle/photo/amenity ledger before building new fleet presentations. The complete proposed visitor path, sitemap ownership, three directions, asset inventory and release checklist are in the design review. No full visual build has been committed.

## Investment sequence and success measures

The first investment should make inquiries observable and reliable. Next, remove inaccurate or contradictory information, fix SEO consistency and internal discovery, then improve conversion on existing templates. Prioritize further content by impressions, qualified leads and actual service profitability once those measurements exist.

Track weekly: organic clicks and landing pages; inquiry attempts versus accepted requests; answered/missed/qualified calls; quotes sent; bookings; booking value; response time; source/landing-page conversion rates. Compare at least 28 days to the preceding comparable period, and account for event seasonality. Do not promise statistical certainty from a handful of calls. Search Console is the source for search performance; GA4 describes on-site behavior. [Google's measurement guidance](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).

The [ACTION-PLAN.md](ACTION-PLAN.md) gives dependencies, effort ranges and pass/fail checks. The concise client view is [AUDIT-OVERVIEW.html](AUDIT-OVERVIEW.html). Raw live evidence and inventories remain alongside these reports.

## Evidence and access still needed

- Existing GA4/Search Console ownership or read-only exports: latest 90 days, preceding period, query/page/device and organic landing-page conversions where available.
- Correct Business Profile link/account, current public business identity and relation to the sibling domain.
- Recent FormSubmit/provider and mailbox receipt confirmation; no private messages or customer records were accessed here.
- Current call/booking outcomes and actual policy, vehicle, review and service-proof records.
- Fresh PageSpeed/Lighthouse and real-user CWV when available; full release testing after implementation.

These gaps do not prevent finishing the public/code audit. They do prevent a defensible statement that SEO is improving or that all inquiries are delivered and attributed.

---

Audit workflow attribution: Built by agricidaniel — [AI Marketing Hub (Free)](https://www.skool.com/ai-marketing-hub) · [AI Marketing Hub (Pro)](https://www.skool.com/ai-marketing-hub-pro).
