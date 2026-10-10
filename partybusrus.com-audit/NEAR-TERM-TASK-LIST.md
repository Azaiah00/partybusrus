# Party Bus R Us — Current project status and next steps

Updated October 9, 2026 (Eastern). This replaces the obsolete pre-launch checklist. Public website: https://www.partybusrus.com/ . Private hub: https://partybusrus-inquiry-desk.netlify.app/ . Detailed hub QA: `inquiry-desk/QA.md`.

## Complete and verified

- Website launched on Vercel with working domain/canonical routing. October 9 live checks: all 92 sitemap URLs return HTTP 200 with matching canonicals and no page-level noindex; missing-page check returns 404.
- Local technical and markup audits: 95 pages, 92 indexable, zero failures/warnings. Live quote, Analytics, configuration, service worker and robots assets match tested local files.
- Clearer submission emails published. Existing email provider retained; owner confirms real inquiries arrive. No test email is required by the owner. Current quote tests: 23 passing.
- GA4 stream G-TM8WLPFQC3 configured with consent controls and custom dimensions. Current Analytics tests: 21 passing; public-site cache tests: 3 passing. Previous live campaign receipt verified. This does not establish complete event receipt or completed-call/booking tracking.
- Search Console URL-prefix property https://www.partybusrus.com/ verified in fredsales519@gmail.com. Sitemap last independently observed October 7: Success, 92 discovered URLs. Discovery is not proof of indexing.
- Fleet Product/Vehicle schema corrections published; Google validation started October 7. Final Google validation result remains pending verification.
- Private Inquiry Desk deployed with shared cloud storage, editing, source evidence, search/filters, follow-ups, quote/booking values, test exclusions, and phone installation instructions.
- Historical import: 18 reviewed emails, 11 customer groups, one excluded owner test. Two inferred groups require review. Source evidence: one ChatGPT referral, ten unknown. Historical coverage ends October 6.
- Private Google Sheet retained as historical backup. Portal edits do not synchronize back to it.

## Next, in priority order

1. **Automatic portal capture and catch-up.** Connect future website submissions directly to the private desk, preserving reference, source/UTMs, server timestamps and duplicate protection. Reconcile all inquiries after October 6 before claiming the desk is current. Keep provider credentials server-side. The earlier Sheet/Apps Script draft is not installed and should not be activated as a second competing workflow. Direct emails, calls and texts remain manual until separately integrated.
2. **Owner review of outcomes and groups.** Record real statuses for the ten unknown outcomes, review two inferred repeat groups, and add follow-up dates. One quote amount is recorded; no confirmed booking/revenue evidence has been entered. Never infer “lost” from an old trip date or “booked” from a quote.
3. **Physical phone sign-in and installation.** Test the actual iPhone/Safari or Android/Chrome home-screen app, opening a record, safe discard, and save. Existing project-owning Netlify login is required; do not remove the access gate to simplify access. Desktop device emulation cannot certify this flow.
4. **Search Console and GA4 performance review.** Use the existing fredsales519@gmail.com Search Console URL-prefix property to inspect indexing reasons, query/page clicks and impressions, and the pending schema validation. Compare organic visits and inquiry-source evidence over a meaningful period. The current in-app browser lacks that Google identity; setup should not be repeated. Recheck live GA4 CTA/quote event coverage without sending customers messages or treating CTA clicks as successful calls.
5. **Recovery and operational health.** Add a private export/restore workflow and test recovery. Immutable cloud versions already protect against overwrites; an independently restorable backup and visible automatic-capture health/retry status are still worthwhile additions. Never export customer data into public assets or Git.

## Useful after capture is reliable

- Follow-up reminders and an upcoming-trip view; define the intended reminder channel before enabling messages.
- Outcome/source reporting using confirmed bookings and amounts, with explicit unknown-source and unknown-outcome buckets.
- Duplicate review tools with a reversible merge/split flow; retain original submission evidence.
- Fresh PageSpeed/Core Web Vitals measurement on representative live pages. Previous public request hit quota; no current score or field-pass claim.
- Physical Safari, genuine 200% zoom, keyboard and screen-reader coverage beyond the desktop/browser checks performed so far.
- Verify business profile/citation consistency (Google Business Profile, Bing Places, Apple Business Connect) and Bing Webmaster setup. Use owner-confirmed address, service-area and hours facts; no guessed 24/7 hours.
- Continue original photography, bus walk-throughs, public review evidence and useful local content. Prioritize pages/query gaps from actual Search Console evidence before expanding the content backlog.
- Confirm the relationship and contact details of any older business website before changing cross-links or phone-number explanations.

## Superseded proposals

- Do not connect customer submissions to an unrelated Real Estate Advancement Supabase project.
- Do not recreate GA4 or Search Console, resubmit a successful sitemap repeatedly, or resume the obsolete Sheet capture installation by default.
- Do not equate form attempts, call-link taps, discovered sitemap URLs or recorded referrers with accepted leads, completed calls, indexed pages, bookings or revenue.

No new recurring automation, customer messaging, call tracking subscription, or database access expansion has been enabled by this audit.
