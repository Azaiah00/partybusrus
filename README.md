# Party Bus R Us

Current release verified: October 6, 2026. Static website hosted on Vercel at https://www.partybusrus.com.

The revised site is live following the owner-approved merge of [pull request #1](https://github.com/Azaiah00/partybusrus/pull/1), with the mobile consent and quote-click follow-up published in [pull request #2](https://github.com/Azaiah00/partybusrus/pull/2). Earlier hosted QA covered all 92 linked pages, nine redirect cases and ten mobile layouts. Production HTTP checks passed across 95 pages, assets, redirect chains and missing-page behavior. October 6 checks confirmed the follow-up's live source parity, mobile notice layout and Google Analytics receipt of a native quote-click test, alongside page views and quote-step views. Preview collection stays disabled; actual inquiry delivery and booking attribution remain separate checks.

## Current files

- `site/`: current static website source, including shared assets and Vercel configuration. Existing archived generators do not reproduce these revisions.
- `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md`: changes, QA results and external completion requirements.
- `partybusrus.com-audit/2026-09-24/FULL-AUDIT-REPORT.md`: original live-site audit baseline.
- `site/ANALYTICS-SETUP.md`: current GA4 consent, event and source configuration; no placeholder collectors.
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

## Remaining measurement work

The GA4 property, stream and eleven reporting dimensions are configured; see `site/ANALYTICS-SETUP.md`. Live tag loading follows consent, and Realtime receipt is verified for page views, the initial quote step and a native quote-click test. Confirm an actual FormSubmit inquiry and autoresponse arrive, then inspect Search Console with authorized access and connect the business's phone/email inquiry records. Do not treat browser clicks or a form handoff as a confirmed lead or booking. See the implementation release report for exact QA limits.
