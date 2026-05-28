# Analytics Setup Guide — Party Bus R Us

This site has analytics scaffolding installed on every page, but with **placeholder IDs**. Before going live in production, you must replace each placeholder with a real ID from the corresponding platform. This document explains what each placeholder represents, how to get the real ID, and how to swap them in.

---

## 1. What's installed (overview)

Every HTML page on the site (~59 pages) has been instrumented with four analytics/tracking layers:

| Layer | Purpose | Placeholder |
|---|---|---|
| **Google Tag Manager (GTM)** | Container that lets you add/edit other tags without code changes | `GTM-XXXXXXX` |
| **Google Analytics 4 (GA4)** | Pageviews, events, audience, conversion tracking | `G-XXXXXXXXXX` |
| **Meta (Facebook) Pixel** | Audience building + conversion tracking for Facebook/Instagram ads | `XXXXXXXXXXXXXXX` (15 digits) |
| **CallRail** | Dynamic phone-number swap to attribute calls to traffic source | `XXXXXXXXX` (account) + `XXXXXXXXXXXXXXXXXXXX` (script) |

Plus **conversion + interaction events** wired up: click-to-call, mailto clicks, CTA button clicks, scroll depth (25/50/75/100%), and quote-form submissions.

The thank-you page (`/thank-you.html`) fires an additional `lead_confirmed` conversion event on load.

---

## 2. Placeholder reference

Below is exactly what each placeholder looks like in the code, and what to replace it with.

### Google Tag Manager
- **Placeholder:** `GTM-XXXXXXX`
- **Real ID format:** `GTM-XXXXXXX` (7 alphanumeric characters after the dash, e.g. `GTM-K3LM9PQ`)
- **Where:** Appears in head GTM snippet AND in the `<noscript>` iframe directly after `<body>`.

### Google Analytics 4
- **Placeholder:** `G-XXXXXXXXXX`
- **Real ID format:** `G-XXXXXXXXXX` (10 alphanumeric characters, e.g. `G-AB12CD34EF`)
- **Where:** Appears twice in the head gtag block — in the script src URL and in the `gtag('config', ...)` call.

