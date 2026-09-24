import fs from 'node:fs';import path from 'node:path';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])}
for(const p of walk('site').filter(p=>/\.(html|css|js|xml|json|txt|md)$/.test(p))){const before=fs.readFileSync(p,'utf8'),after=before.replace(/[ \t]+(?=\r?$)/gm,'').replace(/(?:\r?\n){4,}/g,'\n\n\n').trimEnd()+'\n';if(before!==after)fs.writeFileSync(p,after)}
fs.writeFileSync('README.md',`# Party Bus R Us

Current implementation: September 24, 2026. Static website hosted on Vercel at https://www.partybusrus.com.

The revised site is implemented and tested locally. It has not been deployed. GitHub publishing authentication is invalid, and no Vercel credentials were found in the checked local locations or environment. Analytics remains off until the real business-owned GA4 ID is configured.

## Current files

- 'site/': current static website source, including shared assets and Vercel configuration. Existing archived generators do not reproduce these revisions.
- 'partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md': changes, QA results and external completion requirements.
- 'partybusrus.com-audit/2026-09-24/FULL-AUDIT-REPORT.md': original live-site audit baseline.
- 'site/ANALYTICS-SETUP.md': current GA4 consent, event and source configuration; no placeholder collectors.
- 'scripts/': preview and repeatable verification tools. Page migration scripts document this implementation and should not be rerun as generators.
- 'deliverables/', 'archive/', 'source-photos/', 'PhotosVideos/' and logo folders: historical plans and original assets. Older Netlify instructions, tracking placeholders and launch-ready claims are superseded by the current implementation report.

## Preview and verify

Run 'node scripts/serve-preview.mjs' and open http://127.0.0.1:4173/.

'''text
node scripts/audit-site.mjs --output partybusrus.com-audit/2026-09-24/implementation/local-technical-qa.json
node scripts/test-markup.mjs --output partybusrus.com-audit/2026-09-24/implementation/markup-qa.json
node scripts/test-http.mjs
node scripts/test-quote.mjs
node scripts/test-analytics.mjs
'''

HTTP checks require the preview server. The local preview's optional '?qa=1' helper uses the existing verification dependencies under '.verify/' and is not shipped in 'site/'.

## Before live release

Restore access to the existing Vercel project, configure the verified GA4 ID, and confirm an actual FormSubmit inquiry reaches the business inbox. After release, verify production URLs, consent, GA receipt and the native CAPTCHA/autoresponse workflow. Do not treat browser clicks or a form handoff as a confirmed lead or booking. Use Search Console and business records to measure SEO and booking performance.
`);
fs.writeFileSync('site/PRODUCTION-READY-HANDOFF.md',`# Current release status — September 24, 2026

The revised website is tested locally and is not yet deployed. The earlier Netlify deployment and placeholder tracking instructions are superseded. The current host is Vercel.

See the project report at 'partybusrus.com-audit/2026-09-24/implementation/IMPLEMENTATION-AND-QA.md' and 'ANALYTICS-SETUP.md' for exact verification scope and remaining requirements.

Local checks cover all 95 HTML files, 173 HTTP checks, 28 quote/analytics behavior tests and representative browser layouts. They do not establish production delivery or account-side measurement.

Publishing access must be restored; the real GA4 ID is required to activate analytics. Confirm receipt of a native FormSubmit request and its autoresponse, then verify the live release. Call/email clicks remain engagement signals, not completed contacts. Approved vehicle facts, booking policies and review sources are still required for stronger evidence-led content.
`);
console.log('Whitespace and current handoff documents updated.');
