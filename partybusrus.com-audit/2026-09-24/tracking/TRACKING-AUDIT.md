# Party Bus R Us: tracking and lead conversion audit

Audit date: 2026-09-24. Scope: all 95 local HTML files, local shared JavaScript and hosting configuration; public live HTML for home, quote, contact, thank-you and privacy; public live shared afterglow.js. No production changes, actual submissions, calls, messages, or account data access. Evidence snapshots are in this directory. This is source verification, not a browser network recording or account-side receipt test.

## Main finding

The inspected live site does **not have active GA4, Google Tag Manager, Meta Pixel or CallRail collection installed**. The home page has no analytics loader or event queue. The four inspected inner pages explicitly park analytics for performance and define queue-only `gtag`/`fbq` functions without a loader, measurement ID or pixel ID. Events in those arrays do not reach analytics accounts. Public shared afterglow.js matches the local file and contains no analytics calls, fetch or beacon code. Local inventory finds 91 of 95 HTML files with parked tracking and no GA4 IDs anywhere; the other four are home and three redirect pages.

Calls and possible quote emails are encouraging business signals. They do not establish organic search traffic, rankings, conversion rate, or SEO return. These could originate from organic search, Maps, social, direct/referral visits or repeat customers. Those channels cannot be separated from the installed tracking.

Private GA4, Search Console, Google Business Profile, hosting analytics, provider delivery logs, mailbox records and CRM were not available in this subaudit. Historical server/account data may exist independently. Do not describe historical traffic as zero or assume earlier visits can be reconstructed from this site code.

## Coverage matrix

| Measurement | Current evidence | Status / implication |
|---|---|---|
| Visits, page views, sessions, landing pages | No live GA4 loader or property ID in five sampled pages; 95 local files have no GA4 ID | Not collected by inspected frontend |
| Organic queries, impressions, positions | Requires Search Console property | Unknown; private account report required |
| Google Business Profile website/call activity | No account data available | Unknown; distinct from website analytics |
| Call button clicks | `click_to_call` handler on older inner pages queues data; homepage lacks handler | Not sent; even functional click tracking would not prove a connected call |
| Connected calls, answered/missed calls, booking outcome | CallRail script absent, no provider integration | Not attributable from website code |
| Email button clicks | Inner-page `email_click` queues data | Not sent; opening mail app is not an email received |
| SMS / WhatsApp clicks | Links exist; no dedicated channel event handlers | Missing; some button-class links could enter generic CTA queue only |
| Quote steps | `quote_step_view` queues step navigation | Not sent; first untouched step has no explicit initial view event |
| Successful quote leads | `generate_lead` on submit attempt, `quote_submit` and duplicate Meta Lead handler, unguarded thank-you event | Not sent now; unsafe counting semantics if activated unchanged |
| Form delivery | Native POST to FormSubmit.co recipient `info@partybusrus.com` | Configured, actual activation and mailbox delivery unverified |
| Source attribution in quote emails | Current quote URL UTMs + immediate referrer only | Partial, often loses original acquisition source |
| Booking revenue and profitability | No CRM, booking, payment or offline conversion integration in inspected code | Missing / account-side process unknown |
| Error / abandonment monitoring | No form error, provider failure, delivery failure or qualified-lead event | Missing |

## Priority findings and evidence

### P1: Enable measurement before investing substantially in acquisition

Live quote lines 38–50, contact 35–47, privacy 34–46 and thank-you initial head contain comments replacing the real loaders and queue-only stubs. The remaining GTM noscript iframe uses `GTM-XXXXXXX`; this is not a valid configured container. Home contains no analytics tracking implementation. Local external scripts consist of GSAP, ScrollTrigger and afterglow.js only. Five public pages returned HTTP 200 from Vercel.

Install a single owned GA4 implementation consistently on every real page, including the newer homepage. GTM is useful for managing it, but avoid simultaneously installing the same GA4 stream both directly and through GTM. Search Console and Business Profile should be reviewed alongside GA4. Confirm actual received events in DebugView and Realtime; the presence of a `gtag` function or dataLayer entries is insufficient.

### P1: Verify quote delivery and stop treating submit attempts as successful leads

