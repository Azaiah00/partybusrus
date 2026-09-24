# Content implementation — September 24, 2026

Changed only the assigned 19 service detail pages, 10 blog articles, pricing, terms, FAQ, reviews and about pages. Shared styles, navigation and footer structures retained; main content now uses the existing page-hero/article/container/button classes. The homepage, shared scripts, quote page and global URL normalization are owned by other workers.

## Decisions and corrections

- Booking policy uses one honest interim sentence: “Your written quote and booking agreement specify the deposit, payment deadlines, cancellation/refund and weather terms. Review them before paying.” No new deposit amount, refund period, payment deadline, response guarantee or quote validity was invented.
- Replaced unsupported package inclusions, free extras, exact rates, customer-volume statistics, market superiority and invented-looking trip narratives with event-specific planning support. Each service explains its own passenger, timing, venue and quote considerations.
- Removed unverified customer testimonials from owned main content and their obsolete embedded review/aggregate rating data. Reviews page now offers review-evaluation guidance and clearly labeled private feedback, without pretending the contact page is Google Reviews.
- Corrected prom group arithmetic to include adults and require sufficient passenger seats. No standing allowance at low speeds remains. Legal claims about blanket DMV chaperone, curfew and BYOB rules were replaced with specific questions and alcohol-free youth-event planning.
- Federal insurance discussion correctly distinguishes the 16+ and 15-or-fewer vehicle thresholds, including the driver, with applicability/exemption caveats. It does not assert the operator’s actual policy limits.
- Removed closed/unverified restaurant and tasting itineraries from service packages. Brewery guide documents why One-Eight Distilling was removed, and does not substitute a guessed operating venue. Winery guide supplies five adaptable planning formats rather than claiming pre-confirmed tours.
- Wedding vehicle comparison distinguishes general options from actual owned/available inventory. Corporate content no longer promises an unlisted sprinter, net-30 credit, Wi-Fi or other unverified features.
- Article dates reflect this substantive revision; obsolete artificial reading-time labels were removed. Existing article URL/title subjects remain relevant, and each article links to the appropriate service/quote context.
- All primary service quote links use `/quote.html?event=<service-slug>`. Parent implements the slug-to-form-option mapping and preserves the intent. Blog CTAs use the matching service slug where relevant. A request is explicitly not a reservation or instant price.

## Primary sources checked before editing

- FMCSA insurance applicability and limits: https://www.fmcsa.dot.gov/safety/passenger-safety/licensing-and-insurance-requirements-hire-motor-carriers-passengers-parts
- DC ABCA One-Eight cancellation order (April 3, 2024): https://abca.dc.gov/sites/default/files/dc/sites/abra/publication/attachments/One-EightDistilling-432024.pdf
- Smoking Goose’s official site confirms its Indianapolis location; removed it as a DC meal stop: https://www.smokinggoose.com/

## Files

- `site/services/weddings.html`
- `site/services/bachelorette.html`
- `site/services/birthdays.html`
- `site/services/prom.html`
- `site/services/sweet-16.html`
- `site/services/quinceaneras.html`
- `site/services/winery-tours.html`
- `site/services/brewery-crawls.html`
- `site/services/corporate.html`
- `site/services/airport-shuttle.html`
- `site/services/concerts-sports.html`
- `site/services/dc-monument-tours.html`
- `site/services/casino-trips.html`
- `site/services/college-greek.html`
- `site/services/funerals.html`
- `site/services/holiday-light-tours.html`
- `site/services/nye-packages.html`
- `site/services/out-of-town.html`
- `site/services/anniversaries.html`
- `site/pricing.html`
- `site/terms.html`
- `site/faq.html`
- `site/reviews.html`
- `site/about.html`
- `site/blog/prom-party-bus-safety-checklist.html`
- `site/blog/how-much-does-a-party-bus-cost-dmv.html`
- `site/blog/dc-brewery-crawl-by-bus.html`
- `site/blog/loudoun-winery-tour-bus-routes.html`
- `site/blog/wedding-shuttle-vs-trolley-vs-party-bus.html`
- `site/blog/bachelorette-party-bus-dc-planning-guide.html`
- `site/blog/30th-birthday-party-bus-ideas-dc.html`
- `site/blog/corporate-shuttle-tysons-to-dc.html`
- `site/blog/quinceanera-party-bus-northern-virginia.html`
- `site/blog/how-to-pick-a-party-bus-operator-in-the-dmv.html`

## Validation

Passed balanced main HTML, one H1, JSON-LD parse and removed-risk phrase checks for 34 pages. All 19 service pages pass their matching event-handoff check. Original first article figures retained where available. Final global schema/URL cleanup, rendering and submission tests remain parent workstreams.

## Stage 2 — local pages, Spanish, journal and wedding gallery

