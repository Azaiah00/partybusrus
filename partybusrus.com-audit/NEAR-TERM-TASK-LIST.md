# Party Bus R Us — Current project status and next steps

Updated October 9, 2026 (Eastern). This replaces the obsolete pre-launch checklist. Public website: https://www.partybusrus.com/ . Private hub: https://partybusrus-inquiry-desk.netlify.app/ . Detailed hub QA: `inquiry-desk/QA.md`.

## Complete and verified

- Website launched on Vercel with working domain/canonical routing. October 9 live checks: all 92 sitemap URLs return HTTP 200 with matching canonicals and no page-level noindex; missing-page check returns 404.
- Local technical and markup audits: 95 pages, 92 indexable, zero failures/warnings. Live quote, Analytics, configuration, service worker and robots assets match tested local files.
- Clearer submission emails published. Existing email provider retained; owner confirms real inquiries arrive. No test email is required by the owner. Current quote tests: 23 passing.
- GA4 stream G-TM8WLPFQC3 configured with consent controls and custom dimensions. Current Analytics tests: 21 passing; public-site cache tests: 3 passing. Previous live campaign receipt verified. This does not establish complete event receipt or completed-call/booking tracking.
- Search Console URL-prefix property https://www.partybusrus.com/ rechecked October 9 in Chrome as fredsales519@gmail.com. Sitemap Success, 92 discovered URLs, last read October 7. Indexing report still processing; discovery is not proof of indexing.
- Fleet schema validation now PASSED: zero invalid Product items. Breadcrumbs: 20 valid, zero invalid. HTTPS: 21 HTTPS, zero non-HTTPS; Core Web Vitals has insufficient field data.
- Private Inquiry Desk deployed with shared cloud storage, editing, source evidence, search/filters, follow-ups, quote/booking values, test exclusions, and phone installation instructions.
- Historical import: 19 reviewed emails, 12 customer groups, one excluded owner test. Two inferred groups require review. Source evidence: one ChatGPT referral, eleven unknown. Historical coverage ends October 8 after Inbox/Sent/Spam/Trash review; mailbox locations unchanged.
- Added agenda, downloadable calendar reminders, fresh private JSON backups, saved-version recovery and isolated backup recovery tooling. Current portal tests: 33 passing; shared importer tests: 44 passing. Phone-width 320/390 layouts, synthetic save/reopen/version restore and actual ICS/JSON downloads verified.
- Search performance available October 5–6 only: 2 clicks, 57 impressions, 3.5% CTR, average position 24.2. Both visible clicks are branded. Too little data to claim an SEO growth trend or attribute all inquiries to search.
- Private Google Sheet retained as historical backup. Portal edits do not synchronize back to it.

## Next, in priority order

1. **Capture activation — owner approval needed.** The eight-hour server importer, deduplication, source preservation and health display are implemented/tested. No provider key requested or connected yet; specific archive-access approval is pending. Then request the provider email, connect its key privately, verify a real archive import and the scheduled run. Catch-up through October 8 is complete. Direct emails/calls/texts stay manual. Do not activate the obsolete Sheet importer too.
2. **Outcomes — owner facts needed.** Eleven customer outcomes are unrecorded; two inferred repeat groups remain flagged. Sent mailbox contained no booking evidence. Owner must identify confirmed statuses/amounts and confirm or correct groups; do not invent bookings or losses. Date-based reminders are ready once follow-ups are entered.
3. **Phone — physical check needed.** Phone-responsive views and installation help are ready. Await iPhone/Android selection and owner sign-in/install test. Existing Netlify owner login is required; keep the gate. Desktop emulation cannot verify physical installation.
4. **Reports — partially complete.** Search Console review is complete for currently available reports; indexing is still processing. Existing GA4 account 409524610 / property 555887564 returns Missing permissions under fredsales519@gmail.com. Await the original Analytics Google identity; do not recreate the property or broaden access. Review acquisition/events there once accessible. No access-request message was sent.
5. **Recovery and agenda — implemented.** Downloaded JSON validates; exact record/evidence recovery to isolated test storage passed; saved-version restore passed in browser. Keep private backups and periodically exercise recovery. Actual phone calendar import and production disaster recovery remain untested. No automatic external reminders are enabled.

## Useful after capture is reliable

- Optional automatic push reminders after phone installation and capture are reliable; current reminders are calendar downloads requiring import.
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

A production capture schedule is deployed but has no credential, so provider access is inactive. No customer messaging, call-tracking subscription, database access expansion or new Codex recurring automation was enabled.
