#!/usr/bin/env python3
"""Convert the Party Bus R Us SPA into a multi-page site."""
import os, re, sys, shutil
from pathlib import Path
from datetime import date
import json as _json

ROOT = Path(__file__).parent.resolve()
SRC  = ROOT / "Website-Mockup.html"
OUT  = ROOT / "site"
BASE_URL = "https://www.partybusrus.com"
TODAY = date.today().isoformat()

html = SRC.read_text(encoding="utf-8")
style_m = re.search(r"<style>(.*?)</style>", html, flags=re.DOTALL)
CSS = style_m.group(1).strip()
# Convert relative image refs inside CSS to absolute (works from any page depth)
CSS = re.sub(r"url\('(IMG_[^']+|PHOTO-[^']+|VIDEO-[^']+|logo/[^']+)'\)", r"url('/\1')", CSS)
CSS = re.sub(r'url\("(IMG_[^"]+|PHOTO-[^"]+|VIDEO-[^"]+|logo/[^"]+)"\)', r'url("/\1")', CSS)
CSS = re.sub(r'url\(([A-Za-z][A-Za-z0-9_\-]*\.(?:jpg|JPG|jpeg|JPEG|png|PNG))\)', r'url(/\1)', CSS)

# Find page boundaries
starts = []
for m in re.finditer(r'^<div id="page-([a-z0-9\-]+)" class="page', html, flags=re.MULTILINE):
    starts.append((m.start(), m.group(1)))
main_close = html.find("</main>")
assert main_close > 0, "missing </main>"
pages = {}
for i, (pos, pid) in enumerate(starts):
    end = starts[i+1][0] if i+1 < len(starts) else main_close
    pages[pid] = html[pos:end].rstrip()
print(f"Extracted {len(pages)} pages from SPA")

