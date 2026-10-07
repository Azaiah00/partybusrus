# Party Bus R Us

Last verified production baseline before this update: October 7, 2026. Static website hosted on Vercel at https://www.partybusrus.com.

The last verified production baseline before this update contains the owner-approved website work through [pull request #7](https://github.com/Azaiah00/partybusrus/pull/7), production commit `979f51281d2b40285890d8b743bb2fc54fb0593b`. Vercel reports a successful production deployment. The release includes SEO/design improvements, consent and quote tracking, corrected campaign attribution, Search Console verification, sitemap cleanup and five contrast fixes. Google Analytics received the tested page, quote-step, native quote-click and distinct campaign events. Preview collection stays disabled; inquiry email receipt is owner-reported and booking attribution still requires business records.

PR #7's live CSS and v13 service worker matched reviewed source. After reload, production placeholder/contact-choice styles and both privacy keyboard-focus outlines matched the fixes, with no desktop overflow or console warnings/errors; no Google loader was present while analytics was off. Local mobile checks also passed; other hover states, actual 200% zoom and physical Safari remain unverified. Historical QA scopes are recorded in the implementation reports.

The current follow-up corrects misleading gallery metadata and removes legacy Vehicle markup from Midnight 20 and Bridal 25, retaining all seven Service and seven BreadcrumbList blocks unchanged. The strengthened SEO audit caught both Vehicle nodes before removal, then passed 95 pages/92 indexable URLs with zero failures or warnings; markup checks also passed all 95 pages/seven scripts. Search Console's October 7 Product report showed one affected Midnight 20 item missing offers/review/aggregateRating, from a September 29 crawl. Local checks and independent review passed; publication and Google validation remain separate, and the reported issue is not yet confirmed cleared.

## Current files

- `site/`: current static website source, including shared assets and Vercel configuration. Existing archived generators do not reproduce these revisions.
- `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md`: changes, QA results and external completion requirements.
- `partybusrus.com-audit/2026-09-24/FULL-AUDIT-REPORT.md`: original live-site audit baseline.
- `site/ANALYTICS-SETUP.md`: current GA4 consent, event and source configuration; no placeholder collectors.
- `site/PRODUCTION-READY-HANDOFF.md`: current release, completed setup and remaining owner actions. `HANDOFF-TO-CODEX.md` is an archived brief, not current instructions.
- `outputs/`: local-only deliverables, including the inquiry tracker workbook. This directory is excluded from Git; keep customer records there, outside website releases.
- `scripts/`: preview and repeatable verification tools. Page migration scripts document this implementation and should not be rerun as generators.
- `deliverables/`, `archive/`, `source-photos/`, `PhotosVideos/` and logo folders: historical plans and original assets. Older Netlify instructions, tracking placeholders and launch-ready claims are superseded by the current implementation report.

## Preview and verify

Use Node.js 20 or newer. The static website has no build step. From the repository root, run:

```sh
npm ci
npm run preview
```

Open http://127.0.0.1:4173/. In another terminal, run `npm test` for the full local suite. HTTP checks require the running preview server. Individual quote and analytics checks are available as `npm run test:quote` and `npm run test:analytics`; `npm run seo:check` checks normalization without writing files.

`npm ci` installs only the pinned development accessibility library. Adding `?qa=1` to a preview page runs the optional browser accessibility report. These helpers are not shipped in `site/`. The other checks use only Node's built-in modules. The preview binds to localhost and rejects form submissions.

Sitemap `lastmod` dates are optional and intentionally omitted until reviewed per-page dates of substantive content changes are available. Do not copy dates from an older sitemap or substitute build times, filesystem timestamps, or the latest commit date. Verification tags and routine deployment changes alone should not advance a page's content date.

## Remaining measurement work

The GA4 property, stream and eleven reporting dimensions are configured; see `site/ANALYTICS-SETUP.md`. On October 7, Search Console showed sitemap **Success** with 92 discovered pages. Discovery is not proof that all pages are indexed. That afternoon, Overview still showed Performance and Indexing processing, so no completed search-performance/indexing baseline is available yet. Keep the verification tag and existing sitemap submission in place.

The owner reports receiving inquiry emails and chose to skip the TEST submission. No further delivery test is requested; mailbox receipt was not independently inspected, and autoresponse/Reply-To behavior is not established. Revisit those diagnostics only if an issue arises. Use the delivered local inquiry workbook for phone/email inquiries and booking outcomes. Browser clicks and form handoffs remain intent signals, not confirmed leads or bookings. Complete network/cookie inspection and remaining accessibility checks are separate from the evidence already recorded.
