# Party Bus R Us — Mobile Fix Handoff

## What I need you to do
Make `partybusrus.vercel.app` work correctly on mobile (iPhone + Android, all sizes 320px–768px). The site is a static HTML site with no framework. Currently the desktop version works fine but mobile has layout issues.

## Live URL
- Production: **https://partybusrus.vercel.app**
- Vercel project: `freds-projects-a353dcff/partybusrus`

## Local files (Windows)
- Site root: `C:\Users\LATITUDE-7400\Documents\Claude\Projects\Party Bus R Us\site\`
- 92 HTML pages total (home, fleet/, services/, cities/, blog/, etc.)
- Main file to focus on: `site/index.html`
- Mobile overrides currently in: `site/mobile.css` (loaded last via `<link>` in every page's `<head>`)
- Deployment config: `site/vercel.json`

## Tech stack
- Pure static HTML/CSS/JS (no React, no build step)
- All styles are INLINE in `<style>` tags within each HTML file, PLUS an external `/mobile.css` loaded last
- Hosted on Vercel (Hobby plan)
- Domain: partybusrus.com (DNS not yet pointed — still on partybusrus.vercel.app)

## Known mobile issues (from real iPhone screenshots)

### 1. "Step Inside" photo showcase section (homepage, section #2)
- Has class `.showcase-grid` and `.showcase-tile` on tiles
- On mobile it shows a broken multi-column layout — the "Diamond 24" featured tile takes the left half with text overlapping, smaller tiles ("Dance pole & wood floor", "Club-grade LED", "Captain seating", "Wet bar & glassware") jam on the right
- Should stack vertically with proper aspect ratios on phones
- Inline styles on each tile use `background-image: url(...)` and `grid-row: span 2` for the featured one
- Existing mobile.css attempts to override but doesn't fully work

### 2. Comparison table (homepage, "How we compare" section)
- HTML: `<table class="comp-table">` with 3 columns: Feature | Party Bus R Us | Typical operator
- On mobile it's cut off horizontally — "Within 60 minu..." and third column "Typical operator" disappear off-screen
- My attempt converts each `<tr>` to a card on mobile via `display:block` — Codex may want to redo this from scratch

### 3. Fleet section
- Frederick says "the fleet section doesn't work on mobile"
- After homepage trim, there's NO standalone fleet section listing the 7 buses by name. Just the photo showcase.
- He may want a proper fleet preview added back as cards: Imperial 35, Empire 32, Signature 30, Cavalier 28, Bridal 25, Diamond 24, Midnight 20 — each with bus name, passenger count, key feature, photo, link to `/fleet/bus-XXpax.html`

### 4. General mobile concerns
- Sections feel too tall / lots of empty padding on mobile
- Some grids use inline `style="display:grid; grid-template-columns:..."` which override the external mobile.css

## Brand / design constraints
- **Dark theme** (do not switch to cream/light). Body background `#14101c`, text `#faf6ec`
- Gold accent `#d4af37`, wine red `#8a2535`
- Some sections are intentionally cream (`.s-light` class) for alternation — keep them
- Typography: Cormorant Garamond for headings (`.serif`), Inter for body
- Mobile sticky bottom CTA bar with 4 buttons: Call (wine) / Text (gold) / WhatsApp (green) / Quote (gold) — KEEP this
- Topbar with social icons (WhatsApp, Instagram) — KEEP

## What NOT to change
- Don't switch to cream/light theme — Frederick wants dark
- Don't remove the SMS/WhatsApp/Instagram buttons in topbar or float CTA
- Don't remove the green "Available tonight" banner at top
- Don't change the form action — it goes to `https://formsubmit.co/hello@realestateadvancement.com` (works, do not change)
- Don't remove `vercel.json`, `manifest.json`, `sw.js`, or `_redirects`
- Don't change the domain or hosting — stays on Vercel
- Keep PWA install support
- Business address is **6601 Stonecrest Lane, Fairfax VA** (do not revert to old "1107 Treeside")

## Sections currently on the homepage (in order)
1. Hero ("Move the moment forward.")
2. Stats `.stats-big` (cream)
3. "This is what you're booking" — Step Inside photo showcase (DARK, broken on mobile)
4. "The DMV's most memorable nights" — Services grid (cream)
5. "Booked because we're different" — Why us (dark)
6. "How we compare" — Comparison table (dark, broken on mobile)
7. "The entire DMV" — Service area / cities (cream)
8. "Every booking is bespoke" — Pricing teaser / how we quote (dark)
9. "One bus. Infinite vibes." — LED color cycle photos (dark)
10. "Real moments, real reviews" — Testimonials (cream)
11. FAQ (cream)
12. Final CTA (gradient)

## How to deploy (Vercel CLI is already set up on Frederick's machine)
```powershell
cd "C:\Users\LATITUDE-7400\Documents\Claude\Projects\Party Bus R Us\site"
vercel --prod
```
Takes ~10-20 seconds. Result will be live at `https://partybusrus.vercel.app` immediately.

## Forms
- Form is on `site/quote.html`
- Action: `https://formsubmit.co/hello@realestateadvancement.com`
- 3-step UI: When/who → What/where → Contact
- Geolocation auto-fill works
- localStorage saves draft progress
- Do NOT switch back to Netlify Forms (the site is on Vercel now)

## Phone number
**(703) 399-4394** — used in `tel:`, `sms:`, and WhatsApp links throughout

## Email (for FormSubmit until proper email is set up)
**hello@realestateadvancement.com**

## Existing mobile.css structure
The file is at `site/mobile.css` and is loaded LAST on every page. It has 11 sections of overrides:
1. Universal foundation
2. Touch device tap targets (44×44)
3. Tablet ≤980px (hamburger menu)
4. Phone ≤680px (1-col grids, hero scaling, etc.)
5. Tiny phones ≤380px
6. Animation kills on mobile
7. Landscape phone short height
8. Foldable ≤320px
9. Print styles
10. Showcase grid mobile (partial fix)
11. Comparison table mobile cards (partial fix)

You can rewrite this file from scratch if it's easier. Just keep the link tag pointing to `/mobile.css`.

## Test on
- iPhone Safari (375px and 414px widths)
- Chrome Android (360px and 412px widths)
- iPhone SE (320px width — edge case)
- iPad portrait (768px)

## Brief
The customer (Frederick) is the sales/marketing lead for Party Bus R Us, a DMV-area party bus rental company. 70%+ of his traffic will be mobile. The site must look professional and convert leads through the quote form, phone, text, or WhatsApp. Performance, tap-friendliness, and clean alternating section design are top priorities.

Good luck.