META = {
    "home":      ("index.html", "Party Bus R Us | DMV's Premier Party Bus & Limo Bus Fleet", "Premium party bus and limo bus rental across Washington DC, Maryland, and Northern Virginia. Weddings, bachelorettes, proms, winery tours. Custom quote in under 60 minutes."),
    "fleet":     ("fleet.html", "Our Fleet | Party Bus R Us | DC, MD & VA Limo Buses", "Seven distinct party buses and limo buses, capacity 20 to 40. LED lighting, premium leather, full bar setups. Browse the fleet and book your DMV night."),
    "pricing":   ("pricing.html", "Pricing & Quotes | Party Bus R Us", "Every Party Bus R Us booking is custom-quoted to your event, hours, and route. Tell us about your night and we will send a custom quote within 60 minutes."),
    "quote":     ("quote.html", "Get a Quote | Party Bus R Us | Reply Within 60 Minutes", "Request a custom party bus quote. Reply within 60 minutes during business hours. Weddings, bachelorettes, prom, winery tours across DC, MD and Northern Virginia."),
    "about":     ("about.html", "About Party Bus R Us | Owner-Operated DMV Party Bus Fleet", "Owner-operated party bus and limo bus fleet serving the DMV. Seven vehicles, professional CDL chauffeurs, dispatch on call 24/7. Meet the team behind the night."),
    "reviews":   ("reviews.html", "Reviews & Testimonials | Party Bus R Us", "What DMV brides, bachelorette parties, prom groups, and corporate clients say after riding with Party Bus R Us. Real testimonials from real bookings."),
    "blog":      ("blog/index.html", "The Journal | Party Bus R Us Blog | DMV Event Planning", "Party bus planning guides, DMV winery routes, wedding shuttle logistics, prom timelines. Practical advice from a Northern Virginia limo bus operator."),
    "weddings":  ("weddings-portfolio.html", "Wedding Portfolio | Party Bus R Us | DMV Wedding Transportation", "Wedding shuttle and bridal party transportation across DC, Maryland, and Northern Virginia. See real DMV weddings, venues, and shuttle setups."),
    "home-es":   ("es/index.html", "Party Bus R Us | Renta de Party Bus y Limo Bus en DC, MD y VA", "Renta de party bus y limo bus de lujo en Washington DC, Maryland y Virginia del Norte. Bodas, quinceaneras, despedidas, tours de vino. Cotizacion personalizada en menos de 60 minutos."),
    "bus-30pax": ("fleet/bus-30pax.html", "The Signature 30 | 30-Passenger Limo Bus | Party Bus R Us", "The Signature 30 is our flagship 30-passenger limo bus. Color-shift LED ceiling, wood floor, full bar, dance pole, calibrated sound. Reserve your DMV night."),
    "service-wedding":     ("services/weddings.html",       "Wedding Shuttle Service | DMV | Party Bus R Us", "Professional wedding shuttle service across DC, Maryland, and Northern Virginia. Bridal party transportation, guest shuttles, getaway buses. Custom quote in 60 minutes."),
    "service-bachelorette":("services/bachelorette.html",   "Bachelorette & Bachelor Party Buses | DMV | Party Bus R Us", "Bachelorette and bachelor party bus rental in DC, Maryland, and Northern Virginia. LED ceilings, dance pole, full bar setups, professional chauffeur. BYOB."),
    "service-prom":        ("services/prom.html",           "Prom & School Limo Bus Rental | DMV | Party Bus R Us", "Safe, parent-approved prom and school limo bus rental across DC, Maryland, and Northern Virginia. Chaperone-friendly, dry buses available, sober CDL drivers."),
    "service-winery":      ("services/winery-tours.html",   "Loudoun Winery Tour Bus | DMV | Party Bus R Us", "Loudoun and Northern Virginia winery and brewery tour buses. Pre-planned routes, knowledgeable drivers, BYOB on board. Book your day trip with Party Bus R Us."),
    "service-corporate":   ("services/corporate.html",      "Corporate Shuttle & Event Transportation | Party Bus R Us", "Corporate shuttle, executive transportation, and event buses across the DMV. On-time arrivals, polished chauffeurs. Tysons to DC and beyond."),
    "service-tours":       ("services/dc-monument-tours.html", "DC Monument & Sightseeing Tour Bus | Party Bus R Us", "Private DC monument tour buses with knowledgeable drivers, PA system, and pre-planned routes. Group tours from 15 to 40 passengers across the National Mall."),
    "service-quinceanera": ("services/quinceaneras.html",   "Quinceanera & Sweet 16 Party Bus | DMV | Party Bus R Us", "Quinceanera and Sweet 16 transportation across the DMV. Church-to-venue shuttles, family-friendly drivers, bilingual booking team. Reserve her night."),
    "service-college":     ("services/college-greek.html",  "College & Greek Life Party Bus | DMV Universities | Party Bus R Us", "Greek life formals, semi-formals, and college events across George Mason, GW, Howard, UMD, and the DMV. Documentation for chapters, ID-check policy, safe rides home."),
    "service-events":      ("services/concerts-sports.html","Concert, Sports & Show Group Transportation | Party Bus R Us", "Group transportation to Capital One Arena, Nationals Park, FedExField, Merriweather, and more. Drop off at the gate, pickup after, no Ubers, no waiting."),
    "service-airport":     ("services/airport-shuttle.html","Airport Shuttle & Group Transfers | DCA, IAD, BWI | Party Bus R Us", "Group airport transfers to DCA, IAD, and BWI on a luxury limo bus. Destination weddings, corporate retreats, family arrivals. Flight tracking included."),
    "service-outoftown":   ("services/out-of-town.html",    "Out-of-Town & Multi-Day Trips | Party Bus R Us", "Beach trips (OCMD, Rehoboth), ski weekends (Wisp, Snowshoe), Baltimore, Annapolis, and Eastern Shore party bus runs. Multi-day available with advance booking."),
    "service-area":        ("services/index.html",          "Services & Service Area | Party Bus R Us | DC, MD, VA", "Full service area and event types for Party Bus R Us. Weddings, bachelorettes, prom, winery tours, corporate, and more across DC, Maryland, and Northern Virginia."),
    "city-arlington":      ("cities/arlington-va.html",     "Party Bus Rental in Arlington, VA | Party Bus R Us", "Party bus and limo bus rental in Arlington, Virginia. Crystal City, Rosslyn, Ballston, Pentagon City pickup. Wedding shuttles, winery tours, group rides."),
    "city-bethesda":       ("cities/bethesda-md.html",      "Party Bus Rental in Bethesda, MD | Party Bus R Us", "Bethesda, Maryland party bus and limo bus rental. Wedding shuttles, corporate events, group nightlife. Reliable CDL drivers, premium interiors, quote in 60 min."),
    "city-georgetown":     ("cities/georgetown-dc.html",    "Party Bus Rental in Georgetown, DC | Party Bus R Us", "Georgetown, Washington DC party bus rental. Bridal portrait shuttles, brunch crawls, group rides on M Street and the Wharf. Custom quote in under an hour."),
    "city-tysons":         ("cities/tysons-mclean-va.html", "Party Bus Rental in Tysons & McLean, VA | Party Bus R Us", "Tysons and McLean party bus rental for corporate shuttles, weddings, and group events. Easy pickup from Tysons Corner, McLean, Vienna. DMV-wide service."),
    "city-leesburg":       ("cities/leesburg-va.html",      "Party Bus Rental in Leesburg, VA | Party Bus R Us", "Leesburg, Virginia party bus rental and Loudoun winery tour buses. Stone Tower, Bluemont, Greenhill. We plan the route, you bring the group."),
    "city-capitol-hill":   ("cities/capitol-hill-dc.html",  "Party Bus Rental in Capitol Hill, DC | Party Bus R Us", "Capitol Hill, DC party bus rental. H Street nightlife, Eastern Market brunch crawls, congressional events. Local drivers who know the back routes."),
    "city-adams-morgan":   ("cities/adams-morgan-dc.html",  "Party Bus Rental in Adams Morgan, DC | Party Bus R Us", "Adams Morgan party bus and limo bus rental. 18th Street nightlife, birthday crawls, group rides home. Safe BYOB transportation across the DMV."),
    "city-the-wharf":      ("cities/the-wharf-dc.html",     "Party Bus Rental at The Wharf, DC | Party Bus R Us", "The Wharf, DC party bus rental. Anthem concert nights, waterfront events, group dinners. Drop off and pickup at the gate. No Ubers required."),
    "city-u-street":       ("cities/u-street-dc.html",      "Party Bus Rental in U Street, DC | Party Bus R Us", "U Street corridor party bus rental. 9:30 Club, Howard Theatre, nightlife crawls. Reliable group transportation across DC, Maryland, and Northern Virginia."),
    "city-navy-yard":      ("cities/navy-yard-dc.html",     "Party Bus Rental in Navy Yard, DC | Party Bus R Us", "Navy Yard, DC party bus rental. Nationals Park game days, Audi Field events, group rides from the suburbs. Drop off at the gate, pickup after the final out."),
    "city-dupont-circle":  ("cities/dupont-circle-dc.html", "Party Bus Rental in Dupont Circle, DC | Party Bus R Us", "Dupont Circle, DC party bus rental for embassy events, weddings at historic venues, and group nightlife. Professional drivers, premium interiors."),
    "city-alexandria":     ("cities/alexandria-va.html",    "Party Bus Rental in Alexandria, VA | Party Bus R Us", "Old Town Alexandria, Virginia party bus rental. King Street weddings, Del Ray birthdays, Carlyle corporate runs. Cobblestone-tested local drivers."),
    "city-fairfax":        ("cities/fairfax-va.html",       "Party Bus Rental in Fairfax, VA | Party Bus R Us", "Fairfax, Virginia party bus rental from our home base. George Mason events, Fair Oaks weddings, NoVA winery day trips. Local fleet, local response."),
    "city-vienna":         ("cities/vienna-va.html",        "Party Bus Rental in Vienna, VA | Party Bus R Us", "Vienna, Virginia party bus and limo bus rental. Weddings at Westwood and Hidden Creek, group rides to Tysons and the city. Reliable, on time, polished."),
    "city-falls-church":   ("cities/falls-church-va.html",  "Party Bus Rental in Falls Church, VA | Party Bus R Us", "Falls Church, Virginia party bus rental. Wedding shuttles, group winery tours, corporate events. Local pickup, DMV-wide drop off."),
    "city-reston":         ("cities/reston-va.html",        "Party Bus Rental in Reston, VA | Party Bus R Us", "Reston, Virginia party bus rental. Reston Town Center weddings, Herndon corporate shuttles, Loudoun winery tours. Custom quote in under 60 minutes."),
    "city-ashburn":        ("cities/ashburn-va.html",       "Party Bus Rental in Ashburn, VA | Party Bus R Us", "Ashburn, Virginia party bus rental and Loudoun winery tour buses. Stone Tower, 868 Estate, Bluemont. Family-owned, route-tested drivers."),
    "city-silver-spring":  ("cities/silver-spring-md.html", "Party Bus Rental in Silver Spring, MD | Party Bus R Us", "Silver Spring, Maryland party bus rental. Quinceaneras, wedding shuttles, birthday crawls. Family-friendly drivers, bilingual booking team available."),
    "city-rockville":      ("cities/rockville-md.html",     "Party Bus Rental in Rockville, MD | Party Bus R Us", "Rockville, Maryland party bus rental. Wedding shuttles, corporate runs, group nightlife into DC. Easy pickup off 270 and Rockville Pike."),
    "city-potomac":        ("cities/potomac-md.html",       "Party Bus Rental in Potomac, MD | Party Bus R Us", "Potomac, Maryland party bus rental. Country club weddings, charity galas, group runs into DC. Discreet, on time, immaculate vehicles."),
    "city-national-harbor":("cities/national-harbor-md.html","Party Bus Rental at National Harbor, MD | Party Bus R Us", "National Harbor, MGM, and Tanger party bus rental. Weddings at the Gaylord, bachelorettes at MGM, group dinners on the waterfront."),
    "city-annapolis":      ("cities/annapolis-md.html",     "Party Bus Rental in Annapolis, MD | Party Bus R Us", "Annapolis, Maryland party bus rental. Naval Academy weekends, waterfront weddings, Eastern Shore beach runs. Bay-bridge-tested drivers."),
    "city-frederick":      ("cities/frederick-md.html",     "Party Bus Rental in Frederick, MD | Party Bus R Us", "Frederick, Maryland party bus rental. Wedding shuttles at country venues, group runs to Baltimore and DC, ski-weekend transportation."),
    "blog-post":           ("blog/how-to-pick-a-party-bus-operator-in-the-dmv.html", "How to Pick a DMV Party Bus Operator | Party Bus R Us Journal", "After moving thousands of DMV groups, here is the short list of what actually separates a good party bus operator from one you will regret booking."),
}

URLS = {}
for pid, (path, _t, _d) in META.items():
    URLS[pid] = "/" if pid == "home" else "/" + path

missing = [pid for pid in pages if pid not in META]
if missing:
    print(f"WARNING: pages with no META entry: {missing}", file=sys.stderr)