### Meta Pixel
- **Placeholder:** `XXXXXXXXXXXXXXX` (15 X's)
- **Real ID format:** 15-16 digit numeric ID (e.g. `123456789012345`)
- **Where:** Appears in `fbq('init', ...)` AND in the `<noscript>` fallback `<img>` src.

### CallRail (optional)
- **Placeholders:** `XXXXXXXXX` (company ID, 9 chars) AND `XXXXXXXXXXXXXXXXXXXX` (swap script ID, 20 chars)
- **Real format:** `//cdn.callrail.com/companies/123456789/abc123def456ghi789jk/12/swap.js`
- **Where:** One line in the head analytics block.

---

## 3. How to get each ID

### 3a. Google Tag Manager (FREE)
1. Go to https://tagmanager.google.com — sign in with the Google account you want to own the property.
2. Click **Create Account**.
3. Account Name: `Party Bus R Us`. Country: United States.
4. Container Name: `partybusrus.com`. Target platform: **Web**.
5. Accept terms. The next screen shows your **Container ID**, formatted like `GTM-K3LM9PQ`.
6. You'll also see two install snippets — you can ignore them (the snippets are already in our HTML; we just need the ID).

### 3b. Google Analytics 4 (FREE)
1. Go to https://analytics.google.com — sign in with the same Google account.
2. Click **Admin** (gear, bottom-left) > **Create > Property**.
3. Property name: `Party Bus R Us`. Time zone: `Eastern Time`. Currency: `USD`.
4. Business details: industry `Travel`, size as appropriate. Business objectives: pick `Generate leads` and `Examine user behavior`.
5. Choose **Web** as the platform. Website URL: `https://www.partybusrus.com`. Stream name: `Party Bus R Us — Main`.
6. After it creates the stream, you'll see a **Measurement ID** like `G-AB12CD34EF`. That's the one.

### 3c. Meta Pixel (FREE)
1. Go to https://business.facebook.com — sign in with the Facebook account that owns/will own the ad account.
2. **Business Settings** > **Data Sources** > **Datasets** (formerly "Pixels").
3. Click **Add** > Give it a name like `Party Bus R Us Pixel` > **Create**.
4. The Pixel ID appears at the top — it's a 15-16 digit number like `123456789012345`. Copy it.
5. You can skip the "Set up the Pixel" wizard since the code is already on the site.

### 3d. CallRail (PAID — $45/mo minimum) — OPTIONAL
CallRail provides dynamic number insertion (DNI), which swaps the displayed phone number based on visitor source. Useful when you start running paid ads and want to attribute calls to a specific channel.

**Skip this for now if you're not running paid ads yet.** The Pixel + GA4 already capture click-to-call events as conversions. You can come back to CallRail later.

If/when ready:
1. Sign up at https://www.callrail.com (Lite plan is $45/mo, includes 10 tracking numbers).
2. Create your first **Source > Online** with a "swap target" set to your main displayed number (`703-991-3500`).
3. After setup, go to **Settings > Integrations > JavaScript snippet** to get the swap script URL. It looks like `//cdn.callrail.com/companies/123456789/abc...jk/12/swap.js`.
4. The two ID strings in our placeholder represent the company ID (first segment) and script ID (second segment).

If you're not using CallRail, you can either:
- Leave the placeholder line in (the request will 404 silently — minor wasted request, no functional impact), OR
- Delete that one line from all pages (see Section 4).

---

## 4. How to replace the placeholders across all files

The placeholders appear in all 59 HTML files. The fastest way to replace them is a project-wide find/replace.

### Option A — VS Code / Cursor (recommended)
1. Open the `site/` folder.
2. Press `Ctrl+Shift+H` (Windows/Linux) or `Cmd+Shift+H` (Mac) to open project-wide find/replace.
3. Make sure **"files to include"** is set to `**/*.html` (or limit to `site/**/*.html`).
4. For each placeholder, do find > replace > **Replace All**:
   - Find `GTM-XXXXXXX` → Replace with your real GTM ID (e.g. `GTM-K3LM9PQ`).
   - Find `G-XXXXXXXXXX` → Replace with your real GA4 ID (e.g. `G-AB12CD34EF`).
   - Find `XXXXXXXXXXXXXXX` → Replace with your real Meta Pixel ID (e.g. `123456789012345`).
   - For CallRail, the line to edit looks like `cdn.callrail.com/companies/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXX/12/swap.js`. Replace the two `X` strings with your actual company ID and script ID, or delete the entire `<script async src="//cdn.callrail.com/...swap.js"></script>` line if you're not using CallRail.

**Important — order matters.** Replace `GTM-XXXXXXX` and `G-XXXXXXXXXX` and the CallRail IDs BEFORE the Meta Pixel `XXXXXXXXXXXXXXX`, because the 15-X Meta string could partially match other X-strings. (In practice the placeholders are sized differently so it's usually fine, but to be safe, do the Meta one last.)

### Option B — PowerShell one-liner (Windows)
From inside the `site/` folder:
```powershell
$replacements = @{
    'GTM-XXXXXXX'       = 'GTM-K3LM9PQ'        # your real GTM ID
    'G-XXXXXXXXXX'      = 'G-AB12CD34EF'       # your real GA4 ID
    'XXXXXXXXXXXXXXX'   = '123456789012345'    # your real Meta Pixel ID
}
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    foreach ($k in $replacements.Keys) {
        $content = $content.Replace($k, $replacements[$k])
    }
    Set-Content -Path $_.FullName -Value $content -NoNewline
}
```
Edit the IDs in the `$replacements` hashtable first, then run.

### Option C — `sed` (Mac/Linux)
```bash
cd site/
find . -name "*.html" -exec sed -i '' \
  -e 's/GTM-XXXXXXX/GTM-K3LM9PQ/g' \
  -e 's/G-XXXXXXXXXX/G-AB12CD34EF/g' \
  -e 's/XXXXXXXXXXXXXXX/123456789012345/g' \
  {} +
```
On Linux, use `sed -i` (no empty quotes after `-i`).

---

## 5. How to verify tracking is working (after deploy)

### 5a. Browser DevTools — quickest gut check
1. Visit the live site (or local preview).
2. Open DevTools > **Network** tab > filter on `collect`.
3. You should see requests to:
   - `google-analytics.com/g/collect` (GA4 hits)
   - `facebook.com/tr` (Meta Pixel hits)
   - `googletagmanager.com/gtm.js?id=GTM-...` (GTM container load)
4. Click a `tel:` link — you should see a new `gtag` request fire with `event=click_to_call`.

### 5b. GA4 — Realtime
1. Open Google Analytics > select your Party Bus R Us property > **Reports > Realtime**.
2. In a separate tab, load any page on the site.
3. Within ~10-30 seconds, you should see your session appear ("1 user in last 30 minutes").
4. Click around — pageviews and `scroll_depth` / `cta_click` events should show under the **Event count by Event name** card.

### 5c. Meta Pixel — Pixel Helper extension
1. Install the **Meta Pixel Helper** Chrome extension.
2. Visit a site page. Click the extension icon.
3. You should see "1 pixel found on this page" with one PageView event. Errors are explained inline.
4. Submit a test quote → load thank-you → you should see CompleteRegistration fire there.

### 5d. GTM — Preview mode
1. In Tag Manager, click **Preview** (top-right).
2. Enter the URL of the site, click **Connect**.
3. A debug pane opens. As you click around, events fire and show up in the "Tags Fired" panel.
4. Once you've added GA4 / Meta tags inside GTM, this is the place to confirm they're firing as expected.

### 5e. CallRail (if installed)
1. Visit any page on the site. Look at the phone number displayed in the header / CTA buttons.
2. It should change to a tracking number (e.g. a CallRail-issued local DC/VA number).
3. CallRail dashboard > **Call Log** will record the source of any call placed via that swapped number.

---

## 6. What gets tracked automatically

Once the placeholders are replaced, the following events fire automatically on every page (no extra setup in GTM/GA4 needed):

| Event | Trigger | GA4 event name | Meta Pixel event |
|---|---|---|---|
| Pageview | Page load | `page_view` (auto) | `PageView` |
| Click-to-call | Any click on `<a href="tel:...">` | `click_to_call` | `Contact` |
| Email click | Any click on `<a href="mailto:...">` | `email_click` | — |
| CTA click | Any click on `a.btn`, `a.cta`, `.hero-actions a`, `.final-cta a` | `cta_click` | — |
| Scroll depth | 25%, 50%, 75%, 100% scrolled | `scroll_depth` (value = depth) | — |
| Quote form submit | Submission of `form[name="quote-form"]` | `generate_lead` | `Lead` |
| Lead confirmed | Load of `/thank-you.html` | `lead_confirmed` | `CompleteRegistration` |

You can mark `generate_lead` and `lead_confirmed` as **Conversions** in GA4 (Admin > Events > toggle "Mark as conversion").
You should also mark `Lead` and `CompleteRegistration` as **Custom Conversions** in Meta Events Manager.

---

## 7. Performance optimizations applied

Same pass that added analytics also:

1. **Lazy-loaded all `<img>` tags** below the first one on each page (`loading="lazy" decoding="async"`). This defers offscreen images so they don't block initial render.
2. **Compressed the 3 heaviest images** in place under `site/`:
   - `IMG_5053.JPG`: 4.5 MB → ~375 KB
   - `IMG_3095.jpeg`: 2.2 MB → ~298 KB
   - `IMG_2366.jpeg`: 1.7 MB → ~308 KB
3. **Generated WebP versions** alongside each (smaller, modern format):
   - `IMG_5053.webp`, `IMG_3095.webp`, `IMG_2366.webp`
   - Currently unused — to wire them in, wrap the existing `<img>` tags in `<picture>` blocks with a `<source srcset="...webp" type="image/webp">` above the `<img>`. Browsers that support WebP will use the smaller file; others fall back to the JPEG.

Originals of the three compressed images remain in the **project root** untouched, so you can re-derive at different quality settings if needed.

---

## 8. Roll-back / disabling

To temporarily disable all analytics without removing code:
- **GTM:** Pause the container in Tag Manager (or set ID to `GTM-XXXXXXX` — invalid container = no requests).
- **GA4:** Comment out the gtag `config` line in the head block.
- **Meta Pixel:** Comment out the `fbq('init', ...)` line.
- **CallRail:** Remove or comment the swap.js `<script>` line.

To strip analytics entirely from all files, look for the markers `<!-- ====== ANALYTICS SCAFFOLDING ====== -->` and `<!-- ====== END ANALYTICS SCAFFOLDING ====== -->` and delete the block between them (plus the GTM noscript right after `<body>` and the event tracking script before `</body>`).

---

## 9. Privacy / compliance notes

- **`anonymize_ip: true`** is set on GA4 by default. Good for GDPR-leaning safety, no impact on your reporting.
- **No consent banner is installed yet.** If you ever take bookings from EU/UK visitors, or you start marketing in California heavily, you should add a cookie consent solution (e.g. CookieYes free tier, Termly, or Iubenda). At that point you'd gate the analytics scripts behind consent — happy to wire that in later.
- **CallRail** records call audio by default. If you enable it, update your privacy policy to disclose call recording and ensure your greeting plays a "this call may be recorded" message where required by state law.

---

**Questions or ready to deploy?** Once Frederick has the four real IDs in hand, replacing them is a 2-minute job. Then push to production and verify per Section 5.
