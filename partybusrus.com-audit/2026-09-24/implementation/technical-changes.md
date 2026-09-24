# Technical implementation — 24 September 2026

Production has not been deployed. The work below is local and the normalization write pass is deliberately deferred until the parent finishes concurrent page edits.

## Owned edits completed

- Converted both service/location hub directory lists from JavaScript-only list items to real anchors. This addresses the cause of the 15 sitemap-only pages found by the crawl, enables normal keyboard navigation and provides 44px-tall anchor targets with focus styling.
- Corrected hub navigation labeled “All Locations” to the cities hub.
- Kept `cleanUrls: true` and `trailingSlash: false`. Historical redirect sources remain; `.html` destinations now go straight to their final extensionless targets. Added permanent legacy `/services.html` and `/cities.html` aliases.
- Robots now allows crawlers to read utility-page noindex directives. Sitemap reference uses the production www hostname. Existing crawler access preferences remain unchanged.
- Replaced the long llms.txt marketing/credential/policy assertions with canonical planning links, current public contact details, and a clear instruction to confirm the specific quote, availability and booking terms. No AI ranking benefit is claimed.
- Left security headers intact. No speculative CSP was introduced.

## Deterministic normalization handoff

`scripts/seo-maintenance.mjs` defaults to dry-run. Parent should run `node scripts/seo-maintenance.mjs --write` after all page editors finish. It:

1. Aligns canonical, OG URL, same-site link/resource attributes, hreflang and JSON-LD URLs/IDs with `https://www.partybusrus.com` and extensionless routes.
2. Preserves query strings, fragments, asset extensions, external domains, tel/sms/mailto protocols and inline JavaScript bodies. Retains historical route aliases via Vercel redirect mapping.
3. Replaces unsupported LimousineService with LocalBusiness, removes unverified review and aggregate-rating schema, and changes fleet Product entities to Service with the common operator provider ID. It does not add prices, ratings, credentials or availability claims.
4. Rebuilds sitemap from indexable, non-redirect HTML routes. Keeps previously recorded lastmod values, excludes utility noindex pages and historical route aliases, and does not fabricate modification dates.

Changes are deterministic and the HTML transformation is idempotent. The script reads the latest page bytes when run; it must not run concurrently with other page writers.

## Fresh QA handoff

After normalization and shared asset integration, run `node scripts/audit-site.mjs --output partybusrus.com-audit/2026-09-24/implementation/local-technical-qa.json`.

The audit checks metadata, canonical/OG conventions, title and description duplicates, H1/viewport, internal links and anchors, local asset and srcset existence, CSS assets, sitemap inclusion/exclusion, link-graph reachability, JSON-LD parseability and removed types/ratings, fleet Service representation, hreflang reciprocity, redirect destination existence and utility robots rules. It emits JSON failures, warnings and inventory, and exits nonzero on failures. Image dimensions, JS-only navigation and selected unsubstantiated claim phrases are warnings for review. This static checker does not prove provider delivery, browser visual behavior, actual indexing, legal accuracy or field performance.

## Verification completed before integration

- Both scripts passed Node syntax checks.
- Targeted normalization assertions cover canonical/path mapping, old fleet and city aliases, query/hash preservation, asset versions, external domains, phone/SMS/email protocols, JSON-LD review removal, fleet Service conversion, inline-script preservation and HTML idempotence.
- Hub source confirms no remaining JavaScript list navigation; every directory entry now has an anchor.

Parent owns service-worker cache-version bump and new shared CSS/JS asset versioning. Existing image query versions are preserved. Final full-site QA and browser review remain the integration step; no fresh live audit can validate undeployed changes.