def clean_content(body, pid):
    out = body
    out = out.replace(
        '"We do an annual Commanders tailgate from Crystal City — 6 years running with Party Bus R Us. They know exactly where to drop us. Always on time."',
        '"We do an annual Commanders tailgate from Crystal City with Party Bus R Us. They know exactly where to drop us. Always on time."',
    )
    out = out.replace(
        '"We do an annual Commanders tailgate from Crystal City — six years running. They know exactly where to drop us. Always on time."',
        '"We do an annual Commanders tailgate from Crystal City with Party Bus R Us. They know exactly where to drop us. Always on time."',
    )
    out = out.replace(
        "<h2>Thousands of <em>unforgettable nights.</em></h2>",
        "<h2>Real reviews from <em>real DMV nights.</em></h2>",
    )
    out = out.replace(
        "Our flat-rate pricing is published on the website — not because it's a marketing tactic, but because we believe wedding couples, prom parents, and bachelor party planners shouldn't have to fill out a form and wait three days to know what something costs.",
        "Every booking is custom-quoted to the event &mdash; hours, route, headcount, and date all factor in. We turn quotes around in under an hour during business hours, because wedding couples, prom parents, and bachelor party planners shouldn't have to wait three days to know what something costs.",
    )
    out = out.replace(
        '<div class="stat-item" style="border-right:none;border-bottom:1px solid var(--line);padding:24px"><div class="n">100%</div><div class="l">Fully Licensed</div></div>',
        '<div class="stat-item" style="border-right:none;border-bottom:1px solid var(--line);padding:24px"><div class="n">60min</div><div class="l">Avg. quote response</div></div>',
    )
    out = out.replace(
        '<div class="item"><div class="big">100%</div><div class="lbl">Fully Licensed</div><div class="sub">CDL drivers · DMV certified</div></div>',
        '<div class="item"><div class="big">60min</div><div class="lbl">Quote response</div><div class="sub">During business hours</div></div>',
    )
    out = out.replace(
        "Yes — all drivers hold commercial CDLs with passenger endorsement, pass annual DOT physicals, and undergo background checks &amp; drug screening. All vehicles are fully licensed and inspected on the DMV inspection cadence.",
        "All drivers hold commercial CDLs with passenger endorsement and undergo background checks &amp; drug screening before they ever touch a wheel. Every vehicle is inspected weekly and deep-cleaned between every booking.",
    )
    out = out.replace(
        "Every driver we hire holds a commercial CDL with passenger endorsement, passes a DOT physical annually, and submits to background checks &amp; drug screening before they ever touch a wheel.",
        "Every driver we hire holds a commercial CDL with passenger endorsement and submits to background checks &amp; drug screening before they ever touch a wheel.",
    )
    out = out.replace("<li>Fully insured · Certificate of Insurance available on request</li>\n", "")
    out = out.replace("<li>COI (Certificate of Insurance) on file</li>\n", "")
    out = out.replace(
        "<h3>1. What&#39;s your insurance coverage?</h3>\n        <p>Ask the operator if they&#39;re fully insured for passenger liability and whether they can provide a Certificate of Insurance (COI) on request. If the answer isn&#39;t fast and confident, walk away. We&#39;ll email you a COI before you book.</p>",
        "<h3>1. Are the drivers professional CDL chauffeurs?</h3>\n        <p>Ask the operator about driver licensing and screening. Every driver in our fleet holds a commercial driver's license with passenger endorsement and has cleared a background and drug screening before their first shift. If the answer isn&#39;t fast and confident, walk away.</p>",
    )
    out = out.replace("(insurance, maintenance, driver hiring, route logistics)", "(maintenance, driver hiring, route logistics)")
    out = out.replace(
        "We can provide a Certificate of Insurance naming your chapter as additionally insured (standard for most nationals). We work directly with chapter advisors and parent organizations when needed. ",
        "We work directly with chapter advisors and parent organizations on documentation requirements. ",
    )
    out = out.replace(
        '<a class="btn gold" href="https://g.page/r/" target="_blank">Leave a Google Review <span class="arrow">→</span></a>',
        '<a class="btn gold" href="/contact.html">Tell us about your experience <span class="arrow">→</span></a>',
    )
    return out

def remove_duplicate_testimonials_block(home_html):
    pattern = re.compile(
        r'\s*<!--\s*TESTIMONIALS\s*-->\s*<section class="s testimonials s-light">.*?</section>',
        flags=re.DOTALL,
    )
    return pattern.sub("", home_html, count=1)

def rewrite_links(s):
    """Rewrite every element with data-page=X to a real URL."""
    def repl_a(m):
        tag_open  = m.group(1)
        pid       = m.group(2)
        tag_rest  = m.group(3)
        url = URLS.get(pid, "/")
        full = tag_open + tag_rest
        full = re.sub(r'\s+href="[^"]*"', "", full)
        full = re.sub(r"^<a", f'<a href="{url}"', full)
        return full
    s = re.sub(r'(<a[^>]*?)\sdata-page="([a-z0-9\-]+)"([^>]*?>)', repl_a, s)

    def repl_other(m):
        tag_open  = m.group(1)
        pid       = m.group(2)
        tag_rest  = m.group(3)
        url = URLS.get(pid, "/")
        full = tag_open + tag_rest
        full = re.sub(r'\s+onclick="[^"]*"', "", full)
        # Inject onclick + cursor + role just before the closing >
        full = re.sub(
            r">$",
            f' onclick="location.href=&#39;{url}&#39;" style="cursor:pointer" role="link" tabindex="0">',
            full
        )
        return full
    s = re.sub(
        r'(<(?:button|div|li|article|section|span)[^>]*?)\sdata-page="([a-z0-9\-]+)"([^>]*?>)',
        repl_other, s
    )
    # Catch-all
    s = re.sub(
        r'(<[a-z]+[^>]*?)\sdata-page="([a-z0-9\-]+)"([^>]*?>)',
        repl_other, s
    )
    return s

