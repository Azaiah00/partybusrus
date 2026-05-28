#!/usr/bin/env python3
"""Generate 18 new city pages for the Party Bus R Us website and inject into Website-Mockup.html."""

CITIES = [
    # ===================== DC NEIGHBORHOODS =====================
    {
        "id": "capitol-hill",
        "name": "Capitol Hill",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_8577.JPG",
        "tagline": "From the Hill to the Hay-Adams to wherever the night takes you — we know every loading zone in your neighborhood.",
        "why_us": "Capitol Hill is one of our most-booked pickup zones for government affairs receptions, lobbying-firm holiday parties, and the rare congressional staff bachelorette. We know which back entrances at the Library of Congress can stage a bus, which Hill homes have driveways big enough for our coach, and which side streets to avoid during inauguration week.",
        "pickups": "Hotels: The Liaison Capitol Hill, Hilton Capitol Hill, Hyatt Regency Washington on Capitol Hill, Phoenix Park Hotel. Wedding &amp; event venues: Library of Congress, Sequoia, the rooftop at the Newseum Building. Residential: most of Hill East, Eastern Market, and the SE quadrant blocks east of the Capitol.",
        "events": "Inauguration-season transfers · Congressional staff bachelorettes · Lobbying-firm holiday parties at K Street venues · Library of Congress wedding shuttles · Nationals Park tailgates from Hill homes · DC monument tours starting from the Capitol grounds · Embassy receptions on Massachusetts Avenue.",
        "routes": [
            ("Capitol Hill → DC Monument Tour", "10 stops · 3 hrs"),
            ("Hill → K Street Holiday Party", "Corporate · 5 hrs"),
            ("Hill → Loudoun Wineries", "Full day · 7 hrs"),
            ("Hill → Nationals Park Tailgate", "Game day · 6 hrs"),
            ("Hill → Library of Congress Wedding", "Multi-stop · 6 hrs"),
            ("Hill → BWI Airport", "Group transfer · 4 hrs"),
        ],
    },
    {
        "id": "adams-morgan",
        "name": "Adams Morgan",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_8127.JPG",
        "tagline": "Bachelor party HQ. Bachelorette pickup zone. The neighborhood the DMV nightlife scene was built around.",
        "why_us": "Adams Morgan has been our highest-volume nightlife pickup zone for over a decade. We know which 18th Street side streets allow a 30-passenger bus, which bars hold reservations open for groups arriving by party bus, and how to time pickups around the 2am bar-close exodus.",
        "pickups": "Hotels: AKA White House, Hotel Madera, The Churchill Hotel, Adams Morgan brownstone Airbnbs. Bars &amp; venues: Songbyrd, Tom Tom, Local 16, Madam&#39;s Organ, Bourbon. Residential: most of Adams Morgan and Lanier Heights brownstones.",
        "events": "Bachelor &amp; bachelorette bar crawls · 21st-birthday parties · Howard University Greek formal pickups · Friday-night group hops to U Street · Saturday daytime brunches at Tail Up Goat and Tryst · DC Pride weekend transportation · NYE bar-hop loops.",
        "routes": [
            ("Adams Morgan → U Street Bar Crawl", "Multi-bar · 5 hrs"),
            ("Adams Morgan → Wharf", "Dinner + dancing · 6 hrs"),
            ("Adams Morgan → Capital One Arena", "Concert · 5 hrs"),
            ("Adams Morgan → 14th Street Loop", "Bar crawl · 4 hrs"),
            ("Adams Morgan → Anthem Concert", "Wharf venue · 5 hrs"),
            ("Adams Morgan → Reagan Airport", "Group · 3 hrs"),
        ],
    },
    {
        "id": "the-wharf",
        "name": "The Wharf",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_2366.jpeg",
        "tagline": "DC&#39;s newest entertainment district — concerts, rooftop receptions, summer evenings on the water.",
        "why_us": "The Wharf transformed Southwest DC into one of the city&#39;s top event districts almost overnight. We move groups in and out of the InterContinental, Pendry, Anthem, and the Wharf restaurants every weekend. We know the bus loading zones along Maine Avenue, the back entrance at Officina, and how to coordinate with Anthem dispatch during sold-out shows.",
        "pickups": "Hotels: InterContinental Washington DC – The Wharf, Pendry Washington DC – The Wharf, Hyatt House Wharf. Venues: The Anthem, Pearl Street Warehouse, Officina, Hank&#39;s Oyster Bar, Mi Vida rooftop, Wharf Boathouse. Pier 4 wedding setups.",
        "events": "Anthem concert drop-offs and pickups · Pendry rooftop weddings · Officina anniversary dinners · Summer waterfront bachelorette boat tours · DC Boat Show transportation · Fireworks-night New Year&#39;s Eve dockside parties.",
        "routes": [
            ("Wharf → Loudoun Wineries", "5 stops · 7 hrs"),
            ("Wharf → Anthem Concert", "Stand-by · 5 hrs"),
            ("Wharf → DC Monument Tour", "10 stops · 3 hrs"),
            ("Wharf Wedding Shuttle", "Hotel ↔ venue · 6 hrs"),
            ("Wharf → Reagan Airport", "Group transfer · 3 hrs"),
            ("Wharf → Bethany Beach", "Weekend · 2 days"),
        ],
    },
    {
        "id": "u-street",
        "name": "U Street Corridor",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_8127.JPG",
        "tagline": "DC&#39;s music corridor — 9:30 Club, Lincoln Theatre, Howard Theatre, and the brunch-then-bar-crawl pickup line.",
        "why_us": "U Street is the music venue cluster of DC. We&#39;re staged here weekly for concerts at the 9:30 Club, Lincoln Theatre, Howard Theatre, and the Black Cat. We know which 14th Street side streets work for bus parking, which restaurants let us idle in their loading bay, and how to time pickups around concert encores.",
        "pickups": "Hotels: The Line DC, Kimpton Banneker, The LINE&#39;s sister hotel The Brixton. Venues: 9:30 Club, Lincoln Theatre, Howard Theatre, Black Cat, Songbyrd, Service Bar, Eighteenth Street Lounge. Residential: U Street and Shaw rowhouses.",
        "events": "9:30 Club concert pickups · Lincoln Theatre wedding ceremonies · Howard Theatre after-parties · U Street Pride transportation · Bar crawls along the 14th &amp; U corridor · Brunch + nightlife combos for visiting bachelorettes · Howard University homecoming groups.",
        "routes": [
            ("U Street → 9:30 Club Concert", "Drop + return · 5 hrs"),
            ("U Street → Wharf Dinner", "Multi-stop · 5 hrs"),
            ("U Street → Loudoun Wineries", "Day trip · 7 hrs"),
            ("U Street → Adams Morgan Loop", "Bar crawl · 4 hrs"),
            ("U Street → Howard Theatre Event", "Multi-stop · 5 hrs"),
            ("U Street → Dulles Airport", "Group · 4 hrs"),
        ],
    },
    {
        "id": "navy-yard",
        "name": "Navy Yard",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_8577.JPG",
        "tagline": "Nationals Park tailgates. Audi Field game days. DC&#39;s sports + brewery corridor.",
        "why_us": "Navy Yard is DC&#39;s sports + brewery corridor. We&#39;re here for almost every Nationals home game, every DC United match, and the brewery tour groups visiting Bluejacket and the Wharf microbreweries. We know the F Street loading zone outside Nats Park, the bus access to Audi Field, and the Capitol Riverfront residential streets.",
        "pickups": "Hotels: Conrad Washington DC (close walk), Thompson Washington DC, Hampton Inn Navy Yard. Stadiums: Nationals Park, Audi Field. Venues: Bluejacket Brewery, The Salt Line, District Winery, Halftime Sports Bar.",
        "events": "Nationals home-game tailgates · DC United match-day shuttles · Bluejacket brewery birthday parties · Audi Field corporate suites · Yards Park summer events · District Winery wedding receptions · Navy Yard residential bachelorette pickups.",
        "routes": [
            ("Navy Yard → Nats Game Tailgate", "Game day · 7 hrs"),
            ("Navy Yard → Audi Field Match", "Stand-by · 5 hrs"),
            ("Navy Yard → Brewery Crawl", "Bluejacket + 2 more · 5 hrs"),
            ("Navy Yard → Northwest Stadium", "Commanders away · 8 hrs"),
            ("Navy Yard → Loudoun Wineries", "Full day · 7 hrs"),
            ("Navy Yard → Bethany Beach", "Weekend · 2 days"),
        ],
    },
    {
        "id": "dupont-circle",
        "name": "Dupont Circle",
        "state": "DC",
        "region": "Washington, DC",
        "image": "IMG_2366.jpeg",
        "tagline": "Embassy Row. Intimate weddings. The neighborhood where DC&#39;s power dinners actually happen.",
        "why_us": "Dupont Circle has the highest density of embassies, think tanks, and political nonprofits in the city. Our Dupont pickups are split: half are intimate wedding shuttles from the Tabard Inn or Mansion on O Street, the other half are diplomatic receptions on Massachusetts Avenue. We know which embassy gates allow buses and which require staging a block down.",
        "pickups": "Hotels: The Dupont Circle Hotel, The Tabard Inn, Kimpton Carlyle, Embassy Row Hotel, Hotel Madera. Wedding venues: Mansion on O Street, Dumbarton House, the Cosmos Club (member events). Residential: rowhouses along R Street, Kalorama, and the streets just north of the Circle.",
        "events": "Embassy receptions on Massachusetts Avenue · Mansion on O Street weddings · Cosmos Club private events · Tabard Inn elopements + small weddings · Intimate think-tank holiday parties · Dupont brownstone bachelorettes · Visiting-dignitary group transfers.",
        "routes": [
            ("Dupont → Embassy Row Event", "Multi-stop · 4 hrs"),
            ("Dupont → Mansion on O Wedding", "Shuttle · 6 hrs"),
            ("Dupont → Loudoun Wineries", "Day trip · 7 hrs"),
            ("Dupont → Wharf Dinner", "Multi-stop · 5 hrs"),
            ("Dupont → Capital One Arena", "Show or game · 5 hrs"),
            ("Dupont → Reagan Airport", "Group · 3 hrs"),
        ],
    },
    # ===================== NORTHERN VIRGINIA =====================
    {
        "id": "alexandria",
        "name": "Alexandria",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_8575.JPG",
        "tagline": "Old Town wedding heaven. Waterfront ceremonies. Cobblestone King Street and the rest of the DMV in 20 minutes.",
        "why_us": "Old Town Alexandria is one of the DMV&#39;s most-photographed wedding destinations and one of our top-three pickup zones. We know every cobblestone block on King Street, every Potomac waterfront loading area, and which Old Town hotels have the right turnaround radius for a 40-passenger coach.",
        "pickups": "Hotels: The Westin Alexandria Old Town, Hilton Alexandria Old Town, The Embassy Suites Alexandria Old Town, Hotel Indigo Old Town, The Morrison House. Wedding venues: River Farm, Lorien Hotel &amp; Spa, Carlyle House Historic Park, The Atrium at Meadowlark, The Alexandrian.",
        "events": "Old Town waterfront weddings · River Farm garden ceremonies · Alexandria proms · George Washington birthday parade · Del Ray Farmers Market events · Mount Vernon Estate weddings · Old Town King Street pub crawls · Lorien Hotel rooftop receptions.",
        "routes": [
            ("Old Town → DC Monument Tour", "10 stops · 3 hrs"),
            ("Alexandria → Loudoun Wineries", "5 stops · 7 hrs"),
            ("Alexandria → Wharf Dinner", "Multi-stop · 5 hrs"),
            ("Alexandria → Mount Vernon Wedding", "Shuttle · 6 hrs"),
            ("Alexandria → Reagan Airport", "Group · 3 hrs"),
            ("Alexandria → Bethany Beach", "Weekend · 2 days"),
        ],
    },
    {
        "id": "fairfax",
        "name": "Fairfax",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_3095.jpeg",
        "tagline": "George Mason events. Fair Lakes corporate. Fairfax Town Center weekends.",
        "why_us": "Fairfax is one of the largest population centers in Northern Virginia, anchored by George Mason University and the corporate park along Fair Lakes Boulevard. We&#39;re booked regularly for GMU formals, EagleBank Arena concerts, and the Fair Lakes office holiday-party season.",
        "pickups": "Hotels: Marriott Fairfax at Fair Oaks, Hyatt Fair Lakes, Holiday Inn Fairfax, Comfort Inn Fairfax. Venues: EagleBank Arena (George Mason), Fairfax Town Center, Fair Lakes corporate offices, Old Town Fairfax courthouse historic district.",
        "events": "George Mason University Greek formals · EagleBank Arena concert transportation · Fair Lakes corporate holiday parties · Fairfax Country Day Schools prom · Old Town Fairfax weddings · Fairfax County government events · Workhouse Arts Center weddings (Lorton).",
        "routes": [
            ("Fairfax → EagleBank Arena Concert", "Drop + return · 5 hrs"),
            ("Fairfax → DC Wedding Venue", "Multi-stop · 7 hrs"),
            ("Fairfax → Loudoun Wineries", "5 stops · 7 hrs"),
            ("Fairfax → Wolf Trap Concert", "Summer series · 6 hrs"),
            ("Fairfax → Dulles Airport", "Group · 4 hrs"),
            ("Fairfax → Wharf Dinner", "Round trip · 5 hrs"),
        ],
    },
    {
        "id": "vienna",
        "name": "Vienna",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_8127.JPG",
        "tagline": "Our home base. Wolf Trap concerts. Vienna proms and the Tysons corridor on our doorstep.",
        "why_us": "Vienna is where we&#39;re headquartered. We know every Vienna Town Center loading zone, every Wolf Trap parking lot, and every Madison High School prom photo location. Our home-base bookings here are heavy on Wolf Trap concert nights and Vienna-Oakton prom weekends.",
        "pickups": "Hotels: Sheraton Tysons Hotel (Vienna), Holiday Inn Vienna, The Wolf Trap Hotel (event-week packages). Venues: Wolf Trap Filene Center, Wolf Trap Barns, Vienna Town Center, James Madison High School (prom pickup), Oakton High School.",
        "events": "Wolf Trap summer concert series transportation · Madison &amp; Oakton High School proms · Vienna Town Center wedding shuttles · The Vienna Inn anniversary parties · Tysons corporate transfers · Cherry blossom-season DC trips from Vienna.",
        "routes": [
            ("Vienna → Wolf Trap Concert", "Drop + return · 6 hrs"),
            ("Vienna → DC Monument Tour", "10 stops · 3 hrs"),
            ("Vienna → Loudoun Wineries", "5 stops · 7 hrs"),
            ("Vienna → Dulles Airport", "Group · 3 hrs"),
            ("Vienna → Tysons Mall Event", "Multi-stop · 4 hrs"),
            ("Madison HS Prom Package", "5-hour all-in"),
        ],
    },
    {
        "id": "falls-church",
        "name": "Falls Church",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_8575.JPG",
        "tagline": "Smaller weddings, family events, and one of the DMV&#39;s best-kept neighborhood event circuits.",
        "why_us": "Falls Church operates at a different scale than its Tysons and Arlington neighbors — smaller weddings, tighter family events, more intimate corporate gatherings. We&#39;re booked here weekly for State Theatre concerts, Eden Center cultural events, and George Mason High School prom.",
        "pickups": "Hotels: Falls Church Marriott Fairview Park, Hyatt House Falls Church, Hilton Garden Inn Falls Church. Venues: The State Theatre, Eden Center, Cherry Hill Park, George Mason High School (now Meridian High), Falls Church Episcopal.",
        "events": "State Theatre concert nights · Eden Center Lunar New Year parties · Meridian High prom shuttles · Falls Church Episcopal weddings · Small family reunions at Cherry Hill Park · Inova Fairfax Hospital fundraiser dinners.",
        "routes": [
            ("Falls Church → State Theatre Concert", "Drop + return · 5 hrs"),
            ("Falls Church → Loudoun Wineries", "Day trip · 7 hrs"),
            ("Falls Church → DC Wedding Venue", "Shuttle · 6 hrs"),
            ("Falls Church → Wolf Trap", "Summer concert · 6 hrs"),
            ("Falls Church → Reagan Airport", "Group · 3 hrs"),
            ("Falls Church → Capital One Arena", "Show or game · 5 hrs"),
        ],
    },
    {
        "id": "reston",
        "name": "Reston",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_3095.jpeg",
        "tagline": "The tech corridor. Holiday parties at Reston Town Center. Dulles in 15 minutes.",
        "why_us": "Reston is one of the highest-density corporate corridors in Northern Virginia — Microsoft, Amazon Web Services, Google, and dozens of federal contractors all have offices here. We move corporate holiday parties, summer team outings, and visiting-executive groups through Reston Town Center every week.",
        "pickups": "Hotels: Hyatt Regency Reston, Sheraton Reston, Hilton Garden Inn Reston, Comfort Inn Reston. Venues: Reston Town Center pavilion and restaurants, Lake Anne Plaza, Reston Community Center, Hidden Creek Country Club.",
        "events": "Corporate holiday parties at Reston Town Center venues · Tech-firm summer team outings to Loudoun wineries · Reston Town Center wedding receptions · Hidden Creek Country Club golf-outing transportation · Reston Association event shuttles.",
        "routes": [
            ("Reston → Loudoun Wineries", "5 stops · 7 hrs"),
            ("Reston → Reston Town Center Holiday Party", "Corporate · 5 hrs"),
            ("Reston → Dulles Airport", "Group · 3 hrs"),
            ("Reston → DC Corporate Event", "Multi-stop · 6 hrs"),
            ("Reston → Wolf Trap", "Concert · 6 hrs"),
            ("Reston → Wisp Resort Ski", "Weekend · 3 days"),
        ],
    },
    {
        "id": "ashburn",
        "name": "Ashburn",
        "state": "VA",
        "region": "Northern Virginia",
        "image": "IMG_8577.JPG",
        "tagline": "Loudoun&#39;s tech heart. One Loudoun events. The gateway to wine country.",
        "why_us": "Ashburn is the fastest-growing part of Loudoun County and the gateway to DC&#39;s Wine Country. Most of our Ashburn bookings are split between One Loudoun corporate events, AAU sports team transportation, and Loudoun winery day trips that start with an Ashburn pickup.",
        "pickups": "Hotels: Holiday Inn Ashburn, Hilton Garden Inn Ashburn, Hyatt House Sterling/Dulles. Venues: One Loudoun shopping &amp; dining district, National Conference Center (Lansdowne), Lansdowne Resort, Loudoun United FC games, Top Golf Loudoun.",
        "events": "Loudoun winery day trips · One Loudoun corporate parties · National Conference Center conferences · Top Golf bachelorettes · Loudoun United matches · Lansdowne wedding shuttles · AAU sports team tournaments.",
        "routes": [
            ("Ashburn → Loudoun Winery Tour", "5 stops · 7 hrs"),
            ("Ashburn → Lansdowne Wedding", "Shuttle · 6 hrs"),
            ("Ashburn → Dulles Airport", "Group · 2 hrs"),
            ("Ashburn → DC Monument Tour", "Day trip · 8 hrs"),
            ("Ashburn → Top Golf Party", "Multi-stop · 5 hrs"),
            ("Ashburn → Wisp Resort", "Weekend · 3 days"),
        ],
    },
    # ===================== MARYLAND =====================
    {
        "id": "silver-spring",
        "name": "Silver Spring",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_5053.JPG",
        "tagline": "The Fillmore. AFI Silver. Downtown Silver Spring&#39;s nightlife circuit, two minutes from DC.",
        "why_us": "Silver Spring has become Montgomery County&#39;s nightlife and entertainment core. We&#39;re here for almost every Fillmore concert, AFI Silver film festival evening, and the Veterans Plaza events that fill summer weekends. We know which Fenton Street side streets allow a bus to stage and which loading zone the Fillmore prefers.",
        "pickups": "Hotels: AC Hotel by Marriott Silver Spring, Hilton Silver Spring, Crowne Plaza Silver Spring. Venues: The Fillmore Silver Spring, AFI Silver Theatre, Veterans Plaza, Wisp at Round House Theatre, Society of Workman&#39;s Compensation Hall.",
        "events": "Fillmore concert nights · AFI Silver film-festival receptions · Veterans Plaza summer events · Wedding ceremonies at the Round House · Bar mitzvah after-parties from Bethesda CC venues · Howard University area family event shuttles.",
        "routes": [
            ("Silver Spring → Fillmore Concert", "Drop + return · 5 hrs"),
            ("Silver Spring → DC Monument Tour", "Day trip · 8 hrs"),
            ("Silver Spring → Loudoun Wineries", "5 stops · 8 hrs"),
            ("Silver Spring → BWI Airport", "Group · 3 hrs"),
            ("Silver Spring → Nats Game", "Tailgate + game · 7 hrs"),
            ("Silver Spring → National Harbor", "Casino night · 6 hrs"),
        ],
    },
    {
        "id": "rockville",
        "name": "Rockville",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_8576.JPG",
        "tagline": "Suburban weddings, country club events, and Montgomery County&#39;s heart of Maryland nightlife.",
        "why_us": "Rockville sits at the center of Montgomery County&#39;s suburban event circuit — country clubs, Rockville Town Center events, and the Fitzgerald Theatre. Our Rockville bookings skew toward higher-end family events: bar &amp; bat mitzvahs, country club anniversaries, and Walt Whitman High prom.",
        "pickups": "Hotels: Hilton Rockville Hotel &amp; Executive Meeting Center, Cambria Hotel Rockville, Holiday Inn Rockville. Venues: Rockville Town Center pavilion, F. Scott Fitzgerald Theatre, Manor Country Club, Norbeck Country Club, Lakewood Country Club.",
        "events": "Country club bar &amp; bat mitzvah after-parties · Walt Whitman / Wootton / Churchill prom shuttles · Manor Country Club wedding receptions · Rockville Town Center summer events · MoCo political fundraisers · Strathmore Mansion weddings (in Bethesda nearby).",
        "routes": [
            ("Rockville → Bar Mitzvah Shuttle", "Venue ↔ after-party · 5 hrs"),
            ("Rockville → DC Wedding Venue", "Multi-stop · 7 hrs"),
            ("Rockville → Loudoun Wineries", "5 stops · 8 hrs"),
            ("Rockville → BWI Airport", "Group · 3 hrs"),
            ("Walt Whitman HS Prom", "5-hour all-in"),
            ("Rockville → Wisp Resort Ski", "Weekend · 3 days"),
        ],
    },
    {
        "id": "potomac",
        "name": "Potomac",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_2366.jpeg",
        "tagline": "Country clubs. Estate weddings. Montgomery County&#39;s most-photographed neighborhoods.",
        "why_us": "Potomac has the highest concentration of country clubs and estate-style wedding venues in Montgomery County. We&#39;re booked here for Congressional Country Club golf-tournament transfers, TPC Potomac wedding receptions, and the bar/bat mitzvah after-party shuttle that&#39;s become the standard for Potomac family events.",
        "pickups": "Residential pickups throughout Potomac estates and gated neighborhoods. Venues: Congressional Country Club, TPC Potomac at Avenel Farm, Bretton Woods Recreation Center, Manor Country Club (Rockville border), Glen Echo Park (just across the river).",
        "events": "Congressional Country Club golf tournament receptions · TPC Potomac wedding shuttles · Potomac residential bar/bat mitzvah after-parties · Charles E. Smith Jewish Day School prom · Potomac private school graduation parties · Glen Echo Park weddings.",
        "routes": [
            ("Potomac → Country Club Wedding", "Shuttle · 7 hrs"),
            ("Potomac → DC Reception Venue", "Multi-stop · 6 hrs"),
            ("Potomac → Loudoun Wineries", "5 stops · 8 hrs"),
            ("Potomac → BWI Airport", "Group · 3 hrs"),
            ("Potomac → Glen Echo Wedding", "Shuttle · 5 hrs"),
            ("Potomac → Wisp Resort", "Weekend · 3 days"),
        ],
    },
    {
        "id": "national-harbor",
        "name": "National Harbor",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_8577.JPG",
        "tagline": "Gaylord conventions. MGM casino nights. The DMV&#39;s biggest event compound, all in one mile.",
        "why_us": "National Harbor is purpose-built for events — conventions at the Gaylord, casino nights at MGM, weddings on the Capital Wheel, and the Tanger Outlets nearby. We&#39;re here every weekend for a mix of corporate conferences and Saturday-night MGM bachelorettes.",
        "pickups": "Hotels: Gaylord National Resort &amp; Convention Center, MGM National Harbor, Marriott Gaylord, AC Hotel National Harbor, Residence Inn National Harbor. Venues: Gaylord ballrooms, MGM casino floor &amp; theater, Capital Wheel, the Awakening sculpture lawn.",
        "events": "Gaylord convention shuttles · MGM casino bachelorette parties · MGM Grand Theater concert pickups · Capital Wheel proposal shuttles · National Harbor wedding receptions · Tanger Outlets group shopping days · Fireworks-night NYE.",
        "routes": [
            ("National Harbor → MGM Casino Night", "Drop + return · 6 hrs"),
            ("National Harbor → DC Monument Tour", "Day trip · 6 hrs"),
            ("National Harbor → Loudoun Wineries", "Day trip · 8 hrs"),
            ("National Harbor → BWI Airport", "Group · 3 hrs"),
            ("National Harbor → Annapolis", "Day trip · 6 hrs"),
            ("National Harbor → Atlantic City", "Casino weekend · 2 days"),
        ],
    },
    {
        "id": "annapolis",
        "name": "Annapolis",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_8573.JPG",
        "tagline": "Waterfront weddings. Naval Academy events. The DMV&#39;s sailing capital, an hour from DC.",
        "why_us": "Annapolis is the DMV&#39;s waterfront wedding capital and home to the U.S. Naval Academy. Our Annapolis bookings are heavy on USNA-affiliated events, Eastport Yacht Club wedding shuttles, and the Saturday boat-day-into-dinner-into-bar-crawl loops that have made Annapolis a top bachelorette destination.",
        "pickups": "Hotels: The Westin Annapolis, Loews Annapolis Hotel, Annapolis Waterfront Hotel, Hilton Garden Inn Annapolis. Venues: U.S. Naval Academy chapel, Eastport Yacht Club, Annapolis Maritime Museum, Sail Inn, the Capital City Brewing Company waterfront.",
        "events": "Naval Academy weddings &amp; graduation transportation · Eastport Yacht Club receptions · Annapolis Maritime Museum weddings · Bachelorette boat-day-to-bar-night loops · Hammond-Harwood House intimate weddings · Annapolis sailing-week visitor shuttles.",
        "routes": [
            ("Annapolis → DC Monument Tour", "Day trip · 8 hrs"),
            ("Annapolis → Waterfront Wedding Shuttle", "Multi-stop · 7 hrs"),
            ("Annapolis → Eastern Shore Beaches", "Weekend · 2 days"),
            ("Annapolis → Baltimore Inner Harbor", "Day · 6 hrs"),
            ("Annapolis → BWI Airport", "Group · 2 hrs"),
            ("Annapolis Bachelorette Boat Day", "8 hrs all-in"),
        ],
    },
    {
        "id": "frederick",
        "name": "Frederick",
        "state": "MD",
        "region": "Maryland",
        "image": "IMG_5053.JPG",
        "tagline": "Country wedding venues, downtown Frederick nightlife, and the gateway to mountain Maryland.",
        "why_us": "Frederick is the DMV&#39;s gateway to mountain Maryland — country wedding venues, mountain ski trips to Wisp, and a downtown that&#39;s become its own nightlife corridor. Our Frederick bookings are split between country-venue wedding shuttles, downtown Frederick bar crawls, and ski weekends to Wisp Resort.",
        "pickups": "Hotels: Hilton Garden Inn Frederick, Hampton Inn Frederick, Holiday Inn Frederick. Venues: Walkersville Mansion, Stone Manor Country Club, Bell Tower Plaza, the historic Frederick courthouse district, Weinberg Center for the Arts, Sugarloaf Mountain Vineyard.",
        "events": "Country wedding venue shuttles (Stone Manor, Walkersville Mansion) · Downtown Frederick bar crawls · Wisp Resort ski weekend transportation · Weinberg Center concert pickups · Sugarloaf Mountain hiking trips · Frederick County fairgrounds events.",
        "routes": [
            ("Frederick → Country Wedding Venue", "Shuttle · 7 hrs"),
            ("Frederick → Downtown Bar Crawl", "Multi-stop · 5 hrs"),
            ("Frederick → Wisp Resort Ski", "Weekend · 3 days"),
            ("Frederick → DC Monument Tour", "Day trip · 9 hrs"),
            ("Frederick → BWI Airport", "Group · 3 hrs"),
            ("Frederick → Loudoun Wineries", "Day trip · 7 hrs"),
        ],
    },
]


