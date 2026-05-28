# Party Bus R Us — Master Build Brief

## Mission
Make **partybusrus.vercel.app** the **best party bus website in the DC / MD / VA area**. Better design, better mobile UX, better SEO/AEO/GEO than every competitor in the DMV. Most traffic will be mobile, so mobile-first or mobile-only thinking. No shortcuts. Do not stop until it's GREAT.

## Quality bar
- Every page must work flawlessly on iPhone SE through iPhone Pro Max, Galaxy Fold (outer) through Galaxy Tab, plus desktop and tablet.
- 90+ Lighthouse mobile score on Performance, Accessibility, Best Practices, SEO.
- Core Web Vitals must pass: LCP <2.5s, INP <200ms, CLS <0.1.
- Every interactive element ≥44×44px tap target.
- Every image has descriptive alt text, lazy loading, modern format (WebP) where possible.
- Zero broken links, zero JS errors in console, zero accessibility violations.
- Forms must work end-to-end (test by submitting one as a real user).

---

## Project context

**Owner & roles**
- Owner: Robert Eljeily (does not interact with the website work directly)
- Sales/Marketing lead doing the work: Frederick (your customer here)
- Frederick's expertise: marketing/sales, NOT a developer. Explain technical decisions plainly.

**Live URL**: https://partybusrus.vercel.app

**Business basics**
- Phone: **(703) 991-3500** (used in `tel:`, `sms:`, WhatsApp links)
- Address: **6601 Stonecrest Lane, Fairfax VA**
- Email (form recipient until proper email is set up): **hello@realestateadvancement.com**
- Fleet: 7 buses, 20–35 passengers (Imperial 35, Empire 32, Signature 30, Cavalier 28, Bridal 25, Diamond 24, Midnight 20)
- Service area: DC, Maryland, Northern Virginia + out-of-town trips
- BYOB-friendly, bilingual (English/Spanish), 24/7 dispatch

