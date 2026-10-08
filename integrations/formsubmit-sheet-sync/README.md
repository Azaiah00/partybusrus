# Private website inquiry capture

This integration copies the existing FormSubmit archive into a private Google Sheets tracker. It does not change the website form, email delivery, CAPTCHA, autoresponse, attribution consent, or the historical email ledger. It does not read the mailbox, capture direct emails or calls, or establish a booking.

## Current release state

The source and synthetic tests are prepared locally. Installation, an authenticated provider fetch, native Google Sheets verification and the time trigger still require completion. Local tests do not establish that the integration is live.

## Files and ownership

- `Core.gs` validates and normalizes old raw field names and the current readable email fields. It keeps original form data and distinguishes absent fields from explicit blanks.
- `Code.gs` provides the spreadsheet menu, private configuration, synchronization and schedule controls.
- `appsscript.json` declares only access to the bound spreadsheet, external requests and script triggers. There is no Gmail permission and no public web app.
- The staging Live Inquiry Tracker contains the prior Summary, Inquiries and Submissions tabs, plus Captured forms and Sync status. Use a private Google Sheets copy; retain the original Excel tracker as the historical backup.

No API key, spreadsheet identifier or customer data belongs in this directory or Git. Customer information is held in the private workbook. An account-specific API key is stored in Apps Script User Properties. Spreadsheet/script editors must be trusted: they can alter code that the owner’s trigger later executes. Do not enable link sharing or public access.

## Install after selecting the owning Google account

1. Import the prepared Live Inquiry Tracker `.xlsx` as a native Google Sheet in the chosen account. Confirm sharing is restricted and set its spreadsheet timezone to America/New_York. Verify all five tabs, historical email and inquiry counts against the private source workbook, existing test exclusions, and the formulas after conversion.
2. Open **Extensions → Apps Script** from that Sheet. Copy `Core.gs` and `Code.gs` into separate script files. Enable display of the manifest in Project Settings and apply `appsscript.json`. Save the project. Do not deploy a web app.
3. Obtain the FormSubmit archive API key using its official API-key request procedure for the existing quote recipient. FormSubmit delivers it to that mailbox. Do not paste the key into a chat, workbook cell, public URL, repository, or script source.
4. Reload the Sheet and choose **Inquiry capture → Configure private API key**. Supply the key in the private configuration dialog. The first configuration fixes the capture-start timestamp. Later reconfiguration must retain it.
5. Choose **Sync now** while signed into the owner account and authorize the limited scopes. Verify a successful result and timestamp in Sync status. Review records in Captured forms, source fields, and links to the historical inquiries. Unknown historical matches remain in review rather than increasing customer totals.
6. Run the sync again only within the provider budget to verify that the same archive records do not produce additional rows. A repeat before activation can consume one of the four allowed local attempts for the rolling day.
7. Choose **Enable automatic capture**. Verify exactly one `syncQuoteArchive` time trigger owned by the configured account, running every six hours. It runs in Google’s environment even when the owner’s computer is off. This setup is complete only after the real trigger appears and an authenticated fetch has been verified.

The first authorization may require the owner’s interaction. Never bypass a Google access-control or organization-policy denial. If authorization cannot complete, retain the staging files and report the missing step.

## Record and counting rules

- Submissions remains the historical mailbox ledger. Capture records are provider archive observations, not delivered-email confirmations. Historical email totals remain separate.
- Captured forms retains provider timestamps, first-observed timestamps, contact and trip details, original source metadata, and raw form JSON as literal text.
- A deterministic, versioned SHA-256 key covers the exact form URL, explicit provider UTC timestamp and canonical full form data. The provider’s documented response has no record ID; completely identical payloads with an identical provider timestamp are indistinguishable and are counted as one archive record.
- A valid exact request reference may link to one existing inquiry. Multiple uses, ambiguous references and unmatched pre-cutover records require review. Names, email addresses and phone numbers alone never merge requests.
- New provider records after the capture-start timestamp create an inquiry. Its First recorded date is the first time this tracker observed it, not a fabricated email receipt date. Historical values in that column remain their observed received dates.
- Imported business status, quote amount and booking value start blank. The sync never overwrites existing business outcomes, follow-up dates, amounts, test exclusions or customer-reported source. A form receipt is not a booking.
- To reconcile a review record, copy the exact existing Inquiry ID into that capture’s Inquiry ID cell and run Sync now when allowed. Conflicting references remain visibly flagged. Do not replace an inquiry ID to guess a match. New or unmatched historical inquiries can be added manually after review.
- The workbook reserves rows 8–1007. A full capture or inquiry area stops visibly; it does not silently discard records or append below the summaries’ calculation ranges. Expand the workbook and code boundaries together before exceeding capacity.

## Reliability and privacy

The provider documents a maximum of five archive requests per day and a 30-day archive. This integration reserves at most four attempts in any rolling 24-hour period, including failed requests and manual syncs. Use one installation for the API key; independent clients also consume the provider’s allowance. Trigger timing can vary, and a quota deferral delays the next attempt.

A script-wide lock prevents overlapping writes. Capture and inquiry IDs make retries safe after a partial run. New inquiry rows include the existing check/email-count formulas unchanged in the same write as their input values. The capture link is completed afterward and can be repaired on retry. No network retries bypass the request budget.

Provider responses must match the documented shape and explicit UTC timezone. Unknown form origins/paths, conflicting field aliases, malformed campaign summaries, oversized fields or malformed records stop the batch visibly. A correction is required; the code does not guess, truncate silently, or claim a successful import. Redirects are not followed with the API key. Failure messages are sanitized and exclude provider bodies, request URLs, customer values and credentials.

Sync status shows the last attempt, last successful import, schedule, capture count and review backlog. A gap exceeding the 30-day retention window leaves a persistent warning; inspect mailbox evidence because a later successful fetch cannot recover expired submissions. Google Apps Script provides failure notifications for failed installable triggers; this integration does not send customer messages.

All customer-controlled cells are written as literal text to prevent spreadsheet formulas. Raw JSON retains the source evidence. Unknown, blank and internal-site referrers do not establish Google organic acquisition.

## Disable and recover

Use **Disable automatic capture** to remove only this integration’s trigger. Existing records stay intact. Fix the recorded failure, use Sync now within the request budget, verify the result, and re-enable. Removing a trigger does not revoke the provider API key. Key rotation/revocation follows the provider’s account process.

## Local verification

Run `node scripts/test-formsubmit-sync-core.mjs` and `node scripts/test-formsubmit-sync-adapter.mjs`. These use synthetic data and mocked Google services; no email, form submission or live provider request is sent. Native Sheets conversion, account permissions, the actual API key and live trigger execution require separate verification during installation.

## Official references

- [FormSubmit API and API-key procedure](https://formsubmit.co/api-documentation)
- [FormSubmit archive limits and form features](https://formsubmit.co/documentation)
- [Google Apps Script properties](https://developers.google.com/apps-script/guides/properties)
- [Google installable triggers and failure notices](https://developers.google.com/apps-script/guides/triggers/installable)
- [Google script locks](https://developers.google.com/apps-script/reference/lock/lock-service)