PAGE_TEMPLATE = '''<!-- ============================ {NAME_UPPER} ============================ -->
<div id="page-city-{ID}" class="page">
  <header class="page-hero" style="padding:140px 0 80px">
    <div class="page-hero-bg" style="background-color:#0a0a14;background-image:url('{IMAGE}')"></div>
    <div class="container">
      <div class="breadcrumb"><a data-page="home">Home</a><span class="sep">/</span><a data-page="service-area">Service Area</a><span class="sep">/</span>{NAME}, {STATE}</div>
      <h1>Party bus rental in <em>{NAME}.</em></h1>
      <p>{TAGLINE}</p>
    </div>
  </header>

  <section class="s">
    <div class="container">
      <div class="city-grid">
        <div class="city-content">
          <h3>Why {NAME} groups book us.</h3>
          <p>{WHY_US}</p>

          <h3>Most-booked {NAME} pickups.</h3>
          <p>{PICKUPS}</p>

          <h3>Popular events from {NAME}.</h3>
          <p>{EVENTS}</p>
        </div>

        <div class="routes">
          <h3>Popular routes from {NAME}.</h3>
{ROUTES_HTML}
        </div>
      </div>

      <div style="margin-top:60px;text-align:center;padding:50px 32px;background:var(--bg2);border:1px solid var(--gold)">
        <h3 class="serif" style="font-size:30px;color:#fff;margin-bottom:14px;font-weight:500">Planning an event in {NAME}?</h3>
        <p style="color:#bdbdb5;font-size:16px;max-width:560px;margin:0 auto 26px">Tell us your group size, date, and where you&#39;re headed. We&#39;ll send a custom quote within 60 minutes.</p>
        <a class="btn gold lg" data-page="quote">Get Your {NAME} Quote <span class="arrow">→</span></a>
      </div>
    </div>
  </section>
</div>

'''


