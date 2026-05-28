# Party Bus R Us · Project Folder

Last updated: May 19, 2026 · **Production-ready multi-page site + comprehensive strategy delivered**

## What's here

This folder contains everything for the Party Bus R Us website launch and marketing plan.

### Quick navigation

| What you want | Where to find it |
|---|---|
| **Deploy the site** | `site/` — drag onto Netlify |
| **The master plan** | `deliverables/100-Percent-Audit-Strategy.html` |
| **Robert's review** | `deliverables/Robert-Review-Guide.html` |
| **Multi-site strategy** | `deliverables/Multi-Site-Strategy.html` |
| **Original audit** | `deliverables/Audit-Strategy.html` |
| **Photo shoot plan** | `deliverables/Party-Bus-Photo-Shoot-Gameplan.pdf` |
| **Tracking ID setup** | `site/ANALYTICS-SETUP.md` |
| **Deploy checklist** | `site/PRODUCTION-READY-HANDOFF.md` |

### Folder structure

**`site/` — PRODUCTION DEPLOY**
68 HTML pages, fully optimized for SEO, with analytics scaffolding, sitemap, robots, Netlify Forms wiring. Drag this folder onto Netlify. **Do not edit by hand** — it is the live deploy artifact.

**`deliverables/` — Strategy & reference documents**
- `100-Percent-Audit-Strategy.html` — master 14-section playbook (audit, competitors, Google Ads plan, IG playbook, 30/90-day roadmap)
- `Audit-Strategy.html` — original detailed audit
- `Robert-Review-Guide.html` — 5-minute walkthrough for Robert
- `Multi-Site-Strategy.html` — partylimobusdc + partybusrus dual-domain plan
- `Party-Bus-Photo-Shoot-Gameplan.pdf` — printable shoot-day checklist (8 pages)

**`source-photos/` — Original photos**
High-res bus photos. The `site/` folder has its own optimized copies — these are the originals/source for future edits and reshoots.

**`logo/` — Production logos**
Favicon, lockup, monogram, wordmark. Referenced by `site/` and by the HTML deliverables (which use `../logo/` paths).

**`Logos/` — Logo design archive**
Round 1 (18 generated) + Round 2 (5 refined) logo concepts. See `Logos/README.md` for the full breakdown.

**`archive/` — Superseded files, kept for reference**
- `Website-Mockup.html` — the old single-page SPA, superseded by `site/`
- `Website-Mockup.html.bak`, `Website-Mockup.html.preconversion` — backups from the SPA-to-multipage conversion
- `scripts/` — build scripts that generated the multi-page site (`build_multipage.py`, `generate_city_pages.py`)
- `old-deploy/deploy/` — earlier mid-state deploy folder, now superseded
- `temp-videos/` — raw VIDEO-*.mp4 footage from the May 18 shoot (not used by `site/`)

## Where we are right now

- **68-page multi-page site** ready to deploy (was a 1-page SPA)
- **All Robert's separation requirements met** — no years language, no insurance, no City Coachways, Fairfax address, info@partybusrus.com email plan
- **Form is functional** — wired to Netlify Forms
- **Analytics ready** — GA4 + GTM + Meta Pixel + CallRail scaffolding (placeholders for Frederick to fill)
- **Real blog content** — 10 posts with real bus photos, no stock
- **Sitemap + robots + clean URLs**
- **Performance optimized** — favicon fixed, large images compressed + WebP

## What's next

1. Get tracking IDs (see `site/ANALYTICS-SETUP.md`)
2. Deploy `site/` to Netlify
3. Submit sitemap to Google Search Console
4. Take photos of the red leather bus + more exteriors (see `deliverables/Party-Bus-Photo-Shoot-Gameplan.pdf`)
5. Launch Google Ads pilot ($2,400/mo) once tracking is verified
6. Start the Instagram cadence (5 reels/week — see Section 7 of the master playbook)

## Sharing with Robert

Open `deliverables/Robert-Review-Guide.html` locally to preview, then either:
- Drag the `site/` folder onto [tiiny.host](https://tiiny.host) for a public preview link, **or**
- Send the deployed Netlify URL once `site/` is live.