HEADER_HTML = '''<!-- TOP BAR -->
<div class="topbar">
  <div class="container">
    <span>Operating 24/7 across DC, Maryland &amp; Northern Virginia</span>
    <span>Call <a href="tel:+17039913500">(703) 991-3500</a> &middot; Serving DC, MD &amp; Northern Virginia</span>
  </div>
</div>

<!-- NAV -->
<nav class="main">
  <div class="container">
    <a class="logo" href="/" aria-label="Party Bus R Us home">
      <span class="mark"><img src="/logo/wordmark-cream.png" alt="Party Bus R Us"></span>
    </a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/fleet.html">Fleet</a>
      <div class="dd"><a class="dd-trigger" href="/services/">Services <span class="caret">&#9662;</span></a>
        <div class="dd-menu">
          <a href="/services/weddings.html">Wedding Shuttle</a>
          <a href="/weddings-portfolio.html">Wedding Portfolio &rarr;</a>
          <a href="/services/bachelorette.html">Bachelorette &amp; Bachelor</a>
          <a href="/services/prom.html">Prom &amp; Schools</a>
          <a href="/services/quinceaneras.html">Quincea&ntilde;eras &amp; Sweet 16</a>
          <a href="/services/college-greek.html">College &amp; Greek Life</a>
          <a href="/services/winery-tours.html">Winery Tours</a>
          <a href="/services/concerts-sports.html">Concerts, Sports &amp; Shows</a>
          <a href="/services/dc-monument-tours.html">DC Monument Tours</a>
          <a href="/services/airport-shuttle.html">Airport Shuttle</a>
          <a href="/services/corporate.html">Corporate</a>
          <a href="/services/out-of-town.html">Out-of-Town Trips</a>
        </div>
      </div>
      <div class="dd"><a class="dd-trigger" href="/services/">Service Area <span class="caret">&#9662;</span></a>
        <div class="dd-menu">
          <a href="/services/"><b>All Locations &rarr;</b></a>
          <a href="/cities/georgetown-dc.html">Georgetown, DC</a>
          <a href="/cities/capitol-hill-dc.html">Capitol Hill, DC</a>
          <a href="/cities/the-wharf-dc.html">The Wharf, DC</a>
          <a href="/cities/arlington-va.html">Arlington, VA</a>
          <a href="/cities/alexandria-va.html">Alexandria, VA</a>
          <a href="/cities/tysons-mclean-va.html">Tysons / McLean, VA</a>
          <a href="/cities/leesburg-va.html">Leesburg, VA</a>
          <a href="/cities/bethesda-md.html">Bethesda, MD</a>
          <a href="/cities/silver-spring-md.html">Silver Spring, MD</a>
          <a href="/cities/national-harbor-md.html">National Harbor, MD</a>
          <a href="/cities/annapolis-md.html">Annapolis, MD</a>
          <a href="/services/out-of-town.html">Out-of-Town Trips</a>
        </div>
      </div>
      <a href="/about.html">About</a>
      <a href="/reviews.html">Reviews</a>
      <a href="/blog/">Blog</a>
    </div>
    <div class="nav-cta">
      <div class="lang-toggle">
        <a href="/" title="English">EN</a>
        <a href="/es/" title="Espanol">ES</a>
      </div>
      <a class="btn ghost" href="tel:+17039913500">(703) 991-3500</a>
      <a class="btn gold" href="/quote.html">Get a Quote <span class="arrow">&rarr;</span></a>
      <button class="menu-btn" onclick="document.querySelector('.mobile-nav').classList.add('open')">&#9776;</button>
    </div>
  </div>
</nav>

<!-- MOBILE NAV -->
<div class="mobile-nav">
  <button class="close" onclick="document.querySelector('.mobile-nav').classList.remove('open')">&#10005;</button>
  <div class="links" style="overflow-y:auto;max-height:calc(100vh - 100px)">
    <a href="/">Home</a>
    <a href="/fleet.html">Our Fleet</a>
    <a href="/services/weddings.html">Wedding Shuttle</a>
    <a href="/weddings-portfolio.html">Wedding Portfolio</a>
    <a href="/services/bachelorette.html">Bachelorette &amp; Bachelor</a>
    <a href="/services/prom.html">Prom &amp; Schools</a>
    <a href="/services/quinceaneras.html">Quincea&ntilde;eras</a>
    <a href="/services/college-greek.html">College &amp; Greek</a>
    <a href="/services/winery-tours.html">Winery Tours</a>
    <a href="/services/concerts-sports.html">Concerts &amp; Sports</a>
    <a href="/services/dc-monument-tours.html">DC Monument Tours</a>
    <a href="/services/airport-shuttle.html">Airport Shuttle</a>
    <a href="/services/corporate.html">Corporate</a>
    <a href="/services/out-of-town.html">Out-of-Town</a>
    <a href="/services/">Service Area</a>
    <a href="/about.html">About</a>
    <a href="/reviews.html">Reviews</a>
    <a href="/blog/">Journal</a>
    <a href="/quote.html">Get a Quote</a>
  </div>
</div>

<!-- FLOATING CTA -->
<div class="float-cta">
  <a href="tel:+17039913500" title="Call now">&#9742; (703) 991-3500</a>
  <a class="gold" href="/quote.html" title="Get a quote">Quote &#9656;</a>
</div>
'''

FOOTER_HTML = '''<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <div class="footer-logo"><img src="/logo/wordmark-cream.png" alt="Party Bus R Us"></div>
        <p style="margin-bottom:6px;color:#bdbdb5">The DMV's premier party bus &amp; limo bus fleet.</p>
        <p style="font-size:12.5px;color:var(--dim);margin-top:14px">1107 Treeside Lane, Fairfax, VA 22030<br>Serving DC, Maryland &amp; Northern Virginia</p>
        <div class="social">
          <a title="Instagram" href="https://www.instagram.com/" rel="noopener">Ig</a>
          <a title="TikTok" href="https://www.tiktok.com/" rel="noopener">Tk</a>
          <a title="Facebook" href="https://www.facebook.com/" rel="noopener">Fb</a>
          <a title="YouTube" href="https://www.youtube.com/" rel="noopener">Yt</a>
          <a title="Google" href="/contact.html">G</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Fleet</h5>
        <a href="/fleet.html">All Vehicles</a>
        <a href="/fleet/bus-30pax.html">Signature 30</a>
        <a href="/fleet.html">Bridal 20</a>
        <a href="/fleet.html">Imperial 40</a>
        <a href="/fleet.html">Diamond 24</a>
        <a href="/fleet.html">Midnight 26</a>
      </div>
      <div class="footer-col">
        <h5>Services</h5>
        <a href="/services/weddings.html">Wedding Shuttle</a>
        <a href="/weddings-portfolio.html">Wedding Portfolio</a>
        <a href="/services/bachelorette.html">Bachelorette &amp; Bachelor</a>
        <a href="/services/prom.html">Prom &amp; Schools</a>
        <a href="/services/quinceaneras.html">Quincea&ntilde;eras</a>
        <a href="/services/college-greek.html">College &amp; Greek Life</a>
        <a href="/services/winery-tours.html">Winery Tours</a>
        <a href="/services/concerts-sports.html">Concerts, Sports &amp; Shows</a>
        <a href="/services/dc-monument-tours.html">DC Monument Tours</a>
        <a href="/services/airport-shuttle.html">Airport Shuttle</a>
        <a href="/services/corporate.html">Corporate</a>
        <a href="/services/out-of-town.html">Out-of-Town</a>
      </div>
      <div class="footer-col">
        <h5>Service Area</h5>
        <a href="/services/"><b>All Locations &rarr;</b></a>
        <a href="/cities/georgetown-dc.html">Georgetown, DC</a>
        <a href="/cities/capitol-hill-dc.html">Capitol Hill, DC</a>
        <a href="/cities/arlington-va.html">Arlington, VA</a>
        <a href="/cities/alexandria-va.html">Alexandria, VA</a>
        <a href="/cities/tysons-mclean-va.html">Tysons, VA</a>
        <a href="/cities/leesburg-va.html">Leesburg, VA</a>
        <a href="/cities/bethesda-md.html">Bethesda, MD</a>
        <a href="/cities/silver-spring-md.html">Silver Spring, MD</a>
        <a href="/cities/annapolis-md.html">Annapolis, MD</a>
        <a href="/services/out-of-town.html">Out-of-Town</a>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <a href="/about.html">About Us</a>
        <a href="/reviews.html">Reviews</a>
        <a href="/quote.html">Get a Quote</a>
        <a href="/blog/">Journal</a>
        <a href="/contact.html">Contact</a>
        <a href="/es/" style="color:var(--gold2)">Versi&oacute;n en Espa&ntilde;ol &rarr;</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Party Bus R Us &middot; 1107 Treeside Lane, Fairfax, VA 22030</span>
      <div class="creds">
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
        <a href="/contact.html">Contact</a>
      </div>
    </div>
  </div>
</footer>
'''

SHARED_SCRIPT = '''<script>
document.querySelectorAll('.mobile-nav .links a').forEach(a => {
  a.addEventListener('click', () => document.querySelector('.mobile-nav').classList.remove('open'));
});
document.querySelectorAll('.avail-date-tab').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    btn.parentElement.querySelectorAll('.avail-date-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
document.querySelectorAll('.gallery-filter button').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.textContent.toLowerCase().trim();
    const isAll = filter.includes('all');
    let container = btn.closest('.container');
    if (!container) return;
    const items = container.querySelectorAll('.testi, .gi');
    items.forEach(item => {
      if (isAll) { item.style.display = ''; return; }
      const text = item.textContent.toLowerCase();
      const kw = filter.replace(/s$/, '').replace(/&amp;/g,'&');
      const kwShort = kw.split(' ')[0];
      if (text.includes(kw) || text.includes(kwShort)) item.style.display = '';
      else item.style.display = 'none';
    });
  });
});
document.querySelectorAll('.gw-state-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const state = btn.dataset.gwState;
    document.querySelectorAll('.gw-state-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const nowEl = document.querySelector('.gw-state-now');
    const futureEl = document.querySelector('.gw-state-future');
    if (nowEl && futureEl) {
      if (state === 'now') { nowEl.classList.add('shown'); futureEl.classList.remove('shown'); }
      else { nowEl.classList.remove('shown'); futureEl.classList.add('shown'); }
    }
  });
});
</script>
'''

