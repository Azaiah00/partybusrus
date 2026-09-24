# Current release status — September 24, 2026

The revised website is tested locally, with [draft pull request #1](https://github.com/Azaiah00/partybusrus/pull/1) open and a successful Vercel preview build. After the account owner signed in, hosted QA passed across all 92 linked pages, nine redirect cases and ten mobile layouts. Production has not been updated. GitHub publishing access is verified. The current host is Vercel; earlier Netlify deployment and placeholder tracking instructions are superseded.

See the project report at `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md` and `ANALYTICS-SETUP.md` for verification scope and remaining requirements.

Local checks cover all 95 HTML files, 173 HTTP checks, 28 quote/analytics behavior tests and representative browser layouts. They do not establish production delivery or account-side measurement. Journal cards also support pointer and keyboard navigation to their native links.

Review the deployment preview in the existing Vercel project before release. The real GA4 ID is required to activate analytics. Confirm receipt of a native FormSubmit request and its autoresponse, then verify the live release. Call/email clicks remain engagement signals, not completed contacts. Approved vehicle facts, booking policies and review sources are still required for stronger evidence-led content.