Updated 44 additional assigned pages on September 24, 2026: all 41 city/regional HTML pages except `cities/index.html`, plus `es/index.html`, `blog/index.html` and `weddings-portfolio.html`. No new pages, shared CSS changes, production publication or unverified operating promises were added.

- The 38 detailed city pages retain their original hero imagery, location headings, destination ideas and related-service links. Replaced unsupported pickup-volume rankings, purported completed trips, fabricated customer quotes, fixed route timings and minimum-booking claims with specific local planning considerations. Destination ideas are explicitly conditional on current venue operations, access and availability. Removed the stale R&R Hotel suggestion and unsupported seasonal operating assumptions.
- All 41 city/regional pages now pass the area slug in quote links (`?area=city-slug`). Parent owns quote-form consumption. The 38 detailed city breadcrumbs now link Service Area to `/cities/index.html` rather than an unrelated services page or plain text. Route cards have real accessible quote links.
- Three regional pages preserve their city links, route tables and layout; removed fixed 20% gratuity inclusions, 24/7 dispatch promises, hard-coded minimums and inconsistent quote terms. Their visible FAQ guidance now defers to the written agreement. Removed old FAQ schema answers.
- The Spanish page now describes a quote request rather than an instant confirmed reservation. Removed the 40-passenger Imperial claim, unsupported restroom/amenity guarantees, superiority claims, automatic package extras, turnaround promises and refund assumptions. Capacity, all-riders counting, seated travel, route inputs and payment terms align with English guidance. Preserved the existing hero image, three vehicle images and principal fleet/service/contact links.
- All ten journal cards now match the actual rewritten article headings and summaries. Updated dates reflect this edit; removed fabricated reading times, real-price claims without rates, insider trip-history claims and the unsupported 80% operator statistic. Fixed the featured heading's duplicate style/onclick markup with a real link.
- The wedding gallery keeps all 12 available image tiles, with neutral vehicle-photo labels. Removed invented couples, venue/date attributions and testimonials. The page now helps visitors plan wedding transportation and confirm their proposed vehicle. Photos are explicitly not proof of a past wedding itinerary or current availability.

Validation: 44 main-content HTML fragments checked for balanced nesting, one document H1, JSON-LD parsing, local link/image existence, known removed claim patterns, 41 city handoffs, 38 city breadcrumbs, 12 gallery tiles and ten journal cards. See `content-stage2-validation.json`. Parent owns combined visual/browser QA, final common metadata/URL/schema normalization and quote field behavior. The one-time scripts are evidence of edits, not production build steps; do not rerun them over subsequent shared changes.

## Final merged content review and authorized cleanup

A read-only targeted scanner inspected all 95 HTML documents, separately extracting visible text, meta values and JSON-LD values while excluding CSS and ordinary scripts. It identified residual legacy description strings that the general technical checks did not evaluate semantically. With parent authorization, cleaned 74 schema description values to match each page's current meta description; removed the homepage's old hero KPI markup; corrected three contact titles, seven regional 24/7 references and the narrated-tour menu promise. Edits affected 75 files and were limited to approved copy/description values and removal of the obsolete hero-meta block. See `content-final-cleanup.json`. All 95 pages' JSON-LD parsed successfully after editing. No target 24/7, fast-quote guarantee, stale venue, 40-passenger, background-check or GPS claim remained in extracted copy/meta; one services-menu 'See real weddings' label was reported separately to parent for correction.

The initial `content-final-scan.json` is PRE-cleanup evidence and contains known findings since corrected; it is not a current failure report.

### Remaining content development priorities

- Main-content medians after proof cleanup: 41 city/region pages 349 words, 19 service pages 325, ten articles 508. These are coverage observations, not ranking thresholds. Do not add padding or fabricate firsthand stories to hit arbitrary lengths.
- Most city pages share planning guidance and differ mainly in local context and route ideas. Add genuinely useful, verified entrance/loading instructions, current official venue links, original route decisions, and consented trip evidence where available. Continue to evaluate the overlapping Tysons/McLean URLs using actual Search Console queries and page results before consolidating.
- Service and blog pages have clearer decisions but little first-hand evidence. Owner-approved vehicle specifications, genuine current photographs tied to the actual vehicle, documented operator qualifications and named accountable review/authorship would improve trust more than unverified marketing claims.
- The pricing article now explains quote factors without actual operator rates. That is honest but leaves a comparison-shopping need unresolved. Add approved indicative ranges or example quotes with dates, inclusions and exclusions only if the business supplies defensible pricing evidence.
- The reviews page no longer publishes unverified testimonials. Its remaining 'Reviews & Testimonials' title can imply reviews are available even though the page currently teaches evaluation and invites private feedback. Consider 'Reviews & Feedback' until genuine source-linked reviews are supplied.
- Keep existing URLs and indexability while observing real impressions, queries, clicks and completed inquiries after tracking and Search Console access are confirmed. An immediate word-count reduction alone does not justify deleting/noindexing pages. Parent's combined technical and visual QA remains separate from content proof review.
