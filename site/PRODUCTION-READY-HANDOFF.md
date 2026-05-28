# Party Bus R Us — Production Handoff

**Status:** PRODUCTION READY (with one optional task — replace analytics placeholder IDs)
**Pages:** 68 HTML files (home, fleet, services, cities, blog, Spanish, utility, legal)
**Final QA pass:** complete; 0 broken links, 0 broken images, 0 schema errors, 0 structural issues.

---

## 1. What was done (5-phase summary)

**Phase 1 — Multi-page conversion**
Converted from a single-file SPA into 68 individual HTML files organized into directories: `fleet/`, `services/`, `cities/`, `blog/`, `es/` plus root-level utility pages. Each page is self-contained with full inline CSS and JS — no build step required.

**Phase 2 — SEO foundations**
Every page got: `<title>`, `<meta name="description">`, absolute canonical URL, Open Graph + Twitter Card tags, JSON-LD structured data (BreadcrumbList + page-specific type — Product/Vehicle on fleet, Service on services + cities, BlogPosting on blog, LocalBusiness on home), `_redirects` for clean-URL trailing slashes, `sitemap.xml` (66 URLs), `robots.txt`.

**Phase 3 — Analytics scaffolding**
Inserted Google Tag Manager, Google Analytics 4, Meta Pixel, and CallRail script blocks on every page using PLACEHOLDER IDs (`GTM-XXXXXXX`, `G-XXXXXXXXXX`, `XXXXXXXXXXXXXXX`). Custom events wired: `click_to_call`, `email_click`, `cta_click`, `scroll_depth`, `lead_confirmed` (on `/thank-you.html`).

**Phase 4 — Form wiring**
`/quote.html` form configured for Netlify Forms (`data-netlify="true"`, `netlify-honeypot="bot-field"`, hidden `form-name` input, honeypot field, `action="/thank-you.html"`). All inputs have `name` attributes; no leftover mockup `alert()` code. `/thank-you.html` fires the `lead_confirmed` conversion on load.

**Phase 5 — Final QA + fixes (this pass)**
Caught and fixed 4 categories of pre-deployment issues — see "Issues fixed in this pass" below.

---

## 2. Issues fixed in this pass

1. **Stray `</head>` mid-CSS in 9 blog posts** — The build script left an extra `</head>` tag at line 739 inside a `<style>` block in 9 of 11 blog posts. This would have broken page rendering in some browsers. Removed.
2. **Missing JSON-LD on 6 pages** — `404.html`, `contact.html`, `gallery.html`, `privacy.html`, `terms.html`, and `thank-you.html` had no structured data. Added appropriate schemas (WebPage, ContactPage, CollectionPage, LocalBusiness with full NAP, BreadcrumbList).
3. **Missing BreadcrumbList on `faq.html`** — Added.
4. **(Verified)** No broken image refs (366 references all resolve), no broken internal links, no SPA artifacts (`data-page=`), no hash routes, no Vienna 22180 HQ remnants, no insurance/$5M/WMATC/USDOT mentions, no "13 years"/"since 2013" language.

---

## 3. BEFORE deployment — Frederick must do this

### A. Get real analytics IDs and swap placeholders

| Platform | Where to get the ID | Placeholder to replace |
|---|---|---|
| **Google Tag Manager** | https://tagmanager.google.com -> Create container "partybusrus.com" -> copy Container ID | `GTM-XXXXXXX` |
| **Google Analytics 4** | https://analytics.google.com -> Admin -> Create Property -> add Web data stream -> copy Measurement ID | `G-XXXXXXXXXX` |
| **Meta Pixel** | https://business.facebook.com/events_manager -> Connect Data Sources -> Web -> Meta Pixel -> copy Pixel ID | `XXXXXXXXXXXXXXX` (15 digits) |
| **CallRail (optional)** | https://www.callrail.com -> sign up -> Account ID and Script ID from settings | `XXXXXXXXX` and `XXXXXXXXXXXXXXXXXXXX` |

To swap across all 68 files, from the `site/` folder run (PowerShell):

```powershell
Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace 'GTM-XXXXXXX', 'GTM-YOURREALID' `
    -replace 'G-XXXXXXXXXX', 'G-YOURREALID' `
    -replace 'XXXXXXXXXXXXXXX', 'YOUR15DIGITPIXELID' `
    | Set-Content $_.FullName -NoNewline
}
```

Or bash:
```bash
find . -name "*.html" -exec sed -i \
  -e 's/GTM-XXXXXXX/GTM-YOURREALID/g' \
  -e 's/G-XXXXXXXXXX/G-YOURREALID/g' \
  -e 's/XXXXXXXXXXXXXXX/YOUR15DIGITPIXELID/g' {} \;