def canonical_for(path):
    if path == "index.html":
        return BASE_URL + "/"
    return BASE_URL + "/" + path

def breadcrumb_schema_for(pid):
    path, title, _ = META[pid]
    if path == "index.html":
        return ""
    parts = path.split("/")
    items = [{"@type":"ListItem","position":1,"name":"Home","item": BASE_URL + "/"}]
    if len(parts) == 1:
        items.append({"@type":"ListItem","position":2,"name": title.split("|")[0].strip(),"item": canonical_for(path)})
    else:
        section = parts[0]
        section_label = {"fleet":"Fleet","services":"Services","cities":"Service Area","blog":"Blog","es":"Espanol"}.get(section, section.title())
        section_url = BASE_URL + "/" + section + "/"
        items.append({"@type":"ListItem","position":2,"name":section_label,"item": section_url})
        items.append({"@type":"ListItem","position":3,"name": title.split("|")[0].strip(),"item": canonical_for(path)})
    payload = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement": items}
    return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'

def page_schema_for(pid):
    path, title, desc = META[pid]
    canon = canonical_for(path)
    if pid == "home":
        payload = {
            "@context":"https://schema.org","@type":"LimousineService","name":"Party Bus R Us",
            "url": BASE_URL + "/","logo": BASE_URL + "/logo/lockup-gold.png","image": BASE_URL + "/logo/lockup-gold.png",
            "description": desc,"telephone":"+1-703-991-3500","priceRange":"$$$",
            "address":{"@type":"PostalAddress","streetAddress":"1107 Treeside Lane","addressLocality":"Fairfax","addressRegion":"VA","postalCode":"22030","addressCountry":"US"},
            "areaServed":[{"@type":"City","name":n} for n in ["Washington","Arlington","Bethesda","Tysons","Alexandria","Leesburg","Silver Spring","Rockville","Fairfax","Annapolis"]],
            "openingHoursSpecification":{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"00:00","closes":"23:59"},
        }
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid.startswith("bus-"):
        payload = {"@context":"https://schema.org","@type":"Product","name": title.split("|")[0].strip(),"description": desc,"url": canon,"brand":{"@type":"Brand","name":"Party Bus R Us"},"category":"Limousine Service Vehicle"}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid.startswith("service-") or pid == "weddings":
        payload = {"@context":"https://schema.org","@type":"Service","name": title.split("|")[0].strip(),"description": desc,"url": canon,
                   "provider":{"@type":"LimousineService","name":"Party Bus R Us","url": BASE_URL + "/","telephone":"+1-703-991-3500"},
                   "areaServed":[{"@type":"City","name":n} for n in ["Washington","Arlington","Bethesda","Tysons","Alexandria","Leesburg","Silver Spring","Annapolis"]]}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid.startswith("city-"):
        city_name = "DMV"
        if "in " in title:
            city_name = title.split("in ")[1].split(" |")[0].strip()
        elif "at " in title:
            city_name = title.split("at ")[1].split(" |")[0].strip()
        payload = {"@context":"https://schema.org","@type":"Service","name": title.split("|")[0].strip(),"description": desc,"url": canon,
                   "provider":{"@type":"LimousineService","name":"Party Bus R Us","url": BASE_URL + "/","telephone":"+1-703-991-3500"},
                   "areaServed":{"@type":"Place","name": city_name}}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid == "blog-post":
        payload = {"@context":"https://schema.org","@type":"BlogPosting","headline": title.split("|")[0].strip(),"description": desc,"url": canon,
                   "author":{"@type":"Organization","name":"Party Bus R Us"},
                   "publisher":{"@type":"Organization","name":"Party Bus R Us","logo":{"@type":"ImageObject","url": BASE_URL + "/logo/lockup-gold.png"}},
                   "datePublished":"2026-04-15","dateModified":"2026-05-19"}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid == "blog":
        payload = {"@context":"https://schema.org","@type":"Blog","name":"The Journal - Party Bus R Us","url": canon,"description": desc}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid == "about":
        payload = {"@context":"https://schema.org","@type":"AboutPage","name":"About Party Bus R Us","url": canon,"description": desc}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid == "quote":
        payload = {"@context":"https://schema.org","@type":"ContactPage","name":"Get a Quote - Party Bus R Us","url": canon,"description": desc}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    if pid == "home-es":
        payload = {"@context":"https://schema.org","@type":"LimousineService","name":"Party Bus R Us","url": canon,"description": desc,"telephone":"+1-703-991-3500",
                   "areaServed":[{"@type":"City","name":n} for n in ["Washington","Arlington","Bethesda","Silver Spring","Alexandria"]]}
        return '<script type="application/ld+json">' + _json.dumps(payload, separators=(",",":"),ensure_ascii=False) + '</script>'
    return ""

def hreflang_links(pid):
    if pid in ("home", "home-es"):
        return ('<link rel="alternate" hreflang="en" href="' + BASE_URL + '/">\n'
                '<link rel="alternate" hreflang="es" href="' + BASE_URL + '/es/">\n'
                '<link rel="alternate" hreflang="x-default" href="' + BASE_URL + '/">')
    return ""

def wire_quote_form(body):
    body = re.sub(
        r'<form class="quote-form" onsubmit="[^"]*">',
        ('<form class="quote-form" name="quote-form" method="POST" action="/thank-you.html" data-netlify="true" netlify-honeypot="bot-field">\n'
         '          <input type="hidden" name="form-name" value="quote-form">\n'
         '          <p style="display:none"><label>Don\'t fill this out: <input name="bot-field"></label></p>'),
        body, count=1,
    )
    replacements = [
        ('<input type="text" placeholder="Jane Smith">', '<input type="text" name="name" placeholder="Jane Smith" required>'),
        ('<input type="tel" placeholder="(703) 555-0100">', '<input type="tel" name="phone" placeholder="(703) 555-0100" required>'),
        ('<input type="email" placeholder="you@email.com">', '<input type="email" name="email" placeholder="you@email.com" required>'),
        ('<input type="date">', '<input type="date" name="event_date" required>'),
        ('<select><option>4 hours (minimum)</option><option>5 hours</option><option>6 hours</option><option>7 hours</option><option>8 hours</option><option>9+ hours</option></select>',
         '<select name="hours" required><option>4 hours (minimum)</option><option>5 hours</option><option>6 hours</option><option>7 hours</option><option>8 hours</option><option>9+ hours</option></select>'),
        ('<select><option>10–14</option><option>15–20</option><option>21–25</option><option>26–30</option><option>31–35</option><option>36–40</option></select>',
         '<select name="headcount" required><option>10–14</option><option>15–20</option><option>21–25</option><option>26–30</option><option>31–35</option><option>36–40</option></select>'),
        ('<select><option>Wedding shuttle</option><option>Bachelorette party</option><option>Bachelor party</option><option>Prom</option><option>Winery / brewery tour</option><option>Birthday</option><option>Corporate</option><option>Monument tour</option><option>Other</option></select>',
         '<select name="event_type" required><option>Wedding shuttle</option><option>Bachelorette party</option><option>Bachelor party</option><option>Prom</option><option>Winery / brewery tour</option><option>Birthday</option><option>Corporate</option><option>Monument tour</option><option>Other</option></select>'),
        ('<input type="text" placeholder="Arlington, VA 22201">', '<input type="text" name="pickup_location" placeholder="Arlington, VA 22201" required>'),
        ('<textarea placeholder="Special stops, decor requests, venue details, accessibility needs..."></textarea>',
         '<textarea name="notes" placeholder="Special stops, decor requests, venue details, accessibility needs..."></textarea>'),
    ]
    for old, new in replacements:
        body = body.replace(old, new)
    return body

