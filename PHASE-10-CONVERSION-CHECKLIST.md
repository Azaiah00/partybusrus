# Phase 10 Conversion Checklist — Action Items for Frederick / Robert

The site is fully built and deployed. Phase 10 is mostly about turning on tracking, publishing pricing, and claiming off-site listings — work that has to happen outside the codebase.

## Already done in-code (Phases 1-10)

✅ Float CTA bar (Call/Text/WhatsApp/Quote) on every page, always visible on mobile
✅ Hero CTAs (Reserve / Explore Fleet) visible above the fold on iPhone SE through Pro Max
✅ Mid-page Quote CTA strip after the photo cluster
✅ Final CTA section at the end of every page
✅ Phone tap-call: `tel:+17033994394` — works on iPhone + Android
✅ SMS pre-fill: `sms:+17033994394?body=...` — cross-platform compatible (Phase 10 i1 fixed a `?&body` bug that may have silently failed on some iOS versions)
✅ WhatsApp deep link: `wa.me/17033994394?text=...` — opens app on mobile, web on desktop
✅ Spanish version `/es/` discoverable from the topbar on every English page
✅ Quote form 3-step flow with geolocation auto-fill + localStorage draft save + FormSubmit to `hello@realestateadvancement.com`
✅ Trust signals (reviews, comparison, FAQ) front-loaded in homepage scroll
✅ Live-now badge (Phase 10 i3) pulses above the float CTA when typical DMV competitors are closed (off-hours and Sundays) — reinforces our 24/7 advantage when it matters most
✅ `data-cta="<location>-<action>"` attributes on every float-bar CTA for clean analytics labeling

## Action items — YOU need to do these (off-site / requires your input)

### 1. Provide real analytics IDs (5 minutes once you have them)
Site has placeholder IDs across all 92 pages. Replacing them is a 2-minute PowerShell swap. The full workflow is documented in `site/ANALYTICS-SETUP.md` Section 4.

- [ ] **Google Tag Manager** — sign up at https://tagmanager.google.com, get `GTM-XXXXXXX`
- [ ] **Google Analytics 4** — sign up at https://analytics.google.com, get `G-XXXXXXXXXX`
- [ ] **Meta Pixel** — Business Manager → Datasets → get 15-digit Pixel ID
- [ ] **CallRail** — only if you're running paid ads; $45/mo minimum, skip if not

Once you have those, paste them into the PowerShell snippet in `site/ANALYTICS-SETUP.md` Section 4 Option B and run from `site/`. Then redeploy:
```powershell
cd "C:\Users\LATITUDE-7400\Documents\Claude\Projects\Party Bus R Us\site"
vercel --prod --yes
```

### 2. Verify conversions fire after IDs land (10 minutes)
Follow `site/ANALYTICS-SETUP.md` Section 5 to verify each platform is receiving events. Test by tapping a `tel:` link, submitting the quote form, etc.

### 3. Publish pricing (Phase 3 #1 — biggest competitive wedge)
Two of five DMV competitors publish per-passenger pricing. We don't. Confirm with Robert:
- [ ] Concrete per-pax rate range (e.g., "$X–$Y per passenger per hour")
- [ ] Full-bus hourly flat rate by bus size (e.g., "Imperial 35 from $Z/hr")
- [ ] Any weekday discount (M–Th)

Then I can rebuild `site/pricing.html` to show actual numbers in 30 minutes.

### 4. Claim Google Business Profile (highest local-SEO leverage)
- [ ] Go to https://business.google.com
- [ ] Claim/create profile at **6601 Stonecrest Lane, Fairfax VA 22030**
- [ ] Phone: `(703) 399-4394`
- [ ] Category: `Limousine Service` (primary), `Bus Charter`, `Wedding Service` (secondary)
- [ ] Service area: DC, Maryland, Northern Virginia (set radius or list cities)
- [ ] Hours: 24/7 dispatch (or your preferred display hours — see GBP "open 24 hours" toggle)
- [ ] Upload real interior photos (use the PHOTO-2026-05-18 series + IMG_xxxx fleet shots in `site/`)
- [ ] Add bilingual EN/ES indicator in the About section
- [ ] Verify ownership (postcard, phone, or email — Google chooses)