**File locations** (Windows machine)
- Project root: `C:\Users\LATITUDE-7400\Documents\Claude\Projects\Party Bus R Us\`
- Site root: `./site/` (92 HTML pages, all styles inline + `/mobile.css` external)
- Deliverables (existing audits and strategy docs): `./deliverables/`
- Memory folder (Frederick's preferences, address, etc.): managed by the user
- Logos: `./logo/` and `./Logos/`
- Source photos: `./source-photos/`

**Tech stack**
- Pure static HTML/CSS/JS — no React, no Next, no build step.
- Styles are INLINE in each HTML file's `<style>` tag, plus an external `/mobile.css` loaded last.
- GSAP 3.12.5 + ScrollTrigger via CDN already loaded on every page (used minimally).
- PWA: `manifest.json`, `sw.js`, icons in `site/`.
- Form handler: **FormSubmit.co** (do not change to Netlify Forms — Vercel doesn't support those).
- Analytics scaffolding present (GA4, GTM, Meta Pixel, CallRail) with placeholder IDs — leave structure, do not remove.

**Hosting**
- Vercel (Hobby plan).
- Deploy command from `site/`: `vercel --prod` (~10–20 seconds).
- Vercel CLI is already installed and authenticated.
- `vercel.json` is in `site/` with clean URLs, redirects for deleted bus pages, security headers, cache rules.

**Existing deliverables to read FIRST before doing competitor work** (don't redo what's been done):
- `deliverables/100-Percent-Audit-Strategy.html` — full audit + competitor analysis + 90-day go-to-market plan from earlier work
- `deliverables/Multi-Site-Strategy.html` — interactive strategy doc
- `deliverables/Mobile-Audit-Report.html` — mobile audit
- `HANDOFF-TO-CODEX.md` — short mobile-issue handoff

---

## The 10-phase plan

Work the phases in order. Don't skip ahead. After each phase, ask Frederick to verify before moving on.

### Phase 1 — Fix what's actively broken on mobile
**Goal**: Eliminate the visible bugs first so you can verify each subsequent phase actually improves things.

Known broken:
1. **Step Inside showcase grid** on homepage — `<section class="s" style="padding-top:90px..."><div class="showcase-grid">...` with `.showcase-tile` children using inline `background-image` styles. Featured tile has inline `style="grid-row:span 2;..."`. On mobile, tiles stack badly and text overlaps photos.
2. **Comparison table** `<table class="comp-table">` on homepage — overflows horizontally on mobile despite the existing mobile.css attempt to convert it to cards.
3. **Fleet section confusion** — Frederick said "the fleet section doesn't work on mobile." The "Step Inside" showcase IS the visual fleet preview, but he may want a separate clear list of the 7 buses with names + photos + passenger counts. Decide together.

How to verify: Test on at least 3 real device emulations (375px, 414px, 360px) using Chrome DevTools mobile mode. Show screenshots to Frederick.

### Phase 2 — 100% functional audit
**Goal**: Confirm every interactive element works on every page.

Inventory:
- Every page in `site/` (92 HTML files: index, about, contact, fleet/, services/, cities/, blog/, quote, etc.)
- Every `<a href="">` (no broken links, all `tel:`/`sms:`/`mailto:`/`http(s)` valid)
- Every `<form>` (submits cleanly, error messaging, success state)
- Every `<button onclick>` (does what it claims)
- Hamburger nav + mobile drawer (opens, closes, links work)
- Float CTA bottom bar (Call / Text / WhatsApp / Quote — all work, context-aware messages on fleet/service/city pages)
- "Available tonight" banner (dismissable, persists dismissal)
- Native share button on fleet + service pages (`navigator.share`)
- PWA install flow (manifest validates, service worker registers, "Add to Home Screen" prompt works)
- Quote form 3-step flow (validation, geolocation auto-fill, draft save, submit)
- Spanish version `/es/` page works
- 404 page works
- Sitemap.xml is current

Test the quote form end-to-end: submit one and confirm Frederick gets the email at `hello@realestateadvancement.com` via FormSubmit.

### Phase 3 — Competitor research + benchmarking
**Goal**: Know exactly what to beat.

Already analyzed competitors (see `deliverables/100-Percent-Audit-Strategy.html`):
- Drive over to that file FIRST and read the existing competitor analysis before doing fresh research.

Refresh the data on the top 5 DMV competitors:
- Look at their homepages on mobile
- Note what they do well: hero design, fleet presentation, CTAs, social proof, urgency, pricing transparency, photo quality, video walkarounds, instant quote tools
- Note what they do poorly: weak mobile, slow load, no SMS option, no real photos, generic copy
- For each: identify 3 things we can do BETTER

Capture findings in `deliverables/Competitor-Benchmark-2026.md` so Frederick has a paper trail.

### Phase 4 — Design polish + premium feel
**Goal**: Make the site feel like a premium service, not a generic local business site.

Audit and improve:
- **Typography** — heading hierarchy clean, body text comfortable, no orphan words
- **Spacing rhythm** — consistent vertical rhythm, no awkward gaps
- **Color use** — dark theme `#14101c` with gold `#d4af37` accents, cream `.s-light` alternation. Don't dilute.
- **Photo treatment** — every photo on the site looks intentional, not stock-y. Frederick uploaded real interior photos (PHOTO-2026-05-18-*.jpg, IMG_*.JPG). Make them shine — consistent aspect ratios, subtle gradient overlays, motion subtle.
- **Hero** — current is "Move the moment forward." Make sure it's gorgeous on mobile (large fluid type, hero photo behind, single primary CTA visible above the fold).
- **Buttons** — consistent style. Gold gradient `linear-gradient(135deg, #d4af37, #c9a961)` for primary, dark with gold border for secondary. No mystery button shapes.
- **Cards** — bus cards, service cards, blog cards, testimonial cards should all share a coherent system: padding, radius, border, hover state.

Do not remove the existing brand elements: dark theme, gold accents, Cormorant Garamond serif, Inter body, social icons in topbar, sticky bottom CTA bar.

### Phase 5 — Layout + flow improvements
**Goal**: Make the homepage flow naturally from "interest → buses → why us → trust → quote."

