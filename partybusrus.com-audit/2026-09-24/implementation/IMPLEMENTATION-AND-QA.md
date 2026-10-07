# Implementation and QA — updated October 7, 2026

**Last verified production baseline before this update: owner-approved work through pull request #6.** Vercel reports successful production deployment of commit `2343c3ff0f8330b7a0c1aab3dc6171331696ca1e`. Follow-ups cover consent/navigation, campaign attribution, Search Console verification and sitemap date cleanup. Search Console showed sitemap Success with 92 discovered pages on October 7. The original audit and dated QA remain the baseline; discovery does not establish page indexation. See `REVIEW-RELEASE.md` for current release details and scoped verification.

**October 7 contrast follow-up:** October 7 contrast corrections cover five quote/consent states, with service worker v13 to invalidate cached styles. Static review and a limited rendered local check are complete; deployment verification for this follow-up was pending when this handoff was prepared.

## What changed

- Applied Fred’s FRED//FORM direction, “Afterglow, Refined”: calmer colors, two self-hosted font families, visible keyboard focus, less motion, static fleet cards and stronger mobile contact actions.
- Reworked the homepage, fleet comparison, seven vehicle pages, contact, privacy, quote and return pages. City and service headers now offer direct quote links carrying the relevant preference.
- Fixed canonical URLs, social URLs, internal links, sitemap URLs, supported schema types and crawl discovery. All existing content URLs are retained, with historical aliases preserved.
- Added the owner-provided homepage Search Console verification tag. Removed 92 unverified optional sitemap modification dates and stopped automatic date inheritance; all canonical sitemap URLs and their order are preserved. Keep the verification tag and require substantive per-page evidence for future dates.
- Replaced JavaScript-only discovery links with native links. Removed unverified rating markup, fixed availability claims, fabricated-looking video controls, response-time promises and contradictory booking policies.
- Corrected capacity/safety guidance, stale venue examples, misleading photo captions and unsupported testimonial/trip claims. Existing real photographs are reused; they do not establish specific vehicle identity, capacity or current amenities.
- Consolidated analytics into one consent-aware GA4 implementation. The owner authorized and completed account creation; the actual website stream ID is verified, configured and live. Enhanced Measurement and ad personalization are off, eleven event-scoped reporting dimensions are saved, and preview hosts cannot collect. Realtime receipt is verified for the observed production events, including the October 6 native quote-click check.
- Made the quote form work as a three-step enhancement to a native form. Vehicle, event and city preferences carry through; contact details and notes are not saved as a draft. Basic trip choices use short-lived tab session storage.
- Preserved FormSubmit’s native CAPTCHA and autoresponse flow. Added validation, offline feedback, duplicate-attempt protection and safe source fields. Form attempts and guarded provider returns are diagnostics, not accepted leads.
- Improved cache behavior, added missing image dimensions, used existing WebP alternatives and retired heavy animation/tracking scaffolding. The service worker preserves real errors and avoids caching forms or HTML. The production baseline used version 12; the current contrast follow-up uses v13 and clears earlier caches including v12. Both bypass the activation/rollback configuration. The configuration response is marked no-store.
- The contrast follow-up corrects quote placeholders, hovered/active date chips, selected contact choices, the hovered Back button and consent keyboard focus. Existing form behavior and analytics code are unchanged.

## Verification