### 5. Claim Yelp listing
- [ ] Check if a Yelp listing already exists at https://yelp.com — search for the business name + phone
- [ ] If yes: claim it; if no: create one
- [ ] Match NAP exactly to the site (name, address, phone, hours, service area)
- [ ] Upload the same photo set

### 6. Set up Facebook Business Page
- [ ] Create at https://www.facebook.com/business
- [ ] Match NAP, hours, service area, photos
- [ ] Connect to the Meta Pixel created in step 1 (links ad spend to the site)

### 7. Industry directory listings (low priority, do over time)
- [ ] WeddingWire (high value — competitor Uptown Bus is here with mixed reviews)
- [ ] The Knot
- [ ] Thumbtack
- [ ] WedReviews / Junebug / your industry equivalents

### 8. Strategic decision on partylimobusdc.com brand collision
See `deliverables/Competitor-Benchmark-2026.md` for context. Phase 4 fixed the phone-number overlap (we changed to (703) 399-4394), but the brand-name overlap remains.

Options to discuss with Robert:
- [ ] Trademark the "Party Bus R Us" name with USPTO
- [ ] Reach out to partylimobusdc.com about rebrand / domain transfer / acquisition
- [ ] Out-market them via SEO + content (much of what we've shipped in Phases 7-9 already does this)

## How to know things are working

Once you've done items 1, 2, and 4:

- **Pageviews showing in GA4 Realtime** within 24 hours of redeploy
- **Quote form submissions** appearing in your FormSubmit-forwarded inbox at hello@realestateadvancement.com
- **Google Business Profile insights** start populating after a few days
- **Search Console** indexing the site over 1-4 weeks (request a manual re-crawl after the canonical URL flip-back below)

## Heads-up — DNS flip-back

When `partybusrus.com` DNS is pointed at Vercel, run:
```powershell
git revert a355baf
```
That single command flips every canonical/og/JSON-LD URL back from `partybusrus.vercel.app` to `www.partybusrus.com`. Then redeploy. Google will catch up over the next few weeks.

## Files written this session that you should know about

- `deliverables/Competitor-Benchmark-2026.md` — Phase 3 deliverable with 5 competitor profiles + top-10 action list
- `PHASE-10-CONVERSION-CHECKLIST.md` — this file
- `CLAUDE-CODE-MASTER-BRIEF.md` — the original 10-phase brief (now mostly done)
- `HANDOFF-TO-CODEX.md` — original mobile-fix handoff (now historical)
- `site/llms.txt` — comprehensive LLM/AI engine guidance file (read by ChatGPT, Claude, Perplexity)
- `site/ANALYTICS-SETUP.md` — full analytics setup + verification workflow

## Phase summary — what shipped per phase

| Phase | What | Status |
|---|---|---|
| 1 | Mobile bug fixes (showcase grid, comparison table) | ✅ Live |
| 2 | Functional audit (links, forms, hamburger, float CTA) + `/llms.txt` | ✅ Live |
| 3 | Competitor benchmark deliverable, 5 DMV competitors profiled | ✅ Deliverable written |
| 4 | Hero pill differentiators, comparison table strengthened, LED section moved, Spanish topbar link, Organization JSON-LD schema | ✅ Live |
| — | Phone swap site-wide: (703) 991-3500 → (703) 399-4394 (severed brand-overlap with partylimobusdc.com) | ✅ Live |
| 5 | Service Area moved earlier, mid-page Quote CTA strip, nav-bug fixes | ✅ Live |
| 6 | Mobile animation enablement (counters + fade-ups + stagger on phones), hero load-in, iOS perf audit | ✅ Live |
| 7 | 10 titles + 12 descriptions trimmed, 15 city descriptions rewritten, 6 service h1 keywords injected, cross-link blocks on 64 pages, 42 fleet gallery thumbnails converted to indexable `<img>` | ✅ Live |
| 8 | FAQPage schemas (5 newly created for fleet pages that had visible FAQ but no schema), Spanish schema parity, AreaServed harmonized, Service.provider @id references, SpeakableSpec on 14 pages, OfferCatalog with 7 vehicles + 19 services | ✅ Live |
| 9 | llms.txt rewritten 3x richer, AEO declarative intro on about, Credentials & Safety block, WebPage+Speakable on homepage covering hero pills + comp table | ✅ Live |
| 10 | SMS scheme bug fix, data-cta attributes on float bar, live-now badge during off-hours, this checklist | ✅ Live |

End of build phase. The site is ready for traffic.
