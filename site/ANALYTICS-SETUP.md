# Analytics and enquiry operations

Updated 2026-09-24. This replaces the former placeholder/GTM/Meta/CallRail and Netlify Forms instructions.

## Activation status

The shared implementation is ready for configuration and QA, but **analytics is not active**. `assets/analytics-config.js` intentionally has an empty `measurementId`. There is no GTM, Meta Pixel or CallRail installation. No real ID was supplied or verified, and no analytics delivery or mailbox receipt is claimed.

Before changing this configuration, locate the business-owned existing GA4 property/web data stream, Search Console domain property and Google Business Profile. Check account ownership and historical data before creating duplicates. Public Measurement IDs are safe to include here; API secrets, credentials and customer data are not.

Only an uppercase GA4 web Measurement ID with the shape `G-` followed by ten letters/digits passes validation. Common placeholder, test and demo strings are rejected. The collector only loads on the exact `partybusrus.com` and `www.partybusrus.com` hosts. Localhost and preview deployments cannot send data even if an ID is set. The test suite uses a fake DOM without networking; its fixture ID is never production configuration.

## One shared installation

Every real page must include these scripts in this order, before the quote script:

```html
<script defer src="/assets/analytics-config.js"></script>
<script defer src="/assets/analytics.js"></script>
```

Use this direct GA4 installation once. Do not add a second Google tag through GTM, retain old inline `gtag`/`fbq` stubs or reinstall old generic submit handlers. The shared code prevents duplicate includes and queues a single explicit `page_view` for each document. It sets `send_page_view: false` on the configuration to avoid a second default page view.

In the owned GA4 web stream, review **Enhanced Measurement before activation**. Disable automatic form interactions, outbound clicks, site search, history pageviews and other overlapping automatic measurements; use this explicit event schema so link URLs, search terms and form content are not inadvertently collected. Disable Google Signals/advertising personalization unless separately authorized and implemented. The script already disables those settings for this stream.

## Consent and storage

With a valid production configuration, no Google loader, GA cookie or event queue is created before an affirmative choice. A compact nonmodal notice offers equally accessible allow/off buttons. An “Analytics privacy choices” control in the footer lets a visitor change the choice. No consent banner is shown while analytics is unconfigured or on preview hosts.

An explicit granted/denied preference is stored under `pbru_analytics_consent_v1` in localStorage with a timestamp and a 180-day lifetime. This preference is functional storage, not a tracking identifier. Missing, corrupt, future-dated or expired preference data does not authorize collection. Storage failures are caught and do not interrupt booking.

On denial/withdrawal the script sets Google's `ga-disable-MEASUREMENT_ID` flag, discards queued events, updates consent if the library was started, clears script-accessible `_ga`, `_ga_*`, `_gid`, `_gat*` cookies at the root host/domain scopes, clears saved form provenance and rejects future calls to its event API. Another open tab's withdrawal is respected through the storage event. Cookies on inaccessible domains/paths or HttpOnly cookies cannot be removed by browser JavaScript; none are created by this implementation. Withdrawal cannot recall requests already sent. Verify Google's actual runtime behavior in browser network tests before activation; unit tests cannot prove a third-party library's behavior.