| Check | Result | Evidence |
|---|---|---|
| Static SEO, links, assets, canonicals, metadata, schema and sitemap | 95 HTML files; 92 indexable URLs; 0 failures, 0 warnings | `local-technical-qa.json` |
| Markup and JavaScript compilation | 95 pages; seven external scripts; 0 failures, 0 warnings; rerun successfully for the October 7 contrast follow-up | Original `markup-qa.json` and current follow-up markup check |
| Local HTTP pages, assets, redirects and missing-page behavior | 173 checks passed, including 95 pages and 65 distinct assets | `http-qa.json` |
| Quote behavior | 14 tests passed in prior QA; unchanged and not rerun for the contrast follow-up | `scripts/test-quote.mjs`; `../tracking/QUOTE-INTEGRATION-QA.md` |
| Analytics behavior | 21 tests passed for the campaign release, including campaign handling, quote provenance and navigation behavior; unchanged and not rerun for the contrast follow-up | `scripts/test-analytics.mjs` |
| Analytics cache regression | Three tests passed for the v13 follow-up: previous-cache cleanup including v12, configuration bypass and unchanged public-asset caching | `scripts/test-service-worker.mjs` |
| Service worker and fonts | All nine recorded checks passed | `sw-font-qa.json` |
| Browser accessibility and layout | 27 page/viewport combinations; 0 reported automated violations after fixes | `browser-qa.json` |
| Hosted preview | 92 linked pages, nine query-preserving redirects and ten mobile layouts passed; menus and journal keyboard navigation verified | `hosted-preview-qa.json` |
| Original production HTTP review | 169 checks passed across 95 pages, 61 assets, redirects and missing-page behavior | `production-release-qa.json` |
| October 6 production follow-up | Analytics script/configuration/service worker returned 200 and matched source; configuration no-store; mobile consent layout passed; native quote click received in Realtime | `tracking-followup-production-qa.json` |
| Campaign correction, PR #4 | Three regression tests reproduced the bug; current campaign labels later received separately in Realtime for two same-tab QA arrivals | October 6 test and browser observations; `REVIEW-RELEASE.md` |
| Sitemap cleanup, PR #6 | 95 HTML pages / 92 indexable URLs / 92 sitemap URLs passed technical QA; live XML preserved URL order and omitted unverified dates; October 7 Search Console status Success / 92 discovered pages | Local technical checks and production browser/UI observations; `REVIEW-RELEASE.md` |
| October 7 contrast follow-up | Five states pass static contrast calculations; local DOM confirms placeholder/selected-contact styles and no overflow at 1280px/390px; browser hover/focus and actual 200% zoom remain unverified | CSS review, contrast calculations and limited local browser observation |
| Browser console | No errors or warnings returned in the prior local/hosted checks or the October 7 follow-up's local check | Browser tool observation |

The campaign release passed 38 behavior tests: 14 quote, 21 analytics and three cache tests, after the added campaign tests first reproduced the bug. The current page's sanitized campaign labels feed GA while the quote keeps its original consented source. The October 7 contrast follow-up changes CSS and the cache version; its three cache tests passed again, while the 35 unchanged quote/analytics tests were not rerun.

Static text-contrast calculations for the patched states are 6.18:1, 6.78–7.25:1, 10.13:1 and 13.19:1; the consent focus outline is 5.30:1 against the panel. Rendered local DOM confirmed the placeholder and selected-contact styles with no horizontal overflow at 1280px and 390px, and the browser returned no console errors or warnings. Independent code review found no actionable defects. Hover/focus states were reviewed from the CSS cascade and calculations but not exercised in the browser. The attempted 200% zoom action did not change the measured viewport/device scale, so 200% behavior is not verified. No physical Safari test was performed.

The earlier October 6 live checks covered the consent/navigation follow-up at reviewed head `0f262a4ca21bc867a3913b6bd9c7d45a5ad43fc4`. The notice used a `div` with 16px padding at 320px browser width (305px content width), with no horizontal overflow and 44px allow/off/close controls. Quote navigation worked and no console warnings or errors were returned. Realtime showed `cta_click`, `page_view`, `quote_step_view`, `first_visit`, `session_start` and `user_engagement` during the native browser check. Earlier locator/keyboard checks navigated but did not independently verify CTA receipt. Consent withdrawal/reload left zero Google loaders; allowing analytics loaded one with the configured ID. A separate later check verified distinct campaign receipt for two consecutive labeled QA arrivals in one tab; the second did not repeat the first campaign. Source/medium receipt was not separately inspected. These were QA visits, not customer leads.

Browser checks covered 320, 390, 768 and 1440 pixel widths across representative templates. Screenshots were visually inspected. Homepage and shared mobile menus opened, closed and returned focus correctly; Escape was verified on the homepage. Main mobile quote buttons were visible above the fixed contact bar. The quote page showed the selected Imperial 35 preference; empty-step validation stayed on step one and focused the date field.

