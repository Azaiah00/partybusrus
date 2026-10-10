# Release QA — October 9, 2026 (Eastern)

Production: https://partybusrus-inquiry-desk.netlify.app/

Final deploy: `6ac98833cc2fe40d51476959`. Dedicated site: `1cee1f6f-515a-4374-a1e7-d6c803f0cef6`. Public marketing website unchanged.

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
