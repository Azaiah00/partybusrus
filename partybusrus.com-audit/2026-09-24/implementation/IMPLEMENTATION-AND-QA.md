# Implementation and QA — updated October 6, 2026

**Status: the owner-approved revision and pull request #2 follow-up are live.** Vercel successfully deployed commit `fc3d8f1a12b817889342b5d1fd9605814bfdc242` on October 6. The original audit and prior QA remain the baseline. Live follow-up checks confirmed corrected mobile consent spacing and Realtime receipt of `cta_click` from a native browser quote-link interaction. The code gives consented same-tab quote clicks up to 250ms to process before navigation. See `REVIEW-RELEASE.md`, `production-release-qa.json` and `tracking-followup-production-qa.json` for the evidence and its limits.

## What changed

- Applied Fred’s FRED//FORM direction, “Afterglow, Refined”: calmer colors, two self-hosted font families, visible keyboard focus, less motion, static fleet cards and stronger mobile contact actions.
- Reworked the homepage, fleet comparison, seven vehicle pages, contact, privacy, quote and return pages. City and service headers now offer direct quote links carrying the relevant preference.
- Fixed canonical URLs, social URLs, internal links, sitemap URLs, supported schema types and crawl discovery. All existing content URLs are retained, with historical aliases preserved.
- Replaced JavaScript-only discovery links with native links. Removed unverified rating markup, fixed availability claims, fabricated-looking video controls, response-time promises and contradictory booking policies.
- Corrected capacity/safety guidance, stale venue examples, misleading photo captions and unsupported testimonial/trip claims. Existing real photographs are reused; they do not establish specific vehicle identity, capacity or current amenities.
- Consolidated analytics into one consent-aware GA4 implementation. The owner authorized and completed account creation; the actual website stream ID is verified, configured and live. Enhanced Measurement and ad personalization are off, eleven event-scoped reporting dimensions are saved, and preview hosts cannot collect. Realtime receipt is verified for the observed production events, including the October 6 native quote-click check.
- Made the quote form work as a three-step enhancement to a native form. Vehicle, event and city preferences carry through; contact details and notes are not saved as a draft. Basic trip choices use short-lived tab session storage.
- Preserved FormSubmit’s native CAPTCHA and autoresponse flow. Added validation, offline feedback, duplicate-attempt protection and safe source fields. Form attempts and guarded provider returns are diagnostics, not accepted leads.
- Improved cache behavior, added missing image dimensions, used existing WebP alternatives and retired heavy animation/tracking scaffolding. The service worker preserves real errors and avoids caching forms or HTML. Version 11 bypasses the activation/rollback configuration and clears the earlier v9/v10 caches; the configuration response is marked no-store.

## Verification

| Check | Result | Evidence |
|---|---|---|
| Static SEO, links, assets, canonicals, metadata, schema and sitemap | 95 HTML files; 92 indexable URLs; 0 failures, 0 warnings | `local-technical-qa.json` |
| Markup and JavaScript compilation | 95 pages; seven external scripts; 0 failures, 0 warnings | `markup-qa.json` |
| Local HTTP pages, assets, redirects and missing-page behavior | 173 checks passed, including 95 pages and 65 distinct assets | `http-qa.json` |
| Quote behavior | 14 tests passed | `scripts/test-quote.mjs`; `../tracking/QUOTE-INTEGRATION-QA.md` |
| Analytics behavior | 18 tests passed, including shipping configuration, navigation callback/fallback and native modifier/new-tab behavior | `scripts/test-analytics.mjs` |
| Analytics cache regression | Three tests passed: previous-cache cleanup, configuration bypass and unchanged public-asset caching | `scripts/test-service-worker.mjs` |
| Service worker and fonts | All nine recorded checks passed | `sw-font-qa.json` |
| Browser accessibility and layout | 27 page/viewport combinations; 0 reported automated violations after fixes | `browser-qa.json` |
| Hosted preview | 92 linked pages, nine query-preserving redirects and ten mobile layouts passed; menus and journal keyboard navigation verified | `hosted-preview-qa.json` |
| Original production HTTP review | 169 checks passed across 95 pages, 61 assets, redirects and missing-page behavior | `production-release-qa.json` |
| October 6 production follow-up | Analytics script/configuration/service worker returned 200 and matched source; configuration no-store; mobile consent layout passed; native quote click received in Realtime | `tracking-followup-production-qa.json` |
| Browser console | No errors or warnings returned in the final local and hosted checks | Browser tool observation |