Current section order (after recent trim):
1. Hero
2. Stats (cream)
3. Step Inside photo showcase (dark)
4. Services grid (cream)
5. Why us (dark)
6. Comparison table (dark)
7. Service area (cream)
8. How we quote pricing teaser (dark)
9. LED color cycle photos (dark)
10. Testimonials (cream)
11. FAQ (cream)
12. Final CTA (gradient)

Critique it. Ask:
- Is the order right for someone who's never heard of us?
- Does the cream/dark alternation feel rhythmic or random? (Currently has some doubles.)
- Are we leading with proof or with claims?
- Where should the primary CTA "Get a Quote" live in the scroll for maximum tap rate?
- Should we add back a clean 7-bus fleet list section that I removed (showing each bus with name, capacity, key feature, photo, link)?

Propose changes to Frederick before making them.

Also audit the navigation order — current top nav: HOME / FLEET / SERVICES / SERVICE AREA / ABOUT / REVIEWS / BLOG. Is that the right priority order? Should "QUOTE" be primary in the nav?

### Phase 6 — GSAP animations (mobile-conscious)
**Goal**: Add motion that delights without tanking performance.

Use sparingly. Already loaded: `gsap.min.js` + `ScrollTrigger.min.js`.

Good animations to add:
- Hero text fade-up on load (300ms)
- Number counters animate up when stats section scrolls into view
- Stagger reveal on bus card grid (50ms stagger)
- Subtle parallax on hero background photo (DESKTOP ONLY — disable on mobile, kills battery)
- Testimonial slider auto-advance with crossfade
- "Live availability"-style dot pulse on banner

Animations to AVOID:
- Anything that disables scrolling momentum on iOS
- Long-duration (>1s) keyframe sequences
- Animations on more than 5 elements at once
- Anything that runs continuously off-screen

MUST respect `prefers-reduced-motion: reduce` — disable all non-essential animation if user has reduced motion preference.

MUST disable parallax + heavy effects below 880px viewport.

Verify 60fps on mid-range Android (real test, not desktop emulation).

### Phase 7 — On-page SEO
**Goal**: Rank #1 for "party bus DC", "party bus Maryland", "party bus Virginia", "party bus rental DMV", and the 50+ long-tail variants.

