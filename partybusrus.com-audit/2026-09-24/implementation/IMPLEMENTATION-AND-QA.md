# Implementation and QA — September 24, 2026

**Status: implemented and tested locally; not deployed.** The original live-site audit remains the baseline. The findings below describe the revised files in `site/`, not production results.

## What changed

- Applied Fred’s FRED//FORM direction, “Afterglow, Refined”: calmer colors, two self-hosted font families, visible keyboard focus, less motion, static fleet cards and stronger mobile contact actions.
- Reworked the homepage, fleet comparison, seven vehicle pages, contact, privacy, quote and return pages. City and service headers now offer direct quote links carrying the relevant preference.
- Fixed canonical URLs, social URLs, internal links, sitemap URLs, supported schema types and crawl discovery. All existing content URLs are retained, with historical aliases preserved.
- Replaced JavaScript-only discovery links with native links. Removed unverified rating markup, fixed availability claims, fabricated-looking video controls, response-time promises and contradictory booking policies.
- Corrected capacity/safety guidance, stale venue examples, misleading photo captions and unsupported testimonial/trip claims. Existing real photographs are reused; they do not establish specific vehicle identity, capacity or current amenities.
- Consolidated analytics into one consent-aware GA4 implementation. No account ID was invented. The shipping configuration is empty, so external analytics collection is off.
- Made the quote form work as a three-step enhancement to a native form. Vehicle, event and city preferences carry through; contact details and notes are not saved as a draft. Basic trip choices use short-lived tab session storage.
- Preserved FormSubmit’s native CAPTCHA and autoresponse flow. Added validation, offline feedback, duplicate-attempt protection and safe source fields. Form attempts and guarded provider returns are diagnostics, not accepted leads.
- Improved cache behavior, added missing image dimensions, used existing WebP alternatives and retired heavy animation/tracking scaffolding. The service worker preserves real errors and avoids caching forms or HTML.

## Verification

| Check | Result | Evidence |
|---|---|---|
| Static SEO, links, assets, canonicals, metadata, schema and sitemap | 95 HTML files; 92 indexable URLs; 0 failures, 0 warnings | `local-technical-qa.json` |
| Markup and JavaScript compilation | 95 pages; seven external scripts; 0 failures, 0 warnings | `markup-qa.json` |
| Local HTTP pages, assets, redirects and missing-page behavior | 173 checks passed, including 95 pages and 65 distinct assets | `http-qa.json` |
| Quote behavior | 14 tests passed | `scripts/test-quote.mjs`; `../tracking/QUOTE-INTEGRATION-QA.md` |
| Analytics behavior | 14 tests passed | `scripts/test-analytics.mjs` |
| Service worker and fonts | All nine recorded checks passed | `sw-font-qa.json` |
| Browser accessibility and layout | 27 page/viewport combinations; 0 reported automated violations after fixes | `browser-qa.json` |
| Browser console | No errors or warnings returned in the final check | Browser tool observation |

Browser checks covered 320, 390, 768 and 1440 pixel widths across representative templates. Screenshots were visually inspected. Homepage and shared mobile menus opened, closed and returned focus correctly; Escape was verified on the homepage. Main mobile quote buttons were visible above the fixed contact bar. The quote page showed the selected Imperial 35 preference; empty-step validation stayed on step one and focused the date field.

The browser security policy blocked the next interactive quote action. No workaround was attempted and no live inquiry was submitted. Remaining quote paths were tested with the automated harness against the actual form markup. This does **not** verify CAPTCHA completion, email delivery, autoresponse receipt or production GA4 receipt.

Automated accessibility results include incomplete contrast checks on images/complex backgrounds; they are recorded in the browser evidence. The results are not a blanket WCAG certification. No production Core Web Vitals or ranking improvement is claimed.

## Required external completion

1. **Release review:** GitHub publishing access was verified with network access on September 24. The earlier restricted-environment authentication result did not establish that the saved login was invalid. Changes are being prepared on a separate review branch; production has not been updated. Check the deployment preview in the existing Vercel project, then repeat production URL and form checks after the approved release.
2. **GA4 and Search Console:** provide the business-owned GA4 measurement ID and appropriate account access. Follow `site/ANALYTICS-SETUP.md`, verify consent behavior and Realtime/DebugView receipt, and review automatic enhanced measurement. Search Console is needed to measure organic performance and inspect indexing.
3. **Lead delivery and attribution:** confirm the FormSubmit recipient and a real delivered inquiry/autoresponse. Browser click events cannot establish completed calls or delivered emails. Completed-call attribution needs a verified call-tracking integration; accepted leads and bookings need a provider/server/CRM receipt path.
4. **Business proof:** confirm approved vehicle capacities/features, booking terms and review sources. Contradictory policies now defer to the written quote and booking agreement. No external business listings or sibling-site contact details were changed without those facts.

## Continuing SEO growth

Keep the existing useful URLs and assess changes in Search Console after deployment. Calls are encouraging, but attribution is required before concluding that SEO produced them. Expand city/service pages with verified pickup logistics, current source-linked venue details, approved vehicle facts and genuine customer cases. Current concise pages intentionally omit unsupported stories; do not pad them or create more near-duplicate city pages. Confirm the primary business phone/address across the sibling site and directories before making listing changes.

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