def build_page(pid, body):
    path, title, desc = META[pid]
    canon = canonical_for(path)
    is_es = (pid == "home-es")
    html_lang = "es" if is_es else "en"
    body = clean_content(body, pid)
    if pid == "home":
        body = remove_duplicate_testimonials_block(body)
    if pid == "quote":
        body = wire_quote_form(body)
    body = rewrite_links(body)
    # Convert relative image paths to absolute (so subdirectory pages work)
    body = re.sub(r"url\('(IMG_[^']+|PHOTO-[^']+|VIDEO-[^']+|logo/[^']+)'\)", r"url('/\1')", body)
    body = re.sub(r'src="(IMG_[^"]+|PHOTO-[^"]+|VIDEO-[^"]+|logo/[^"]+)"', r'src="/\1"', body)
    body = re.sub(r'^<div id="page-[a-z0-9\-]+"[^>]*>', '<main>', body, count=1)
    body = body.rstrip()
    if body.endswith("</div>"):
        body = body[:-len("</div>")] + "</main>"
    else:
        body += "\n</main>"
    og_image = BASE_URL + "/logo/lockup-gold.png"
    body_class = "page-" + pid
    head_extra_schemas = []
    bc = breadcrumb_schema_for(pid)
    if bc: head_extra_schemas.append(bc)
    ps = page_schema_for(pid)
    if ps: head_extra_schemas.append(ps)
    hreflang = hreflang_links(pid)
    locale = "es_US" if is_es else "en_US"
    return (
        f'<!DOCTYPE html>\n<html lang="{html_lang}">\n<head>\n'
        f'<meta charset="UTF-8">\n'
        f'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f'<title>{title}</title>\n'
        f'<meta name="description" content="{desc}">\n'
        f'<meta name="author" content="Party Bus R Us">\n'
        f'<link rel="canonical" href="{canon}">\n'
        f'{hreflang}\n'
        f'<meta property="og:type" content="website">\n'
        f'<meta property="og:title" content="{title}">\n'
        f'<meta property="og:description" content="{desc}">\n'
        f'<meta property="og:image" content="{og_image}">\n'
        f'<meta property="og:url" content="{canon}">\n'
        f'<meta property="og:site_name" content="Party Bus R Us">\n'
        f'<meta property="og:locale" content="{locale}">\n'
        f'<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{title}">\n'
        f'<meta name="twitter:description" content="{desc}">\n'
        f'<meta name="twitter:image" content="{og_image}">\n'
        f'<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n'
        f'<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">\n'
        f'<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
        + "\n".join(head_extra_schemas) + "\n"
        f'<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n'
        f'<style>\n{CSS}\n</style>\n</head>\n'
        f'<body class="{body_class}">\n'
        f'{HEADER_HTML}\n'
        f'{body}\n'
        f'{FOOTER_HTML}\n'
        f'{SHARED_SCRIPT}\n'
        f'</body>\n</html>\n'
    )

written = []
for pid in pages:
    if pid not in META:
        print(f"Skipping page {pid} (no META entry)")
        continue
    path = META[pid][0]
    out = OUT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(build_page(pid, pages[pid]), encoding="utf-8")
    written.append(out)
    print(f"  wrote {out.relative_to(ROOT)}")

print(f"Total pages from SPA: {len(written)}")

# ========== STANDALONE PAGES ==========
def render_standalone(title, desc, path, html_lang, body_html):
    canon = canonical_for(path)
    og_image = BASE_URL + "/logo/lockup-gold.png"
    return (
        f'<!DOCTYPE html>\n<html lang="{html_lang}">\n<head>\n'
        f'<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        f'<title>{title}</title>\n<meta name="description" content="{desc}">\n'
        f'<link rel="canonical" href="{canon}">\n'
        f'<meta property="og:type" content="website">\n<meta property="og:title" content="{title}">\n'
        f'<meta property="og:description" content="{desc}">\n<meta property="og:image" content="{og_image}">\n'
        f'<meta property="og:url" content="{canon}">\n<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{title}">\n<meta name="twitter:description" content="{desc}">\n'
        f'<meta name="twitter:image" content="{og_image}">\n'
        f'<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n'
        f'<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">\n'
        f'<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
        f'<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        f'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n'
        f'<style>{CSS}</style>\n</head>\n<body>\n'
        f'{HEADER_HTML}\n<main>\n{body_html}\n</main>\n{FOOTER_HTML}\n{SHARED_SCRIPT}\n</body>\n</html>\n'
    )

contact_body = '''<header class="page-hero" style="padding:140px 0 80px">
  <div class="page-hero-bg" style="background-image:url('/IMG_8577.JPG')"></div>
  <div class="container">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span>Contact</div>
    <h1>Contact <em>us.</em></h1>
    <p>The fastest way to a quote is the phone &mdash; we average a 45-second pickup. Prefer text or email? That works too.</p>
  </div>
</header>
<section class="s">
  <div class="container">
    <div class="quote-grid">
      <div>
        <h3>Reach us 24/7</h3>
        <p style="color:var(--mute)">Booking team available daily 8am-10pm. Dispatch on call 24/7 for active reservations.</p>
        <div class="contact-card"><div class="lbl">Phone &amp; text</div><div class="val"><a href="tel:+17039913500" style="color:var(--gold2)">(703) 991-3500</a></div></div>
        <div class="contact-card"><div class="lbl">Email</div><div class="val"><a href="mailto:info@partybusrus.com" style="color:var(--gold2)">info@partybusrus.com</a></div></div>
        <div class="contact-card"><div class="lbl">Office</div><div class="val">1107 Treeside Lane<br>Fairfax, VA 22030</div></div>
        <div class="contact-card"><div class="lbl">Service area</div><div class="val">DC &middot; Maryland &middot; Northern Virginia</div></div>
      </div>
      <aside>
        <h3>Ready to book?</h3>
        <p>Send a quote request and we'll reply within 60 minutes during business hours.</p>
        <a class="btn gold lg" href="/quote.html">Get a Quote <span class="arrow">&rarr;</span></a>
      </aside>
    </div>
  </div>
</section>
'''
(OUT / "contact.html").write_text(render_standalone(
    "Contact Party Bus R Us | DMV Limo Bus Bookings 24/7",
    "Call, text, or email Party Bus R Us. Booking team daily 8am-10pm, dispatch on call 24/7. DC, Maryland, and Northern Virginia.",
    "contact.html", "en", contact_body), encoding="utf-8")
written.append(OUT / "contact.html")