Live quote line 1118 posts directly to FormSubmit.co. Hidden fields set a subject, custom thank-you redirect, CAPTCHA, autoresponse, table email format and honeypot. There is no local API/CRM backend or webhook configuration in the site. Local `PRODUCTION-READY-HANDOFF.md` describes an older Netlify Forms setup; it is not the present production form.

The generic handler at quote lines 1521–1535 calls `generate_lead` and Meta `Lead` before provider acceptance. The stepped form handler at 1765–1777 calls `quote_submit` and a second Meta `Lead`. Therefore a future pixel activation would produce two Meta Lead calls for one valid submit attempt. The thank-you page lines 47–65 fires `lead_confirmed` and `CompleteRegistration` on every page load, including direct visits and reloads. An arbitrary visit to that URL cannot prove a lead was received. Direct gtag calls plus matching dataLayer event objects also risk duplicate events if a future GTM container forwards both.

First confirm FormSubmit activation and an existing recent successful email, then carry out one explicitly identified end-to-end test when authorized. Capture success, error and spam paths. Prefer a provider success response or backend confirmation with an opaque lead ID; count one accepted lead once. A client session flag reduces accidental thank-you inflation but is weaker evidence than provider acceptance. Keep attempt events distinct from accepted leads and confirmed bookings. Remove the duplicate event paths before attaching real IDs.

