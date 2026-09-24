# Quote integration — implementation evidence

2026-09-24. Changes are local; no deployment, production form submission, call or message was made.

## Updated files

- `site/quote.html`: native FormSubmit POST retained with CAPTCHA, honeypot and autoresponse; new required script IDs, seven fleet preferences, semantic contact fieldset, editable pickup, sanitized attribution hidden fields, request reference, live status and reset action. Removed old inline form/event handlers and geolocation. Removed response guarantees and made sidebar phone/text/email links actionable. No-JavaScript form displays all steps once the parent's shared refined stylesheet is installed.
- `site/thank-you.html`: neutral default message with `returnHeading` and `returnMessage`; removed unconditional success/conversion handlers and response-time guarantees. External guarded return script included once.
- `site/assets/quote.js`: used parent's new implementation and strengthened phone validation, whitespace trimming, malformed/future draft rejection and form reset recovery. Adds exact allowlisted `?area=` handoff for all 41 non-index city filenames; does not overwrite an existing pickup value or store/send pickup through analytics. `?bus=` accepts the seven available vehicle option values and `?event=` accepts known service slugs.
- `site/assets/quote-return.js`: added strict finite timestamp and bounded opaque reference validation. Only a matching pending session, recent timestamp and FormSubmit referrer can produce a one-use diagnostic return event. The event is not a primary accepted-lead or inbox-receipt claim.
- `scripts/test-quote.mjs`: 14 meaningful Node VM tests using fields/options parsed from the actual quote HTML. No network is available in the harness.

## Checks passed

`node --test scripts/test-quote.mjs`: 14 passed, 0 failed. JS syntax checks for quote and return scripts passed.

Coverage: native POST/CAPTCHA configuration, external script uniqueness, first-step validation/focus, forward navigation, whitespace/past date/phone/email rejection, seven vehicle handoffs, every supported city handoff, no pickup overwrite, no contact details or notes in drafts, source hidden fields, malformed/future/stale drafts, native submit attempt versus accepted lead, duplicate protection, offline and honeypot paths, draft/pending reset, blocked storage, guarded one-use return, and direct/foreign/stale/future/mismatched/malformed returns remaining neutral.

## Remaining verification

Parent owns shared CSS/analytics script insertion and production-wide cleanup. Analytics config and shared analytics must appear earlier in DOM order than the deferred quote scripts. Browser QA should confirm the three-step layout and all-step fallback, field focus and error/status visibility at mobile widths, selected vehicle/area handoffs and accessible controls. No form-provider activation, actual email delivery or GA4 account receipt has been verified. A real provider-return referrer may be omitted by browser/provider policy; the page safely remains neutral in that case.

`integrate-quote.mjs` records the one-time HTML transformation used in this work; it is an audit artifact, not a build/deploy command. Do not rerun it against subsequently edited pages.
