# Current release status — September 24, 2026

The revised website is live after the owner-approved merge of [pull request #1](https://github.com/Azaiah00/partybusrus/pull/1). Hosted QA passed across all 92 linked pages, nine redirect cases and ten mobile layouts. Production HTTP checks passed across 95 pages and related assets, redirects and missing-page behavior. Google Realtime received consented page views and the initial quote-step event. The current host is Vercel; earlier Netlify deployment and placeholder tracking instructions are superseded.

See the project report at `partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md` and `ANALYTICS-SETUP.md` for verification scope and remaining requirements.

Local checks cover all 95 HTML files, 173 HTTP checks, 32 quote/analytics behavior tests, three service-worker cache regression tests and representative browser layouts. These local checks are separate from the production Realtime observations above and do not establish inquiry delivery. Journal cards also support pointer and keyboard navigation to their native links.

The real GA4 ID is configured, Enhanced Measurement is off and eleven event-scoped reporting dimensions are saved. Live consent controls govern tag loading. Remaining checks include receipt of a native FormSubmit request and its autoresponse, other event types, Search Console and phone/booking attribution. Call/email clicks remain engagement signals, not completed contacts. Approved vehicle facts, booking policies and review sources are still required for stronger evidence-led content.