FormSubmit documentation confirms custom redirects, autoresponse requirements, webhook support and a submissions archive retained for 30 days. If the user wants past email enquiries checked, their FormSubmit archive/account or mailbox can supply evidence; this audit did not access either. [FormSubmit documentation](https://formsubmit.co/documentation).

### P1: Persist acquisition source across navigation

Live quote lines 1579–1589 read `utm_source`, `utm_medium`, `utm_campaign` only from the quote page's current query string. `source_page` and `source_referrer` both use the immediate `document.referrer`; this commonly records the preceding internal fleet/service page instead of the original acquisition source. No sitewide first-touch/session attribution store was found. UTMs on the home landing URL will normally disappear when the visitor follows a plain quote link.

Capture consent-appropriate initial landing URL/path, external referring hostname, UTMs, initial timestamp and session source once, then preserve them into the quote submission/CRM. Separate acquisition source from last internal page visited. Allowlist campaign parameters and sanitize URLs so form PII cannot enter analytics. Include `utm_content` and `utm_term` where used; preserve advertising click IDs only if those advertising integrations are actually adopted. Validate home-with-UTM → fleet → quote and search landing → quote paths, including cross-host redirects.

### P2: Treat calls, texts and email as a complete lead system

Track call/SMS/WhatsApp/email initiation separately, including CTA location and page type. These measure intent only. Use a call provider or a consistent manual lead log to record answered, missed, qualified, quoted and booked outcomes. If dynamic number insertion is adopted, keep the established business number consistent in business listings/schema and verify call forwarding and visible/tap targets. Call recording is not necessary merely to measure calls. Decide reporting needs before choosing a paid provider.

### P2: Preserve quote drafts until success and make data handling transparent

Live quote lines 1717–1776 save name, phone, email, pickup/destination and free-text notes to `localStorage` on input. The seven-day expiry is checked on the next quote-page visit, not enforced by automatic deletion while the site is closed. The draft is deleted at the submit attempt, before CAPTCHA/provider/email success. A failed handoff can therefore remove the recovery copy. Prefer session-scoped/minimized drafts or a clear save option, disclose saved draft behavior, and clear after accepted submission or user request.

The live privacy page says analytics may be added in future and promises an updated policy and consent banner before tracking goes live (line 984). Honor that published commitment when activating collection. Describe actual processors and retention, including FormSubmit and optional browser-geolocation reverse lookup (quote lines 1680 onward send granted coordinates to Nominatim). Do not send names, personal email, phone, detailed addresses or free-text notes to GA4/Meta. These are implementation/data-handling recommendations, not a legal compliance determination. [Google's PII guidance](https://support.google.com/analytics/answer/6366371).

### P2: Replace stale setup instructions

`ANALYTICS-SETUP.md` says four scripts with placeholder IDs are installed and advises a simple replace. Current production removed the loaders entirely, and the homepage does not have even the old event instrumentation. It also recommends marking both lead stages as conversions, which would overstate leads if interpreted as a single total. Update the operational guide with actual IDs/property ownership, single-install architecture, current FormSubmit delivery process, event definitions, QA evidence, and a recovery contact. No secrets belong in the static frontend or this audit.

## Proposed event specification

Use one event-emitting path and shared instrumentation across page templates. Register only useful low-cardinality reporting dimensions. Suppress internal/test traffic and respect chosen consent rules. Do not include customer PII in event parameters.

| Event | Trigger | Safe parameters | Reporting role |
|---|---|---|---|
| `page_view` | Real page view, once per navigation | page path, page type, language | Acquisition denominator |
| `cta_click` | Booking CTA activated | cta_id, placement, page_type, destination_path | Funnel diagnostic |
| `contact_click` | Call/SMS/email/WhatsApp link activated | contact_method, placement, page_type | Intent; secondary event |
| `quote_start` | First meaningful quote interaction | form_id, landing_page_type | Funnel start, once per attempt |
| `quote_step_view` | Initial step and each next/back step view | form_id, step, direction | Funnel diagnostic |
| `quote_validation_error` | Validation prevents progress/submission | form_id, step, field_name, error_code | Error diagnostic; no field contents |
| `quote_submit_attempt` | Valid request handed to provider | form_id, attempt_id, event_type, passenger_band | Attempt; not accepted lead |
| `generate_lead` | Provider/backend accepts a unique enquiry | form_id, opaque lead_id, lead_method | Primary enquiry key event, once |
| `quote_submit_error` | Provider fails/rejects or times out | form_id, error_code | Reliability monitor |
| `qualify_lead` | Staff records qualified enquiry | opaque lead_id, lead_method | CRM/offline quality stage |
| `close_convert_lead` | Booking/deposit accepted in CRM | opaque lead_id, currency, actual value | Booking outcome; deduplicate |

Google documents recommended lead-generation events including `generate_lead`; follow current platform event definitions rather than treating every click as a lead. Custom funnel events above are proposed specifically for this form. Only attach monetary `value` where there is an explicit, defensible definition. [Google recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).

## Acceptance checks before relying on reporting

1. Verify owned GA4/Search Console/Business Profile accounts and existing history; do not create duplicates prematurely.
2. Inspect production network requests and platform receipt after consent; prove exactly one page view on home and representative city/service/fleet/quote pages.
3. Click-only event tests for call, text, WhatsApp and email must not place calls/send messages; prove source and placement parameters.
4. Navigate from a campaign-tagged landing page through multiple internal pages and confirm original attribution reaches the accepted lead record.
5. In an authorized test fixture/provider sandbox, invalid forms, provider failures, direct thank-you visits and reloads must yield zero additional accepted leads.
6. One labeled authorized end-to-end production test must produce one provider record, one delivered notification, one primary accepted-lead event, and a useful confirmation screen; verify the business actually receives and can reply.
7. Review weekly organic enquiries, qualified calls, quotes sent, bookings and booking value by source/landing-page group; separately watch missed-call rate and response time. Compare against a dated baseline before major design changes.

## Evidence index and limitations

Parent audit browser checks add: at 390px width, empty first-step validation focused the date field; supplying sample date/time/headcount/hours advanced to step 2; selecting Birthday and Arlington advanced to step 3. No contact details were entered, no form was submitted, and no inbox delivery was tested. The final step fit at 320px (reported content scrollWidth 305px). A fleet page's “Reserve This Bus” link led to a generic quote URL without a vehicle parameter: retain vehicle context in the quote and lead record to reduce customer effort and improve demand reporting.

- `local-tracking-inventory.json`: all 95 local HTML files, external script sources, form endpoints and queue stubs.
- `live-index.html`, `live-quote.html`, `live-contact.html`, `live-thank-you.html`, `live-privacy.html`: public production HTML snapshots. Line references above refer to these files.
- `live-afterglow.js`: production shared script; byte-content comparison to local JavaScript was equal.
- HTML snapshots normalize response decoding/newlines; raw file SHA equality to local HTML was false, but line comparison of homepage produced no differences. Do not infer a deploy mismatch from raw hash alone.
- Git status limited to tracked `site/` changes was clean when checked. Workspace contains unrelated untracked work owned by the user/other agents. This audit changes only this evidence/report directory.
- No claim is made about mailbox delivery, Search Console traffic, account-side tags, or bookings without access to those records. The parent audit can append browser-network and private-account evidence separately.