The browser security policy blocked the next interactive quote action during the earlier form review. No workaround was attempted and no live inquiry was submitted. Remaining quote paths were tested with the automated harness against the actual form markup. This does **not** verify CAPTCHA completion, email delivery or autoresponse receipt. Separate production Realtime observations verify only the events described above; complete network and cookie inspection remains outstanding.

Automated accessibility results include incomplete contrast checks on images/complex backgrounds; they are recorded in the browser evidence. The contrast follow-up's static fixes and limited rendered checks do not establish browser hover/focus behavior, actual 200% zoom, physical Safari behavior or blanket WCAG conformance. No production Core Web Vitals or ranking improvement is claimed. Hosted verification inspected rendered pages after authenticated navigation; it does not independently establish HTTP status codes or every offscreen lazy image. A direct hosted robots.txt navigation was blocked by the browser client, and no workaround was attempted. Later public sitemap and configuration checks are separate evidence; the original production HTTP record excludes robots.txt.

## Required external completion

1. **Tracking verification:** deployed consent/navigation and campaign receipt checks are complete to the limits above. Complete network payload/cookie inspection, other event types and real form delivery remain separate checks. No claim of complete tracking coverage is made.
2. **Reporting baseline:** GA4 and Search Console setup is complete. On October 7 Search Console showed sitemap Success, 92 discovered pages and October 6 submission/last-read dates; keep the existing tag and submission. Web performance was still processing on October 7, while the latest confirmed Page indexing result was processing on October 6. Recheck after processing to establish a baseline; these states do not mean zero traffic or zero indexed pages. GA4 cannot backfill traffic from before collection began. Follow `site/ANALYTICS-SETUP.md` for the event contract and consent controls.
3. **Lead delivery and attribution:** the owner uses phone and email. Have the owner submit a clearly labeled, authorized TEST quote and verify recipient arrival, Reply-To, customer autoresponse and the expected return page. Use the delivered local inquiry workbook under `outputs/` for actual inquiries and bookings, reusing a unique request reference and resolving duplicate-ID/booking-value warnings. It is a manual log excluded from Git, not an integration. Browser click events cannot establish completed calls, received emails or bookings.
4. **Business proof:** confirm approved vehicle capacities/features, booking terms and review sources. Contradictory policies now defer to the written quote and booking agreement. No external business listings or sibling-site contact details were changed without those facts.

## Continuing SEO growth

Keep the existing useful URLs and assess changes once Search Console reports finish processing. Calls are encouraging, but attribution is required before concluding that SEO produced them. Expand city/service pages with verified pickup logistics, current source-linked venue details, approved vehicle facts and genuine customer cases. Current concise pages intentionally omit unsupported stories; do not pad them or create more near-duplicate city pages. Confirm the primary business phone/address across the sibling site and directories before making listing changes.

## Fred’s design review and retrospective

The useful existing ingredients were the fleet photography, regional focus and direct inquiry flow. The refinement makes those easier to use through hierarchy, restrained color and a shorter path to a quote. The largest trust improvements came from removing unsupported claims and showing clear next steps. The next design investment should be an approved fleet photo/specification ledger and genuine event evidence. Business proof, delivery verification and a usable reporting baseline remain the main operational gaps.

## Repeatable checks

Run from the project root:

```text
node scripts/serve-preview.mjs
node scripts/audit-site.mjs --output partybusrus.com-audit/2026-09-24/implementation/local-technical-qa.json
node scripts/test-markup.mjs --output partybusrus.com-audit/2026-09-24/implementation/markup-qa.json
node scripts/test-http.mjs
node scripts/test-quote.mjs
node scripts/test-analytics.mjs
```

The preview is at `http://127.0.0.1:4173/`. Its `?qa=1` accessibility helper is development-only and is not part of the deployed website. The one-time page migration scripts are implementation records; do not rerun them to regenerate current content. The SEO normalizer defaults to a dry run and supports `--write` when normalization is needed. A root package manifest pins the optional axe-core accessibility dependency; run `npm ci`, `npm run preview`, then `npm test` in another terminal. The preview reports a missing accessibility dependency without crashing or claiming that checks passed.