Per-page checklist:
- Unique, descriptive `<title>` tag (60 chars max, includes primary keyword + location + brand)
- Unique `<meta name="description">` (155 chars max, action-driven)
- One `<h1>` per page, including primary keyword
- Heading hierarchy correct (h1 → h2 → h3, no skips)
- Internal linking to relevant fleet/service/city pages
- Alt text on every image (descriptive, includes keyword naturally where appropriate)
- Image filenames are descriptive (not IMG_1234.jpg)
- Canonical URL set
- Open Graph + Twitter Card metadata (already mostly present)
- Mobile-friendly (Google's mobile-first index)
- Page speed (LCP, FID, CLS pass)

Site-wide:
- `sitemap.xml` lists every public URL
- `robots.txt` allows everything except `/api/`, `/admin/`
- All city pages cross-link to fleet + services
- All fleet pages cross-link to services + cities
- Breadcrumb navigation visible + marked up

### Phase 8 — Schema.org structured data (for traditional + AEO)
**Goal**: Show up in rich results and answer-engine results (ChatGPT, Perplexity, Google AI Overview).

Add or verify schemas:
- `LocalBusiness` (full address, phone, hours, geo coords, areaServed)
- `Service` for each major service (Wedding, Bachelorette, Prom, etc.)
- `Product` for each bus in fleet (or `Vehicle` if more appropriate)
- `FAQPage` on home + FAQ page
- `Review` and `AggregateRating` once real reviews exist (Frederick noted Robert wants to keep this separate from partylimobusdc.com — don't import fake reviews)
- `BreadcrumbList` on every non-home page
- `ContactPage` on contact
- `Article` on blog posts
- `WebSite` with SearchAction

Test in Google Rich Results Test tool.

### Phase 9 — AEO + GEO (Answer Engine + Generative Engine Optimization)
**Goal**: When someone asks ChatGPT/Perplexity/Claude "best party bus DC," partybusrus.com is named.

Tactics:
- Q&A formatted content — FAQ sections answering common queries directly
- Authority signals — "Established 2026," "X events delivered," credentials, certifications (only what's true)
- Citation-friendly content — statistics, specific numbers, named locations
- Brand consistency — same name, address, phone (NAP) across site, GBP, Yelp, Facebook
- Wikipedia/Wikidata entry (if applicable down the road)
- Get listed on Anthropic/OpenAI training-relevant directories (industry directories)
- llms.txt file at root explaining who you are to LLM crawlers
- Clear, declarative content (LLMs prefer "Party Bus R Us is a DC-area party bus rental company offering..." over flowery copy in places)
- Speakable schema on key answer paragraphs

### Phase 10 — Conversion optimization + analytics readiness
**Goal**: Every visitor either books, calls, texts, or remembers us.

Audit:
- CTAs visible above fold on every page
- Sticky bottom CTA bar always reachable
- Quote form completable in <60 seconds with thumb only
- Phone tap-call works on iPhone + Android
- SMS pre-fill works on iPhone + Android (different schemes)
- WhatsApp opens app on mobile, web on desktop
- "Get a quote" button never more than one scroll away
- Trust signals (testimonials, comparison, FAQ) front-loaded
- Spanish version `/es/` discoverable from main nav for Spanish-speaking visitors

Replace placeholder analytics IDs once Frederick provides:
- `GTM-XXXXXXX` → real GTM container ID
- `G-XXXXXXXXXX` → real GA4 ID
- `fbq('init', 'XXXXXXXXXXXXXXX')` → real Meta Pixel ID
- CallRail script IDs

---

## Brand constraints (immutable)

Do NOT change:
- Dark theme (`--bg: #14101c`, body text `#faf6ec`)
- Gold accent (`#d4af37`)
- Phone number `(703) 991-3500`
- Business address `6601 Stonecrest Lane, Fairfax VA` (NOT the old 1107 Treeside Lane)
- Form action — stays on FormSubmit.co (do not migrate to Netlify Forms)
- The owner is Robert Eljeily — never identify Frederick as the owner
- No "X years in business" claims (Robert removed those)
- No fake testimonials — only use the named testimonials currently on the site (Sarah M., Jasmine R., Maria + David L., Ashley T., Derrick K., Rachel B., Lupe G., Tre + crew)
- No connection to partylimobusdc.com — keep these brands separate (Robert's request)
- PWA must keep working (`manifest.json` + `sw.js` + icons)
- Vercel deployment + `vercel.json`

## Brand constraints (flexible — improve if you have a better idea)
- Homepage section order
- Specific copy on individual sections
- Hero headline ("Move the moment forward.")
- Animation choices
- Section background alternation
- Service grid order
- Fleet display style

---

## Deploy + verify workflow

For every change:
1. Edit files in `site/`
2. From PowerShell: `cd "C:\Users\LATITUDE-7400\Documents\Claude\Projects\Party Bus R Us\site"; vercel --prod`
3. Frederick hard-refreshes `https://partybusrus.vercel.app/?v=NEW_NUMBER` on his phone
4. He sends screenshots
5. Iterate

Don't batch huge changes — small, verifiable increments.

---

## Done = GREAT means:

✅ Lighthouse mobile: 95+ Performance / 100 Accessibility / 100 Best Practices / 100 SEO
✅ Looks better than every DMV competitor when Frederick puts the sites side-by-side on his phone
✅ Frederick is excited to share the URL with Robert and friends
✅ Form submissions work end-to-end (verified with a real test submission)
✅ Zero broken links, zero JS errors, zero accessibility errors
✅ Spanish version works
✅ PWA installs cleanly on iOS and Android
✅ Search Console shows no mobile usability issues after deploy
✅ Site appears for "party bus near me" within 30 days of consistent indexing

---

## How to start

1. Read this entire brief
2. Read `deliverables/100-Percent-Audit-Strategy.html` for existing competitor + market context
3. Read `HANDOFF-TO-CODEX.md` for the immediate mobile bugs
4. Read `site/mobile.css` to understand the current mobile override layer
5. Phase 1 first. Fix the visible bugs. Get Frederick to verify before moving on.

Good luck. Make it the best party bus website in the DMV.