faq_body = '''<header class="page-hero" style="padding:140px 0 80px">
  <div class="page-hero-bg" style="background-image:url('/IMG_8127.JPG')"></div>
  <div class="container">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span>FAQ</div>
    <h1>Frequently asked <em>questions.</em></h1>
    <p>Everything you'd want to know before booking a party bus or limo bus in the DMV.</p>
  </div>
</header>
<section class="s">
  <div class="container" style="max-width:880px">
    <div class="faq">
      <details class="faq-item" open><summary>How far in advance should we book?<span class="plus">+</span></summary>
        <div class="ans">For weddings: 4-6 months ahead. For prom: book by February for May-June dates. For bachelorette / nightlife: 2-4 weeks. For NYE, Halloween, July 4: at least 60 days. Last-minute openings appear weekly &mdash; text us if your date is tight.</div>
      </details>
      <details class="faq-item"><summary>Is BYOB allowed?<span class="plus">+</span></summary>
        <div class="ans">Yes, in Virginia and Maryland &mdash; you're welcome to bring your own. By state law we cannot sell or serve alcohol on the bus. In DC proper, alcohol service requires an ABRA permit; we can advise on the process for events that need it. All passengers must be 21+ for alcohol on board.</div>
      </details>
      <details class="faq-item"><summary>What's included in the hourly rate?<span class="plus">+</span></summary>
        <div class="ans">Everything except your bar. Hourly rate includes: vehicle, professional chauffeur, 18% gratuity, fuel, basic decor (lighting, sound), pre-route planning, and 15 minutes pre-arrival. You're responsible only for: BYOB, food, custom decor, and any tolls outside the DMV.</div>
      </details>
      <details class="faq-item"><summary>What's the cancellation policy?<span class="plus">+</span></summary>
        <div class="ans">Full refund 30+ days before your event. 50% refund 14-30 days. Deposit forfeit inside 14 days. Weather or driver-cancelled bookings get full refunds or rescheduled at no charge.</div>
      </details>
      <details class="faq-item"><summary>Are your drivers experienced?<span class="plus">+</span></summary>
        <div class="ans">All drivers hold commercial CDLs with passenger endorsement and undergo background checks &amp; drug screening. Every vehicle is inspected weekly and deep-cleaned between every booking.</div>
      </details>
      <details class="faq-item"><summary>Do you serve outside the DMV?<span class="plus">+</span></summary>
        <div class="ans">Our home base is the DC / Maryland / Northern Virginia metro. We routinely run to Baltimore, Annapolis, Frederick, Fredericksburg, and the Eastern Shore. Beach trips (OCMD, Rehoboth) and weekend ski trips (Wisp, Snowshoe, Wintergreen) are available with advance booking.</div>
      </details>
    </div>
    <div style="text-align:center;margin-top:60px"><a class="btn gold lg" href="/quote.html">Get a Quote <span class="arrow">&rarr;</span></a></div>
  </div>
</section>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"How far in advance should we book?","acceptedAnswer":{"@type":"Answer","text":"For weddings: 4-6 months. Prom: book by February for May-June. Bachelorette / nightlife: 2-4 weeks. NYE, Halloween, July 4: at least 60 days."}},
{"@type":"Question","name":"Is BYOB allowed?","acceptedAnswer":{"@type":"Answer","text":"Yes, in Virginia and Maryland. DC alcohol service requires an ABRA permit. All passengers must be 21+ for alcohol on board."}},
{"@type":"Question","name":"What is included in the hourly rate?","acceptedAnswer":{"@type":"Answer","text":"Vehicle, chauffeur, 18% gratuity, fuel, basic decor, pre-route planning, and 15 minutes pre-arrival."}},
{"@type":"Question","name":"What is the cancellation policy?","acceptedAnswer":{"@type":"Answer","text":"Full refund 30+ days out. 50% refund 14-30 days. Deposit forfeit inside 14 days. Weather cancellations get full refunds or no-charge rescheduling."}}
]}
</script>
'''
(OUT / "faq.html").write_text(render_standalone(
    "FAQ | Party Bus R Us | DMV Limo Bus Questions Answered",
    "Booking lead time, BYOB rules, cancellation policy, hourly rate inclusions, driver licensing &mdash; everything DMV clients ask before reserving a party bus.",
    "faq.html", "en", faq_body), encoding="utf-8")
written.append(OUT / "faq.html")

gallery_body = '''<header class="page-hero" style="padding:140px 0 80px">
  <div class="page-hero-bg" style="background-image:url('/IMG_8576.JPG')"></div>
  <div class="container">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span>Gallery</div>
    <h1>Gallery &amp; <em>real nights.</em></h1>
    <p>Interiors lit up, weddings rolling, bachelorettes in motion. A look at what the fleet actually delivers.</p>
  </div>
</header>
<section class="s">
  <div class="container">
    <div class="gallery-grid">
      <div class="gi"><img src="/IMG_0157.JPG" alt="Signature 30 limo bus interior with color-shifting LED ceiling"></div>
      <div class="gi"><img src="/IMG_8127.JPG" alt="Midnight 26 party bus with deep blue LED preset"></div>
      <div class="gi"><img src="/IMG_0154.JPG" alt="Bridal 20 with diamond-quilted leather and wood floor"></div>
      <div class="gi"><img src="/IMG_8575.JPG" alt="Wedding shuttle pickup with full bridal party"></div>
      <div class="gi"><img src="/IMG_8576.JPG" alt="Luxury party bus exterior at sunset"></div>
      <div class="gi"><img src="/IMG_8577.JPG" alt="Group boarding a Party Bus R Us limo bus"></div>
      <div class="gi"><img src="/PHOTO-2026-05-18-20-17-02.jpg" alt="Royal purple LED interior with water-light ceiling"></div>
      <div class="gi"><img src="/PHOTO-2026-05-18-20-17-3.jpg" alt="Crimson red LED interior with captain chair"></div>
      <div class="gi"><img src="/PHOTO-2026-05-18-20-17-5.jpg" alt="Cool blue LED interior with captain chair"></div>
      <div class="gi"><img src="/PHOTO-2026-05-18-20-17-11.jpg" alt="Emerald green LED interior with wood table"></div>
      <div class="gi"><img src="/IMG_2366.jpeg" alt="Diamond 24 with star-ceiling fiber optic and mirrored bar"></div>
      <div class="gi"><img src="/IMG_3095.jpeg" alt="Cavalier 30 executive bus interior with two-tone grey leather"></div>
    </div>
    <div style="text-align:center;margin-top:60px"><a class="btn gold lg" href="/quote.html">Reserve Your Night <span class="arrow">&rarr;</span></a></div>
  </div>
</section>
'''
(OUT / "gallery.html").write_text(render_standalone(
    "Gallery | Party Bus R Us | DMV Limo Bus Interiors & Real Nights",
    "Photos of the Party Bus R Us fleet: LED ceilings, leather interiors, wedding shuttles, bachelorette nights, real DMV moments.",
    "gallery.html", "en", gallery_body), encoding="utf-8")
written.append(OUT / "gallery.html")

privacy_body = '''<header class="page-hero" style="padding:140px 0 60px">
  <div class="page-hero-bg" style="background-color:#14101c;background-image:url('/IMG_8127.JPG')"></div>
  <div class="container">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span>Privacy Policy</div>
    <h1>Privacy <em>policy.</em></h1>
    <p>How we collect and use the information you share with us when you request a quote or book a ride.</p>
  </div>
</header>
<section class="s">
  <div class="container" style="max-width:880px;color:var(--text)">
    <h3>What we collect</h3>
    <p>When you submit a quote request we collect the name, phone number, email, event date, headcount, event type, and pickup location you enter. When you call or text, we keep the conversation as part of your booking record.</p>
    <h3>How we use it</h3>
    <p>We use your information to send you a quote, schedule the ride, dispatch a driver, and follow up after the event. We do not sell or rent your information to third parties.</p>
    <h3>How we store it</h3>
    <p>Booking records are stored in our reservation system. Payment information is processed by our payment provider &mdash; we do not store full card numbers on our own systems.</p>
    <h3>Your choices</h3>
    <p>You can ask us to delete your booking record at any time by emailing <a href="mailto:info@partybusrus.com" style="color:var(--gold2)">info@partybusrus.com</a>. We may keep records required for tax purposes for the legally required period.</p>
    <h3>Cookies</h3>
    <p>This website may use basic analytics cookies in the future. We will update this policy and add a consent banner before any tracking goes live.</p>
    <p style="color:var(--mute);margin-top:40px">Last updated: 2026-05-19. Questions? Email <a href="mailto:info@partybusrus.com" style="color:var(--gold2)">info@partybusrus.com</a>.</p>
  </div>
</section>
'''
(OUT / "privacy.html").write_text(render_standalone(
    "Privacy Policy | Party Bus R Us",
    "How Party Bus R Us collects, uses, and stores information from quote requests and bookings. Your data, your choices.",
    "privacy.html", "en", privacy_body), encoding="utf-8")
