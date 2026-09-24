# Review release — September 24, 2026

- Pull request: https://github.com/Azaiah00/partybusrus/pull/1
- Branch: `codex/seo-design-tracking-audit`
- Hosted site verified at commit: `4b28f6a3049ee852dc6985d3d79cbf82f71825f5`
- Vercel preview: https://partybusrus-git-codex-seo-design-4e39ef-freds-projects-a353dcff.vercel.app
- Verified deployment dashboard: https://vercel.com/freds-projects-a353dcff/partybusrus/2RqkDT1XKBp6D34QFfQPvEX6KGdP

The Vercel build passed. After the account owner signed in, the authenticated browser completed the hosted review below. Production has not been updated. Subsequent documentation commits record these findings; they do not change the website application code.

## Hosted verification

- Crawled all 92 linked, indexable page routes through native browser navigation. The observed route list matches the local indexable-page inventory.
- Every page had one H1, the expected production-domain canonical, loaded stylesheets, no horizontal overflow and no broken loaded images in the final inspection.
- Nine historical/clean URL redirects reached the expected destinations and preserved a test query parameter.
- Ten mobile layouts at 390px or 320px passed the same layout checks. Homepage and shared menus opened, focused their close controls, closed with Escape and restored focus to their openers.
- The journal article link opened the expected article using Enter.
- A missing URL showed the custom 404 experience and noindex metadata. A direct thank-you visit showed neutral planning copy without claiming a delivered inquiry or reservation.
- The final browser console check returned no errors or warnings. Normal viewport settings were restored.

See `hosted-preview-qa.json` for the complete route list, results and limitations. These browser checks do not expose underlying HTTP status codes, guarantee every lazy image has downloaded, or constitute a new full accessibility audit. A direct robots.txt navigation was blocked by the browser client; raw hosted sitemap/config checks were not completed. Local static and HTTP checks cover those files. No protection was disabled and no session credentials were extracted.

## Completed locally

- 95 HTML files, 92 indexable URLs, zero reported static SEO or markup failures/warnings.
- 173 HTTP checks; 14 quote and 14 analytics behavior tests pass.
- 27 representative browser layouts plus additional journal pointer/keyboard navigation checks.
- Pinned optional accessibility dependency installs with `npm ci`; the full `npm test` suite passes.

## Outstanding checks

1. Supply the business-owned GA4 Measurement ID, or explicitly authorize inspection of the relevant Google Analytics account. Automatic approval review blocked opening Analytics because private account data could be exposed. Analytics remains off until the verified ID is configured; actual consent and Realtime/DebugView receipt still require verification on the production host.
2. Confirm native FormSubmit CAPTCHA completion and actual inquiry/autoresponse delivery with the business inbox. No real test inquiry has been sent. Prior browser security policy blocked an interactive quote action, and no workaround was attempted.
3. Review and authorize the production release, then repeat production URL, consent and provider-delivery checks. Retain the previous deployment for rollback.
4. Connect Search Console and reconcile inquiries against business records before attributing results to organic search.

The implementation report records the full scope and remaining business-proof requirements. Automated accessibility results include incomplete rules and do not constitute full WCAG certification. Photo contact sheets remain local; written evidence is included in the review branch.
