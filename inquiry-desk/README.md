# Party Bus R Us · Inquiry Desk

Dedicated private Netlify app. This folder does not change the public Vercel website.

## Runtime

Static HTML/CSS/ES modules, a Netlify v2 Function, and private Netlify Blobs documents. All production and preview deploys MUST require Netlify team login. Site ID: `1cee1f6f-515a-4374-a1e7-d6c803f0cef6`. Only the existing owner is a team member. The API fails closed unless the server environment variable `DESK_ACCESS_VERIFIED=team-login-all-deploys` is present. This switch is an operational guard, not an authentication mechanism: Netlify's platform gate authenticates every request. Never deploy this API to an unprotected site. Verify anonymous root/API/function/deploy URLs before changing this switch or importing data.

Customer data is stored server-side, never in public files. Same-origin JSON requests are required for changes. Each saved version is a new immutable object; atomic `onlyIfNew` creates one winner per version. Strongly consistent reads and version checks reject stale-device edits. There is no mutable shared index, read-modify-write counter, financial ledger, or last-writer-wins overwrite. This is a small, infrequently edited document collection; consider a database if the app grows into a transactional CRM. API responses are no-store. The service worker does not cache authenticated content. Device installation and Netlify sessions require live-device verification.

The generated server-only `lib/deployment.mjs` fixes the store for each deployed function bundle. Normal builds target `inquiry-preview-v1`; `npm run build -- --production` targets `inquiry-production-v1`. Keep them separate. Preview edits must never reach production documents. The old Netlify `DESK_STORE_NAME` environment variable is not read by the application. Data survives deploys. All original versions are retained; no deletion endpoint is exposed.

## Records and evidence

Historical snapshot: emails through October 6, 2026, reviewed October 7. Preserve all 18 source messages, 11 customer groups and one owner-confirmed test; two inferred groups require review. Blank status is unknown, not New. The $1,500 quote is customer-reported, not a confirmed booking. Source classification does not infer Google organic from missing/internal referrers.

The original private Google Sheet remains a historical backup; edits in the desk do not sync back to it. Automatic form capture is NOT configured. Calls and direct emails are manual. No email/call/text is sent by the app until the owner uses a contact link in their own mail/phone app.

## Local checks

`npm ci`, `npm test`, `npm run build`. `node scripts/dev-server.mjs` starts an isolated synthetic document store on loopback, never production. The QA records are marked as fictional. Stop the process after QA. The production dependency audit is separate from the Netlify CLI's development dependencies.

## Deployment

Use Netlify CLI 27.12.0 or a verified newer release, separately from application dependencies (for example `npx --package netlify-cli@27.12.0 netlify`). Run `npm run build`, then `netlify deploy --no-build --dir public --functions netlify/functions` for a preview. Production after QA: first `npm run build -- --production`, then the same deploy command with `--prod`. Never run a normal preview build between the production build and production deploy. The compiled store choice avoids platform context/environment ambiguity, and is consistent on both the permanent address and immutable deployment URL. This project is manually deployed and is not attached to the public website's Git deployment. The explicit publish folder also avoids parent-repository build detection. Deployment-only CLI dependencies were removed from the app after release.

The historical import uses private local evidence and the official Netlify Blobs CLI. It skips existing original-version keys. No customer records belong in Git, public files, or build logs. The original XLSX, Google Sheet, and ignored local normalized records remain available for recovery.

An initial database prototype was not activated: CLI deployments did not apply migrations and database status returned an internal error. Its local private SQL preparation is unused and gitignored. The provisioned empty database is not connected to this app; no access rights were broadened to work around it. Never seed QA records into the production document store. Do not remove platform login protection.