written.append(OUT / "privacy.html")

terms_body = '''<header class="page-hero" style="padding:140px 0 60px">
  <div class="page-hero-bg" style="background-color:#14101c;background-image:url('/IMG_8127.JPG')"></div>
  <div class="container">
    <div class="breadcrumb"><a href="/">Home</a><span class="sep">/</span>Terms of Service</div>
    <h1>Terms of <em>service.</em></h1>
    <p>The rules that govern your booking with Party Bus R Us. Designed to be readable, not buried in legalese.</p>
  </div>
</header>
<section class="s">
  <div class="container" style="max-width:880px;color:var(--text)">
    <h3>Booking</h3>
    <p>A booking is confirmed when a refundable deposit is paid and a signed booking agreement is on file. The balance is due 14 days before your event.</p>
    <h3>Cancellation</h3>
    <p>Full refund 30+ days before your event. 50% refund 14-30 days out. Deposit forfeit inside 14 days. Weather or driver-cancelled bookings get full refunds or rescheduled at no charge.</p>
    <h3>Alcohol &amp; conduct</h3>
    <p>BYOB allowed in Maryland and Virginia (passengers 21+ only). DC alcohol service requires an ABRA permit. No smoking, no illegal substances, no standing while the vehicle is moving. Damage caused by passengers is charged against the deposit and any excess billed.</p>
    <h3>Driver authority</h3>
    <p>Drivers can end a booking early at their discretion for unsafe behavior, threats, or repeated violations. Refunds in such cases are at company discretion.</p>
    <h3>Liability</h3>
    <p>Party Bus R Us is not responsible for items left on the bus or for delays caused by traffic, weather, or events outside our control. Best efforts will always be made to accommodate.</p>
    <p style="color:var(--mute);margin-top:40px">Last updated: 2026-05-19. Questions? Email <a href="mailto:info@partybusrus.com" style="color:var(--gold2)">info@partybusrus.com</a>.</p>
  </div>
</section>
'''
(OUT / "terms.html").write_text(render_standalone(
    "Terms of Service | Party Bus R Us",
    "Booking terms, cancellation policy, BYOB rules, and conduct standards for every Party Bus R Us reservation.",
    "terms.html", "en", terms_body), encoding="utf-8")
written.append(OUT / "terms.html")

thank_body = '''<section class="s" style="padding:120px 0 100px">
  <div class="container" style="max-width:720px;text-align:center">
    <span class="kicker">- Quote received -</span>
    <h1 style="font-family:'Cormorant Garamond',serif;font-size:64px;color:#fff;margin:20px 0 24px">Thank you. <em>We're on it.</em></h1>
    <p style="color:var(--mute);font-size:18px;margin-bottom:40px">A team member will reply within 60 minutes during business hours (8am-10pm daily), or first thing in the morning for overnight submissions. Watch your email and phone &mdash; we may reach out with a quick clarifying question to make sure the quote is exact.</p>
    <div class="final-cta-actions" style="justify-content:center">
      <a class="btn gold lg" href="/">Back to home</a>
      <a class="btn ghost lg" href="tel:+17039913500">Call (703) 991-3500</a>
    </div>
    <p style="color:var(--dim);font-size:14px;margin-top:60px">If you don't hear from us within 4 hours, please call &mdash; sometimes spam filters get aggressive.</p>
  </div>
</section>
'''
(OUT / "thank-you.html").write_text(render_standalone(
    "Thank You | Party Bus R Us | We Reply Within 60 Minutes",
    "Thanks for your quote request. A team member will reply within 60 minutes during business hours. Watch your email and phone.",
    "thank-you.html", "en", thank_body), encoding="utf-8")
written.append(OUT / "thank-you.html")

not_found_body = '''<section class="s" style="padding:140px 0 120px">
  <div class="container" style="max-width:720px;text-align:center">
    <span class="kicker">- 404 -</span>
    <h1 style="font-family:'Cormorant Garamond',serif;font-size:72px;color:#fff;margin:20px 0 24px">This page took the <em>wrong exit.</em></h1>
    <p style="color:var(--mute);font-size:18px;margin-bottom:40px">The page you're looking for has moved or doesn't exist. Try the home page, or jump straight to a quote.</p>
    <div class="final-cta-actions" style="justify-content:center">
      <a class="btn gold lg" href="/">Back to home</a>
      <a class="btn ghost lg" href="/fleet.html">Browse the fleet</a>
      <a class="btn ghost lg" href="/quote.html">Get a Quote</a>
    </div>
  </div>
</section>
'''
(OUT / "404.html").write_text(render_standalone(
    "Page Not Found | Party Bus R Us",
    "This page took the wrong exit. Head back to the Party Bus R Us home page or jump to a quote.",
    "404.html", "en", not_found_body), encoding="utf-8")
written.append(OUT / "404.html")

# ========== SITEMAP, ROBOTS, REDIRECTS ==========
sitemap_urls = []
for pid, (path, _t, _d) in META.items():
    url = canonical_for(path)
    if pid == "home":
        priority = "1.0"
    elif pid in ("fleet","quote","about","blog","reviews","weddings","service-area"):
        priority = "0.8"
    else:
        priority = "0.7"
    sitemap_urls.append((url, TODAY, "weekly", priority))

for extra_path, prio in [
    ("contact.html", "0.7"),
    ("faq.html", "0.7"),
    ("gallery.html", "0.6"),
    ("privacy.html", "0.3"),
    ("terms.html", "0.3"),
]:
    sitemap_urls.append((canonical_for(extra_path), TODAY, "monthly", prio))

sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url, mod, freq, prio in sitemap_urls:
    sitemap_xml.append("  <url>")
    sitemap_xml.append(f"    <loc>{url}</loc>")
    sitemap_xml.append(f"    <lastmod>{mod}</lastmod>")
    sitemap_xml.append(f"    <changefreq>{freq}</changefreq>")
    sitemap_xml.append(f"    <priority>{prio}</priority>")
    sitemap_xml.append("  </url>")
sitemap_xml.append("</urlset>")
(OUT / "sitemap.xml").write_text("\n".join(sitemap_xml) + "\n", encoding="utf-8")

robots = (
    "User-agent: *\n"
    "Allow: /\n"
    "Disallow: /thank-you.html\n\n"
    f"Sitemap: {BASE_URL}/sitemap.xml\n"
)
(OUT / "robots.txt").write_text(robots, encoding="utf-8")

redirects_lines = []
for pid, (path, _t, _d) in META.items():
    if path == "index.html" or path.endswith("/index.html"):
        continue
    if not path.endswith(".html"):
        continue
    pretty = "/" + path[:-len(".html")] + "/"
    redirects_lines.append(f"{pretty}  /{path}  200")
redirects_lines.append("/* /404.html 404")
(OUT / "_redirects").write_text("\n".join(redirects_lines) + "\n", encoding="utf-8")

print(f"Wrote sitemap.xml ({len(sitemap_urls)} urls), robots.txt, _redirects")
print(f"Total HTML files written: {len(written)}")
