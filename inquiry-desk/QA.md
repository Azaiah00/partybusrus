# Release QA — October 9, 2026 (Eastern)

## Follow-up audit and fixes

Published production deploy: `6ac990cae9e15df13ffff84f` at https://partybusrus-inquiry-desk.netlify.app/ . Post-release read confirms the production store: 11 customers, 18 historical emails, one excluded test (no preview fixture). Production Add inquiry, Keep editing and Discard changes passed without saving a test record; fresh console log contains no errors/warnings. Post-release anonymous access checks remain HTTP 401. Desktop proof: `.verify/inquiry-desk-qa-fix-desktop.jpg`.

- Replaced the native discard confirmation with an in-app Keep editing / Discard changes decision. Hosted preview confirmed both paths complete without trapping the browser.
- Locked form controls while a save is in progress, so last-second typing cannot be silently dropped. Hosted preview visibly showed disabled controls during the request. Failed/conflicting saves unlock fields and retain notes.
- Review inquiries now clears an unrelated search before showing the selected follow-up/outcome queue.
- 18 hub tests now pass, including three new editing regressions. Public-site checks also pass: 23 quote tests, 21 Analytics tests and 3 service-worker tests (65 behavior tests total).
- Local technical and markup audits each pass all 95 pages, 92 indexable, zero failures/warnings. Live public-site read-only audit passes 92 sitemap pages with HTTP 200 and exact canonicals, no page-level noindex, five deployed key assets matching tested source, and a real 404 for an unknown page.
- Fresh production session successfully exercised navigation, source view, Add inquiry and clean close. Fresh hosted preview `6ac98fa62760ebe766a68872` exercised saving the existing excluded synthetic record, actual reload/readback, keep-editing and discard. No fresh console errors/warnings appeared in these sessions; the earlier unattributed console error was not reproduced.
- Narrow 320-pixel local form: open, save, reopen, retained notes, visible save footer and zero horizontal overflow (page/dialog 320px; body scroll width 303px). Synthetic test remained excluded from customer totals.
- Security recheck: all-deploy platform login remains enabled; anonymous root/API/direct function/JS/manifest all HTTP 401. Public file scan again finds none of the 33 sampled private field values.
- The in-app Google session does not contain the authorized fredsales519@gmail.com identity. No Google ownership or access changes were made. The correct previously verified property is the URL-prefix https://www.partybusrus.com/, not a newly created Domain property. Fresh Search Console report/validation results remain unverified.
- Replaced the stale pre-launch task list with current status, prioritized capture/catch-up/outcome/phone/reporting work and explicit superseded integrations. See `partybusrus.com-audit/NEAR-TERM-TASK-LIST.md`.

Evidence for this pass: `.verify/live-website-qa-oct09.json`, `.verify/technical-qa-oct09.json`, `.verify/markup-qa-oct09.json`, current gate/release reports and `tests/editing.test.mjs`. Customer records were not changed and no real message/form/call was sent.

The earlier browser interaction gap below is resolved by these fresh checks. Physical-device installation, full cross-browser/accessibility certification, Google report access and automatic capture remain explicit follow-ups. These checks are not a guarantee of universal error-free operation.

## Original release evidence

Production: https://partybusrus-inquiry-desk.netlify.app/

Original release deploy: `6ac98833cc2fe40d51476959` (superseded by the follow-up deploy above). Dedicated site: `1cee1f6f-515a-4374-a1e7-d6c803f0cef6`. Public marketing website unchanged.

## Verified

- 15 automated tests pass: validation, Eastern dates, unknown outcomes, test exclusion, source host boundaries, same-origin writes, fail-closed access, idempotent creation, immutable history and concurrent/stale edit conflicts.
- Hosted preview: added an excluded QA document, saved it, opened it in another tab, updated from the second tab, and confirmed the first tab's stale write returned a visible conflict instead of overwriting. No customer was contacted and no quote form was submitted.
- Production import: all 13 objects (12 groups plus metadata) read back and matched local source exactly. 18 historical emails; 11 customer groups; one excluded owner test; two inferred groups needing review; one recorded ChatGPT source and 10 unknowns; no confirmed bookings. Historical coverage ends October 6.
- Final production browser read confirms one excluded test and no preview-only QA document. Both deployed functions and permanent address remain behind Netlify team login for all deployments. Anonymous root, API, direct function, JS and manifest requests return HTTP 401.
- Desktop and 390-pixel phone layouts rendered and inspected. Narrow 320-pixel page had no horizontal overflow. Search, filters, adding and updating were tested locally and on the hosted preview. Phone/call/email links were inspected without activating them.
- Public asset scan checked 33 private customer field values: none present. No customer records or credentials are committed. The service worker does not cache private responses.
- Cloud data survives a page reload. Production and preview document stores are separate; final server bundles compile the intended store rather than relying on ambiguous environment precedence.

## Limits and follow-up

- Automatic capture is not connected. Phone/direct email entries remain manual. Google Sheet is a historical backup; portal edits do not sync back into it.
- Installation on a physical iPhone/Android device has not been tested. Manifest, icons, standalone display settings and installation guidance are included; authenticated use requires internet access.
- Production writes were intentionally not used to alter real customer records. Equivalent hosted preview CRUD and conflict paths passed; production reads and data parity passed.
- Browser automation stalled on the native discard confirmation left by the intentional stale-edit test. Further production input QA was inconclusive; the read-only production render and counts remained verifiable. A fresh production tab is the deliverable. The preview's unsaved test edit was not stored.
- One browser log reported a MutationObserver error without source URL during initial production navigation. The application contains no MutationObserver calls; attribution remains unconfirmed. Later production reads rendered correctly. Do not describe the entire browser session as error-free.
- The unused empty Netlify Database prototype is not used by the app. No production database write permissions were expanded. Its initial migration preparation remains only in ignored private local evidence.

Private evidence: `.verify/inquiry-desk-release-qa.json`, `.verify/inquiry-desk-gate-qa.json`, `.verify/inquiry-desk-import-inquiry-production-v1.json`, and `.verify/inquiry-desk-mobile.jpg`. Keep these local.
