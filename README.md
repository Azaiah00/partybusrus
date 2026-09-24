# Party Bus R Us

Current implementation: September 24, 2026. Static website hosted on Vercel at https://www.partybusrus.com.

The revised site is implemented and tested locally. [Draft pull request #1](https://github.com/Azaiah00/partybusrus/pull/1) is open and Vercel has successfully built its protected preview. Authenticated hosted QA passes across all 92 linked pages, nine redirect cases and ten mobile layouts. Production has not been updated. The verified business-owned GA4 stream is configured in this branch, with consent required and preview collection disabled. Production event receipt remains unverified.

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

## Before live release

Review the branch and its deployment preview in the existing Vercel project. The GA4 property, stream and eleven reporting dimensions are configured; see `site/ANALYTICS-SETUP.md`. Confirm an actual FormSubmit inquiry reaches the business inbox. After release, verify production URLs, consent, GA receipt and the native CAPTCHA/autoresponse workflow. Do not treat browser clicks or a form handoff as a confirmed lead or booking. Use Search Console and business records to measure SEO and booking performance.