Separate local quote context is stored in same-tab sessionStorage under `pbru_form_source_v1`: original landing path, external referrer hostname and sanitized `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. It contains no cookie/client ID, contact details, complete referrer URL, arbitrary query strings, advertising click IDs or device fingerprint. It is used only as context with the quote the visitor requests. With analytics unconfigured, this source context remains locally available to the form. With analytics configured, source retention waits for analytics consent. Denial/withdrawal clears it and prevents subsequent storage. Browser session restoration may restore sessionStorage; it is not a fixed retention guarantee.

Campaign labels permit only short alphanumeric/underscore/hyphen tokens and reject phone-like digit runs, email addresses, full URLs and free text. Use labels such as `google`, `organic`, `fall-weddings` and `hero-a`; do not place customer information in marketing URLs. Analytics page URLs omit every query string and fragment, and referrers contain the external hostname only. Update the privacy policy to describe these real data flows before activation, honoring the site's existing promise to update policy and offer a choice.

## Shared event API

```js
PBRUAnalytics.track('quote_step_view', {
  form_id: 'quote-form', step: 2, direction: 'forward'
});
const source = PBRUAnalytics.getAttribution();
// { source_page, source_referrer, utm_source, utm_medium,
//   utm_campaign, utm_content, utm_term }, or {} if unavailable/denied.
PBRUAnalytics.openConsentPreferences();
PBRUAnalytics.getDebugState();
```

The API returns false when a tracking call is unknown, unconfigured or not consented; discarded events are never replayed after a later grant. `getAttribution()` returns a copy. `getDebugState()` shows configuration/consent, counts of queued events and the last event name, without field contents. **Queued is not received:** `deliveryVerified` is always false because this script cannot verify the Google account. Console debug output is restricted to localhost and the config's explicit debug flag; localhost collection remains disabled.

| Event | Allowed caller parameters | Meaning |
|---|---|---|
| `page_view` | Internal only | Once per document after consent; sanitized page URL |
| `cta_click` | `cta_id`, `placement`, `destination_path` | Quote CTA intent; delegated automatically |
| `contact_click` | `contact_method`, `placement` | Call, SMS, email or WhatsApp link intent; delegated automatically |
| `quote_start` | `form_id` | First meaningful quote interaction |
| `quote_step_view` | `form_id`, integer `step` 1–3, `direction` | Initial/next/back step view |
| `quote_validation_error` | `form_id`, `step`, `field_name`, `error_code` | Validation prevented progression; no field contents |
| `quote_submit_attempt` | `form_id`, `event_type`, `passenger_band`, `vehicle_id` | Valid form handed to the provider, before acceptance |
| `quote_submit_error` | `form_id`, `error_code` | Detectable handoff error; no provider-delivery claim |
| `quote_provider_return` | `form_id` | Guarded return after a pending attempt; still not verified inbox delivery |

Each custom event adds a sanitized page path/type. Unknown parameters are dropped; personal names, email, telephone, pickup/destination, free-text notes and raw hrefs must never be passed. Field names and categorized errors are acceptable. `generate_lead`, `lead_confirmed`, `CompleteRegistration` and arbitrary events are intentionally unavailable in this frontend API. Do not mark all funnel events as primary enquiries. A call click is not a connected call, and an email click is not a received email.

## Current quote delivery

The form uses a normal POST to FormSubmit.co for `info@partybusrus.com`, with CAPTCHA, honeypot and autoresponse retained. It is not Netlify Forms. Do not replace native submission with AJAX merely to obtain a client success signal: FormSubmit documents different CAPTCHA/autoresponse behavior for AJAX. The custom thank-you route is a user confirmation surface, not an authenticated delivery receipt.

Confirm the recipient is activated and find a recent legitimate enquiry in the provider/archive or mailbox. Then run one clearly labeled authorized end-to-end test and verify provider acceptance, inbox arrival, ability to reply and customer confirmation. This work has not sent a test enquiry or inspected the mailbox. FormSubmit documents a 30-day submission archive and webhook support; access remains account-specific. See [FormSubmit documentation](https://formsubmit.co/documentation).

For a future primary `generate_lead` event, implement provider/backend receipt with an opaque unique enquiry ID and server-side deduplication. Keep personal data in the booking system. Import qualified/quoted/booked outcomes only through an explicitly configured secure integration, with consent and platform requirements verified. Do not put private Measurement Protocol secrets or CRM credentials in static JavaScript. There is no such server integration in the current scope.

## QA and activation checklist

1. Run `node --test scripts/test-analytics.mjs` from the project root. This covers no-ID mode, consent, production-host restriction, duplicate inclusion, first-source persistence, sanitization, malformed/blocked storage, withdrawal, contact events and direct thank-you visits. It does not contact external services.
2. Confirm all real-page templates include the two shared scripts once and old inline tracking is absent. Check form scripts load afterward. Confirm homepage and inner pages use the same implementation.
3. In a production browser session with a verified ID, confirm zero Google requests before choice/after denial; allow and verify exactly one loader/pageview. Inspect network payloads for no raw query, personal data or unexpected Enhanced Measurement events.
4. Verify GA4 DebugView/Realtime receipt and the intended property's ID. Test consent withdrawal and reload; no further events/cookies should be produced after withdrawal. Verify keyboard interaction and small-screen notice layout without obstructing the form.
5. Navigate from a campaign-tagged landing page through a fleet/service page to quote. Verify original sanitized source and selected vehicle reach hidden quote fields and the eventual provider record when consent/source rules allow.
6. Check invalid inputs, back/forward navigation, duplicate submission protection, stale pending sessions, direct thank-you and refreshed thank-you paths. None should become primary accepted-lead events.
7. Obtain one authorized delivery test and its recipient/provider receipt. Only then describe quote delivery as verified. No real calls/messages should be made for click-event checks.
8. Keep a dated baseline in a weekly dashboard: Search Console nonbrand/branded clicks and impressions, GA4 sessions/landing pages, valid enquiries, answered/missed/qualified calls, quotes, bookings and actual booking value. Identify staff-entered outcomes separately from frontend intent. Website analytics cannot prove all business sources on its own.

## Rollback and maintenance

Set `measurementId` back to empty and deploy to stop starting the collector on subsequent page loads. Existing open tabs require withdrawal or reload; empty configuration cannot revoke already-delivered data. Keep the shared API installed so form functions continue safely without collection. Review this guide whenever a provider, event contract, host, consent behavior or form workflow changes.

References: [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent), [GA4 recommended lead events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [Google PII guidance](https://support.google.com/analytics/answer/6366371). This guide describes the implementation, not a legal compliance certification.
