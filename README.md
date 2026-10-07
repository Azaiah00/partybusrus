# Party Bus R Us

Last verified production baseline before this update: October 7, 2026. Static website hosted on Vercel at https://www.partybusrus.com.

The last verified production baseline before this update contains the owner-approved SEO, design and tracking work through [pull request #6](https://github.com/Azaiah00/partybusrus/pull/6), production commit `2343c3ff0f8330b7a0c1aab3dc6171331696ca1e`. Follow-ups corrected mobile consent spacing, quote-click delivery and campaign attribution, added Search Console verification, and removed unverified sitemap modification dates. Vercel reports a successful production deployment. Earlier hosted QA covered all 92 linked pages, nine redirects and ten mobile layouts; the original production HTTP review passed 169 checks. Google Analytics received the tested page, quote-step, native quote-click and distinct campaign events. Preview collection stays disabled; actual inquiry delivery and booking attribution remain separate checks.

The October 7 contrast follow-up improves five quote/consent contrast states and advances the local service worker to v13. Static contrast checks, all three cache tests and 95-page/seven-script markup checks passed. Rendered local checks confirmed placeholder and selected-contact styles without overflow at 1280px and 390px; no console errors or warnings were returned. Hover/focus browser states, actual 200% zoom and physical Safari testing remain unverified. Deployment verification for this follow-up was pending when this handoff was prepared.

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

The GA4 property, stream and eleven reporting dimensions are configured; see `site/ANALYTICS-SETUP.md`. On October 7, Search Console showed sitemap **Success** with 92 discovered pages. Discovery is not proof that all pages are indexed. The Web performance report was still processing, so no search-performance baseline is available yet. Keep the verification tag and existing sitemap submission in place.

Confirm one clearly labeled, authorized FormSubmit test reaches the business inbox, supports replying to the sender, sends its customer autoresponse and returns to the expected page. Use the delivered local inquiry workbook for phone/email inquiries and booking outcomes. Do not treat browser clicks or a form handoff as confirmed leads or bookings. Complete network/cookie inspection and remaining accessibility checks are separate from the evidence already recorded; see the implementation report for exact limits.
