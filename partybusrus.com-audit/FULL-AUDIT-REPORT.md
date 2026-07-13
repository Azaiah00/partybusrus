# Party Bus R Us V2 — Full Website Audit

Audit updated: 2026-07-13
Scope: `site/v2` (95 HTML pages), desktop/mobile rendering, technical SEO, local SEO, GEO/AEO, and launch readiness.

## Executive summary

Estimated implementation health score: **84/100**, improved from 79/100. Estimated GEO/AEO readiness is **78/100**, improved from 65/100. These are implementation scores, not Google ranking guarantees or field-performance measurements.

The site now has a strong local-search architecture: 95 crawlable HTML pages, three regional commercial hubs, more than 40 local guides, 20 service pages, seven fleet pages, ten expert guides, answer-first passages, valid structured data, and consistent official business facts. Remaining launch-critical work depends on external setup: domain cutover, Supabase, analytics, Search Console/Bing, Google Business Profile, verified reviews/citations, and final-domain Core Web Vitals.

## Verified strengths

- 95 HTML pages and 92 sitemap URLs.
- Zero missing or duplicate titles, descriptions, canonicals, H1s, or viewport tags.
- 201 JSON-LD blocks parse successfully.
- Zero missing internal page/asset references in the static crawl.
- Washington DC, Maryland, and Northern Virginia regional hubs provide citable answers, local links, route tables, planning guidance, and FAQs.
- Official facts now consistently use `info@partybusrus.com`, 6601 Stonecrest Lane, Fairfax, VA 22030, 24/7 hours, `$$`, and 20% gratuity.
- Static HTML exposes important content without requiring JavaScript.
- Representative 1440px desktop and 390px mobile tests found no horizontal overflow or console errors.
- The LED showcase imagery loads and the previous oversized desktop dead zone is gone.
- Homepage responsive hero sources select the 480px asset on phone screens.
- FAQ and gallery are linked from normal site navigation.
- Confirmed Instagram is retained; nonexistent social profiles were removed.
- Blog schemas use a named Person author and no longer contain inaccurate truncated article bodies.

## Remaining critical/high work

1. **Domain/root launch:** Point apex and `www` to Vercel, promote V2 to the canonical root URLs, and redirect `/v2/*` in one hop.
2. **Quote storage:** Connect submissions to the existing Real Estate Advancement Supabase project and add abuse protection. FormSubmit remains the temporary destination.
3. **Measurement/indexing:** Install GA4/GTM conversions, verify Google Search Console and Bing Webmaster Tools, submit the sitemap, and enable IndexNow where appropriate.
4. **Local authority:** Complete Google Business Profile and consistent listings on Bing Places, Apple Business Connect, Yelp, and relevant DMV/wedding directories.
5. **Review proof:** Link testimonials to verifiable sources and establish a steady ethical review-request workflow.
6. **Field performance:** Measure final-domain CrUX/PageSpeed results and improve the remaining 72 images without intrinsic dimensions.
7. **Author authority:** Add Frederick's full public name, portrait, experience, and verifiable professional profile when available.

## Two-website policy

`partylimobusdc.com` is the established website for the same company, fleet, ownership, and booking operation. Both sites may remain online, but they should use consistent business facts and clearly distinct copy. Do not apply cross-domain canonicals unless pages are true duplicates. Track each site's calls and quotes separately so cannibalization and conversion quality can be measured.

## GEO/AEO assessment

The improvement from 65 to an estimated 78 comes from consistent entity facts, three regional hub pages, answer-first passages, tables, FAQs, stronger author schema, canonical-domain references, crawlable HTML, and removal of promotional language from `llms.txt`. The remaining gap is primarily off-site corroboration, verified reviews, author/operator credentials, primary-source citations, and real search/citation performance data. `llms.txt` is maintained as a factual discovery aid; it is not treated as a ranking shortcut.

## Validation record

- HTML files: 95
- Sitemap URLs: 92
- Valid JSON-LD blocks: 201
- Metadata/canonical/H1 validation errors: 0
- Duplicate title/description/canonical errors: 0
- Missing internal references: 0
- Images checked: 275; 72 still lack both width and height
- JavaScript syntax: passed
- Vercel configuration JSON: passed
- Desktop/mobile visual QA: passed

See [NEAR-TERM-TASK-LIST.md](NEAR-TERM-TASK-LIST.md) for the prioritized backlog and [SEO-STRATEGY.md](SEO-STRATEGY.md) for the growth plan.