```

If you skip CallRail for now, that's fine — the script will 404 silently and not break anything. See `ANALYTICS-SETUP.md` for full instructions.

### B. (Optional) Quick visual smoke test
Open `index.html`, `quote.html`, `fleet/bus-30pax.html`, `services/weddings.html`, `cities/arlington-va.html`, `blog/index.html`, `es/index.html` in a browser locally to confirm they look right.

---

## 4. Deployment instructions

### Option A — Netlify drag-and-drop (fastest)
1. Go to https://app.netlify.com
2. Sign in / create account
3. Drag the entire `site/` folder onto the dashboard "deploy" zone
4. Netlify will assign a temporary URL (e.g. `xyz123.netlify.app`)
5. Confirm the homepage and a few inner pages load
6. Submit the quote form on the staging URL — check Forms tab in Netlify dashboard to confirm submission appeared

### Option B — Netlify CLI / Git (for ongoing updates)
1. Init git in the site folder, push to GitHub
2. In Netlify, "Add new site" -> "Import from Git" -> select repo
3. Build settings: leave blank (this is a static site, no build step)
4. Publish directory: `site` (or root if you only commit site/)

### Connect the domain
1. Netlify dashboard -> Domain settings -> Add custom domain
2. Add `partybusrus.com` and `www.partybusrus.com`
3. Either update DNS at your registrar to point to Netlify nameservers (easier) OR add A/CNAME records (more control)
4. Netlify auto-provisions SSL via Let's Encrypt — wait 5-15 min for HTTPS to go green

### Verify Netlify Forms is enabled
- Netlify dashboard -> Forms tab — should show `quote-form` listed
- If it doesn't appear after first deploy, that's because Netlify's form parser needs to see the form at deploy time. The `data-netlify="true"` attribute is present, so it should auto-detect

---

## 5. Post-deployment checklist (do within 24 hrs of go-live)

- [ ] Submit `https://www.partybusrus.com/sitemap.xml` to Google Search Console (https://search.google.com/search-console)
- [ ] Submit same sitemap to Bing Webmaster Tools (https://www.bing.com/webmasters)
- [ ] Verify domain ownership in both (DNS TXT record or HTML upload)
- [ ] Connect / claim Google Business Profile at https://business.google.com — make sure website field points to `https://www.partybusrus.com`
- [ ] Set up `info@partybusrus.com` email forwarding (Cloudflare Email Routing or registrar mail forwarding -> forwards to a real inbox)
- [ ] Test the quote form end-to-end: submit a fake quote, confirm it lands in Netlify Forms dashboard AND triggers the GA4 `lead_confirmed` event AND lands on the thank-you page
- [ ] Test `tel:+17039913500` on a real mobile phone — should open the dialer
- [ ] Test on iPhone Safari + Android Chrome + desktop Chrome + desktop Safari — basic visual sanity
- [ ] Test the Spanish home page `/es/index.html` loads correctly

---

## 6. First 7 days post-launch

**Daily:**
- Check Netlify Forms dashboard for quote submissions (forward each to `info@partybusrus.com` if not already configured to auto-notify)
- Check GA4 Realtime — traffic will be near zero at first, this is normal
- Check Netlify analytics for any 404s — if URLs keep getting hit that don't exist, add to `_redirects`

**By end of week 1:**
- Submit business to top citation sites — pick at least 5 from this list:
  - Yelp
  - Better Business Bureau (BBB)
  - WeddingWire
  - The Knot
  - Thumbtack
  - Angi
  - GigSalad (entertainment vendors)
  - HereComesTheGuide
  - Wedding Spot
  - Apple Maps Connect
- Submit press release to local DMV outlets (DCist, WTOP, Northern Virginia Magazine) announcing modernized booking site — optional but cheap PR
- Verify Google Business Profile is showing the new site link
- Run the live site through https://pagespeed.web.dev (target: 80+ mobile, 90+ desktop)
- Run through https://search.google.com/test/rich-results on the homepage to confirm LimousineService schema is recognized

---

## 7. Files of note in `site/`

- `index.html` — homepage
- `_redirects` — Netlify clean-URL routing (trailing slashes -> .html)
- `sitemap.xml` — 66 indexed URLs
- `robots.txt` — points to sitemap, disallows `/thank-you.html`
- `ANALYTICS-SETUP.md` — detailed analytics setup guide (companion to this doc)
- `404.html` — branded not-found page; configured as Netlify fallback via `_redirects`

---

## 8. Notes for Frederick

- **Large blog hero images (~600-940 KB):** `IMG_8575.JPG` and `IMG_8576.JPG` appear as background images in the "related posts" section of every blog post — these are below-the-fold and load lazily as CSS backgrounds, so it's not a performance issue, but if you ever revisit performance optimization these are candidates to compress to ~300 KB.
- **CallRail is optional.** If you don't want phone-call attribution, you can safely leave the `XXXXXXXXX` placeholder in the CallRail script tag — the browser will 404 silently and nothing breaks. To remove it entirely, search-and-replace the CallRail script line out of every file.
- **Spanish page is single-page only.** `/es/index.html` exists as a landing page. If you want a full Spanish translation in the future, the structure is ready — just clone the directory pattern.
- **Robert's review:** Before you flip the DNS, have Robert click through 5-10 random pages. Owner sign-off matters.
