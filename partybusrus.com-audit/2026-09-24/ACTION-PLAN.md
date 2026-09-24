# Party Bus R Us — prioritized implementation plan

September 24, 2026. Proposed work, not completed changes. Effort ranges are planning estimates and exclude waiting for access/business decisions. Preserve current production and existing ranking URLs during rollout.

| Priority / timing | Action and evidence | Dependency / owner | Effort | Acceptance and failure check |
|---|---|---|---|---|
| Immediate | Correct prom-guide capacity ranges and contradictory standing/insurance guidance | Operator verifies capacities and applicability; editor implements | 1–3 hours plus review | No recommendation exceeds capacity including chaperones; sources and company policy agree. Any contradiction blocks release |
| Immediate | Unify deposit, cancellation, payment, quote validity and weather terms | Owner identifies actual agreement; editor updates all affected pages | 2–4 hours plus review | One approved policy inventory; all pages and confirmations match, with clear date boundaries |
| Week 1 | Verify existing inquiry receipt and delivery configuration | Owner/provider/mailbox access | 1–2 hours plus test window | One authorized labeled request yields provider acceptance and mailbox receipt. Provider failure must not appear as successful lead |
| Week 1 | Inventory existing analytics/Search Console/GBP accounts, preserve historical baseline | Read-only access or exports; analytics owner | 1–3 hours | Correct domain/property, date range and ownership confirmed; do not create duplicate properties blindly |
| Week 1 | Implement one shared GA4 event path and correct success semantics | Account selection, consent/privacy behavior, delivery-success design | 0.5–1.5 days | Exactly one page view; one accepted lead per request; no leads on validation error, failed submit, direct thank-you or reload |
| Week 1 | Preserve acquisition source and vehicle/service preference | Shared measurement architecture | 0.5–1 day | Campaign home → fleet → quote retains original source and selected bus. Missing source or lost selection fails test |
| Week 1 | Normalize canonical/sitemap/schema/hreflang/internal-link destinations | Use live www/clean URL convention; retain legacy redirects | 0.5–1 day | All indexable canonicals and sitemap entries return200 directly; intended old URLs resolve to corresponding final page |
| Week 1 | Link 15 currently unreachable pages from appropriate hubs | Confirm offerings and useful city coverage | 2–4 hours | Each intended page is reachable through ordinary descriptive links from home/hubs; no irrelevant link dump |
| Weeks 1–2 | Replace unsupported schema type; verify rating/offer/identity data | Business proof and canonical convention | 2–5 hours | Schema.org validation and applicable Google tests pass; visible and structured facts agree; no star-result promise |
| Weeks 1–2 | Correct stale itineraries and verify claims/reviews/availability | Operator and primary venue/review records | 0.5–1 day initially | No closed/unverified stop sold as current; every material claim has source/owner/date; static count not presented as live inventory |
| Weeks 2–3 | Apply Afterglow, Refined to home/fleet/quote preview | Fred selects direction; measurement baseline and approved facts | 2–4 days | Mobile hero/action clear; selected vehicle persists; 44px targets; keyboard/reduced motion/zoom work; comparable lead completion does not deteriorate |
| Weeks 2–4 | Reconcile GBP/domain/listing identity and both phone lines | Owner identifies valid current entity and account | 0.5–1 day plus platform turnaround | Listing matches actual service model; genuine alternate numbers retained where valid; no duplicate GBP created |
| Month 2 | Improve top5–10 landing pages with real local trip evidence | Search/lead data, photos and operational proof | 2–4 days | More qualified inquiries per relevant landing-page visit; if impressions rise without qualified leads, revisit intent and promise |
| Ongoing | Review sources, delivery, missed calls, qualified leads, bookings and content accuracy | Reliable data/log ownership | 30–60min weekly; content review monthly | Detect delivery failures quickly; compare periods and seasonality; do not optimize to duplicate click/lead totals |

## Suggested first sprint

1. Confirm the actual business rules and recent inquiry delivery.
2. Restore trustworthy measurement, source persistence and successful-lead counting.
3. Correct the live content errors, canonical/schema consistency and internal links.
4. Preview homepage/mobile and fleet-to-quote improvements using the recommended Fred direction.
5. Publish reviewed changes, verify live behavior and collect a comparable baseline before increasing spend.

## Monitoring definitions

**Search visibility:** Search Console clicks, impressions, CTR, position by query/page/device. **Website intent:** quote starts and contact-button clicks. **Leads:** accepted provider inquiries and connected qualified calls. **Commercial outcome:** quote sent, booking/deposit confirmed, actual booking value. Each must remain distinct; do not add these stages together as a total conversion count.

## Work requiring additional input

Account access or exports are required for actual performance reporting. Business-policy and fleet facts require operator confirmation. Final email/call delivery needs an authorized test and receipt observation. A full visual redesign requires direction selection under FRED//FORM. These requirements do not block routine audit completion or preparation of reviewable implementation work.

## Scope discipline

No new city-page factory, domain migration, automatic directory edits, paid call-tracking purchase, advertising launch or production publication is included in this audit. Each would need its own concrete implementation scope. No permanent monitoring automation was scheduled.