The behavior total is 35: 14 quote, 18 analytics and three cache tests. Follow-up checks passed against head `0f262a4ca21bc867a3913b6bd9c7d45a5ad43fc4`; application code and tests were unchanged on October 6. The live notice used a `div` with 16px padding at 320px browser width (305px content width), with no horizontal overflow and 44px allow/off/close controls. Quote navigation worked and no console warnings or errors were returned. Realtime showed `cta_click`, `page_view`, `quote_step_view`, `first_visit`, `session_start` and `user_engagement` during the native browser check. Earlier locator/keyboard checks navigated but did not independently verify CTA receipt. Consent withdrawal/reload left zero Google loaders; allowing analytics loaded one with the configured ID.

Browser checks covered 320, 390, 768 and 1440 pixel widths across representative templates. Screenshots were visually inspected. Homepage and shared mobile menus opened, closed and returned focus correctly; Escape was verified on the homepage. Main mobile quote buttons were visible above the fixed contact bar. The quote page showed the selected Imperial 35 preference; empty-step validation stayed on step one and focused the date field.

The browser security policy blocked the next interactive quote action during the earlier form review. No workaround was attempted and no live inquiry was submitted. Remaining quote paths were tested with the automated harness against the actual form markup. This does **not** verify CAPTCHA completion, email delivery or autoresponse receipt. Separate production Realtime observations verify only the events described above; complete network and cookie inspection remains outstanding.

Automated accessibility results include incomplete contrast checks on images/complex backgrounds; they are recorded in the browser evidence. The results are not a blanket WCAG certification. No production Core Web Vitals or ranking improvement is claimed. Hosted verification inspected rendered pages after authenticated navigation; it does not independently establish HTTP status codes or every offscreen lazy image. A direct hosted robots.txt navigation was blocked by the browser client; the raw sitemap/config-file checks were not completed, and no workaround was attempted. Local static and HTTP checks remain separate evidence.

## Required external completion

1. **Tracking verification:** both releases are deployed, and the mobile notice and native quote-click receipt are verified. Complete network payload/cookie inspection, other event types and real form delivery remain separate checks. No claim of complete tracking coverage is made.
2. **GA4 and Search Console:** the owner-authorized GA4 property and website stream are live, the real Measurement ID is configured and eleven reporting dimensions are saved. Follow `site/ANALYTICS-SETUP.md` for the event contract and consent controls. The property cannot backfill traffic from before collection began. Search Console inspection permission is pending; its data is still needed to measure organic performance and inspect indexing.
3. **Lead delivery and attribution:** the owner uses phone and email. Confirm the FormSubmit recipient and an authorized delivered inquiry/autoresponse. Browser click events cannot establish completed calls, received emails or bookings. A simple business enquiry log can record those outcomes; automated attribution would require a separately configured and verified integration.
4. **Business proof:** confirm approved vehicle capacities/features, booking terms and review sources. Contradictory policies now defer to the written quote and booking agreement. No external business listings or sibling-site contact details were changed without those facts.

## Continuing SEO growth

Keep the existing useful URLs and assess changes once Search Console access is authorized. Calls are encouraging, but attribution is required before concluding that SEO produced them. Expand city/service pages with verified pickup logistics, current source-linked venue details, approved vehicle facts and genuine customer cases. Current concise pages intentionally omit unsupported stories; do not pad them or create more near-duplicate city pages. Confirm the primary business phone/address across the sibling site and directories before making listing changes.

## Fred’s design review and retrospective

The useful existing ingredients were the fleet photography, regional focus and direct inquiry flow. The refinement makes those easier to use through hierarchy, restrained color and a shorter path to a quote. The largest trust improvements came from removing unsupported claims and showing clear next steps. The next design investment should be an approved fleet photo/specification ledger and genuine event evidence. The remaining limitation is business proof and measurement access, not an additional visual effect.

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