def route_html(routes):
    parts = []
    for to, meta in routes:
        parts.append(
            f'          <div class="route"><div><div class="to">{to}</div><span style="color:var(--mute);font-size:12.5px">{meta}</span></div><div class="meta" style="color:var(--gold2)">Quote →</div></div>'
        )
    return "\n".join(parts)


def render_city(city):
    return PAGE_TEMPLATE.format(
        NAME_UPPER=city["name"].upper(),
        ID=city["id"],
        NAME=city["name"],
        STATE=city["state"],
        IMAGE=city["image"],
        TAGLINE=city["tagline"],
        WHY_US=city["why_us"],
        PICKUPS=city["pickups"],
        EVENTS=city["events"],
        ROUTES_HTML=route_html(city["routes"]),
    )


def main():
    with open("Website-Mockup.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Generate all new city pages
    new_pages = "\n".join(render_city(c) for c in CITIES)

    # Inject before </main>
    marker = "</main>"
    idx = html.rfind(marker)
    if idx == -1:
        print("ERROR: </main> not found")
        return
    html = html[:idx] + new_pages + "\n" + html[idx:]

    # Update Service Area master page: add data-page attributes to <li> entries
    li_updates = {
        # DC
        '<li>Capitol Hill<small>SE</small></li>': '<li data-page="city-capitol-hill">Capitol Hill<small>SE</small></li>',
        '<li>Adams Morgan<small>NW</small></li>': '<li data-page="city-adams-morgan">Adams Morgan<small>NW</small></li>',
        '<li>Dupont Circle<small>NW</small></li>': '<li data-page="city-dupont-circle">Dupont Circle<small>NW</small></li>',
        '<li>U Street Corridor<small>NW</small></li>': '<li data-page="city-u-street">U Street Corridor<small>NW</small></li>',
        '<li>Navy Yard<small>SE</small></li>': '<li data-page="city-navy-yard">Navy Yard<small>SE</small></li>',
        '<li>The Wharf<small>SW</small></li>': '<li data-page="city-the-wharf">The Wharf<small>SW</small></li>',
        # NoVA
        '<li>Alexandria<small>Old Town</small></li>': '<li data-page="city-alexandria">Alexandria<small>Old Town</small></li>',
        '<li>Vienna<small>22180</small></li>': '<li data-page="city-vienna">Vienna<small>22180</small></li>',
        '<li>Falls Church<small>22041</small></li>': '<li data-page="city-falls-church">Falls Church<small>22041</small></li>',
        '<li>Fairfax<small>22030</small></li>': '<li data-page="city-fairfax">Fairfax<small>22030</small></li>',
        '<li>Reston<small>20190</small></li>': '<li data-page="city-reston">Reston<small>20190</small></li>',
        '<li>Ashburn<small>20147</small></li>': '<li data-page="city-ashburn">Ashburn<small>20147</small></li>',
        # MD
        '<li>Silver Spring<small>20910</small></li>': '<li data-page="city-silver-spring">Silver Spring<small>20910</small></li>',
        '<li>Rockville<small>20850</small></li>': '<li data-page="city-rockville">Rockville<small>20850</small></li>',
        '<li>Potomac<small>20854</small></li>': '<li data-page="city-potomac">Potomac<small>20854</small></li>',
        '<li>National Harbor<small>Prince George\'s</small></li>': '<li data-page="city-national-harbor">National Harbor<small>Prince George\'s</small></li>',
        '<li>Frederick<small>21701</small></li>': '<li data-page="city-frederick">Frederick<small>21701</small></li>',
        '<li>Annapolis<small>21401</small></li>': '<li data-page="city-annapolis">Annapolis<small>21401</small></li>',
    }

    n_updated = 0
    for old, new in li_updates.items():
        if old in html:
            html = html.replace(old, new, 1)  # only first occurrence (service area master)
            # Also replace in the secondary Service Area widget on home page (same string)
            if old in html:
                html = html.replace(old, new, 1)
            n_updated += 1

    print(f"✓ Generated {len(CITIES)} city pages, {len(new_pages)} chars")
    print(f"✓ Updated {n_updated} Service Area <li> entries to be clickable")

    with open("Website-Mockup.html", "w", encoding="utf-8") as f:
        f.write(html)

    # Also sync to site/
    import shutil
    shutil.copy("Website-Mockup.html", "site/index.html")
    print("✓ Synced to site/index.html")

    import os
    print(f"\nFinal size: {os.path.getsize('Website-Mockup.html')/1024:.0f} KB")


if __name__ == "__main__":
    main()
