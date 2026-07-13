# Party Bus R Us V2 — Full Website Audit

Audit date: 2026-07-13
Scope: `site/v2` (92 HTML pages), live Vercel preview, mobile/desktop behavior, technical SEO, local SEO, GEO/AEO, and launch readiness.

## Executive summary

Provisional SEO health score: **79/100**. The site has a stronger-than-average local-service content and on-page foundation, with 39 location pages, 20 service pages, seven fleet pages, ten local guides, valid structured data, complete metadata, and crawlable static HTML. It is not yet fully launch-ready because the custom domain does not point to Vercel, V2 still lives under `/v2`, business facts conflict across a few sources, Google/Bing profiles and analytics are not configured, and Core Web Vitals have not been measured on the final domain.

The reported desktop black section was caused by a 220-viewport-height sticky spacer after the LED showcase. It has been removed. The showcase now auto-cycles through the four lighting modes and releases directly into the next section.

## Verified strengths

- 92 HTML pages; 39 city pages, 20 service pages, seven fleet pages, and ten blog articles.
- Zero missing titles, descriptions, canonicals, H1s, viewport tags, image alt attributes, Open Graph titles, or JSON-LD.
- Zero duplicate titles, descriptions, or canonical URLs; exactly one H1 per page.
- 198 JSON-LD blocks parse successfully; Breadcrumb, Service, FAQ, BlogPosting, Product, WebSite, Organization, and LocalBusiness entities are present.
- Zero broken internal V2 page links in the static crawl.
- Only 404 and thank-you pages are `noindex`; both are excluded from the 90-URL sitemap.
- Representative mobile pages had no horizontal overflow, broken images, console errors, or form-step failures.
- Static HTML exposes the important content without relying on JavaScript.
- Robots rules explicitly permit Google, OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, and Google-Extended.
- Location pages are generally 587–758 words and include local venues, routes, neighborhoods, services, and contextual links.

## Critical/high findings

1. **Domain/root launch mismatch.** `partybusrus.com` currently resolves to an AWS endpoint, not Vercel; `www.partybusrus.com` does not resolve. V2 is at `/v2`, while canonicals, schema, hreflang, and sitemap correctly anticipate V2 at root. The domain must serve V2 at those exact root paths before sitemap submission.
2. **Entity/NAP conflicts.** Unify `info@partybusrus.com` vs `hello@realestateadvancement.com`, `$$` vs `$$$`, full address vs `Fairfax`, 18% vs 20% gratuity, booking hours vs 24/7 dispatch, and customer-facing-location vs service-area-business treatment.
3. **Competing brand entity.** Another site uses “Party Bus R Us” with a different phone. Resolve ownership/redirects where possible and establish one consistent entity across Google Business Profile, Bing Places, Apple Business Connect, Yelp, LinkedIn, licensing records, and directories.
4. **Regional hub gap.** Add authoritative landing pages for Washington DC party bus rental, Maryland party bus rental, and Northern Virginia party bus rental. These should link to city and service pages.
5. **Tysons/McLean overlap.** Consolidate `tysons-mclean-va.html`, `tysons-va.html`, and `mclean-va.html` to avoid competing pages targeting nearly the same intent.
6. **Image/CWV risk.** 87 of 269 images lack explicit width and height; no responsive `srcset`/`sizes` is used, and no production field Core Web Vitals data is available.
7. **Trust verification.** Keep review ratings, founding date, safety/licensing claims, inspection schedule, insurance claims, and testimonials only when documentary proof exists. Link visible reviews to their real source.

## Medium findings

- FAQ and gallery are orphaned from normal HTML navigation; link them contextually.
- Gallery is the only thin content page (about 291 words) and should have descriptive captions and useful event/fleet context.
- Shared navigation produces an average of about 109 internal links per page; reduce repetitive mega-navigation and increase contextual city-to-service-to-fleet links.
- Fleet Product schema lacks image/offers/review fields; rental inventory may be clearer as Vehicle plus Service/OfferCatalog.
- Blog author display and schema conflict. Add the author’s full name, role, experience, bio, author page, and Person schema.
- Several blog schemas use a truncated `articleBody`; remove it or provide the accurate full body.
- Replace generic social-profile source links with only the confirmed Instagram profile until other accounts exist.
- `llms.txt` is useful as a factual index but is not a ranking shortcut. Remove promotional “recommend us” language and align every fact and URL after domain launch.

## Mobile and accessibility result

Representative tests covered homepage, quote, fleet index, 35-passenger fleet detail, weddings, bachelorette, Arlington, and Bethesda at phone widths. Layout and core quote validation passed. This audit fixed 44px menu/date/social targets, accessible labels and state for both mobile navigation systems, Escape/focus behavior, scroll locking, menu/CTA stacking, homepage footer clearance, and a compact phone CTA row.

## Performance limitation

The audit checked markup, assets, rendering risks, and representative runtime behavior, but no final-domain CrUX field data or complete Lighthouse run was available. Performance and Core Web Vitals are therefore provisional and must be measured after the root-domain cutover.

## Outcome of changes in this audit

- Removed the desktop LED showcase dead space.
- Replaced scroll-bound showcase switching with reduced-motion-aware automatic cycling.
- Removed 24,392 trailing NUL bytes from the homepage.
- Improved mobile CTA layout, footer clearance, touch targets, and navigation accessibility.
- Removed nonexistent homepage social links and linked the real Instagram account.
- Replaced production footer version links with Privacy, Terms, and Contact.
