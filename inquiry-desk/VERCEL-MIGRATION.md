# Vercel migration — requested October 10, 2026

The owner corrected the deployment destination: use Vercel, the public website's host. The public `partybusrus` project belongs to `freds-projects-a353dcff` (`team_sh6lA4cP54zCb3MBumvfZdui`), with root directory `site`. Keep that marketing project public. The private desk requires a dedicated protected Vercel project in the same team; applying project-wide authentication to the existing marketing site would lock out its visitors.

## Prepared and locally tested

- Shared request handler extracted without changing existing Netlify behavior.
- Vercel `/api/desk` entrypoint, private Blob adapter, full pagination, uncached reads, immutable object creation and separate production/preview namespaces.
- Vercel build/configuration, equivalent no-store/noindex/security headers, generated shared parser support, and deployment ignore rules.
- Calendar links now use the actual deployed origin; installation copy no longer points users to Netlify.
- Official `@vercel/blob` 2.8.1 installed; npm reported zero vulnerabilities. All 37 portal tests pass, including the new Vercel entrypoint's disabled-by-default access check and storage isolation.

## Current blocker

Existing Vercel CLI credential is invalid. A normal login refresh was started. Both Chrome and the in-app browser showed a disabled Allow Access control on the official device-authorization page. The signed-in washingtonwizkidspodcast account does have visible access to Fred's projects / partybusrus; this was verified from its actual project overview. Do not infer a wrong account from its username. No CLI authorization was completed, no Vercel project/store was created, and no customer records were uploaded there.

The previous protected Netlify release remains live until the Vercel destination has passed equivalent checks. No new Netlify release is needed for this migration preparation.

## Cutover sequence

1. Complete the existing Vercel account's deployment-login refresh. Do not print/read credential files or replace another task's authenticated session.
2. Create/link a dedicated `partybusrus-inquiry-desk` project in the same Vercel team. Configure **All Deployments** Vercel Authentication before adding private storage/data. Verify the permanent and deployment URLs block anonymous access. Set `DESK_ACCESS_VERIFIED=vercel-auth-all-deploys` only after that independent check; this is an operational guard, not auth.
3. Create a private Blob store connected to this dedicated project. Keep it out of the public marketing project. Vercel CLI can use its normal linked-project storage authentication; do not print tokens. API code chooses `inquiry-production-v1/` only for production and `inquiry-preview-v1/` otherwise.
4. Prepare the canonical parser with `node scripts/build-vercel.mjs` before CLI upload. `.vercelignore` intentionally includes the generated server parser while excluding local credentials, Netlify metadata and dependencies. Do not upload `.verify` or customer files as application assets. Git-root builds regenerate the parser from `../integrations/formsubmit-sheet-sync/Core.gs`; isolated uploads require the already-generated file.
5. The private export helper `.verify/export-desk-for-vercel.mjs` copies every original object/version into ignored local files with SHA-256 manifest. Verify export completion and reconcile any source edits since its timestamp before cutover. Import with original keys under the production namespace, refuse differing existing objects, and read every destination object back for exact comparison. Do not seed production with synthetic records.
6. Exercise CRUD/conflicts/recovery against preview storage. Verify real production totals, source evidence, original versions, backup download, manifest, phone layout and anonymous access protection. Only then publish the new Vercel link and retire the old write path; preserve its backup history.
7. Configure a branded subdomain only after checking DNS ownership/routing. No specific new subdomain has been promised or configured.
8. FormSubmit capture remains unactivated pending the earlier specific owner approval. Do not copy the Netlify schedule blindly: verify Vercel plan cron limits and authenticated scheduling before adding a job. The Vercel code currently offers only the protected manual capture action, inactive without the key.

Current status: migration preparation complete; hosted build, Vercel storage import, access checks and cutover remain pending authentication. The existing public marketing website has not changed.
