/**
 * Public founder-writing source registry.
 *
 * The ingestion runner turns these into generic scrapers. Bespoke scrapers
 * still win for sources that need custom parsing, but every founder here has
 * enough metadata for panel selection once their public writing is embedded.
 */

export type FounderSourceKind = "blog" | "essays" | "newsletter" | "archive";

export interface FounderSource {
  slug: string;
  name: string;
  company: string;
  era: string;
  sourceUrl: string;
  sourceKind: FounderSourceKind;
  feedUrl?: string;
  sitemapUrl?: string;
  tier?: "A" | "B";
}

export const FOUNDER_SOURCES = [
  { slug: "paul-graham", name: "Paul Graham", company: "Y Combinator", era: "Y Combinator, 2005-present", sourceUrl: "https://paulgraham.com/articles.html", sourceKind: "essays", tier: "A" },
  { slug: "naval", name: "Naval Ravikant", company: "AngelList", era: "AngelList, 2010-present", sourceUrl: "https://nav.al", sourceKind: "blog", tier: "A" },
  { slug: "jason-fried", name: "Jason Fried", company: "37signals / Basecamp", era: "37signals / Basecamp, 1999-present", sourceUrl: "https://world.hey.com/jason", sourceKind: "blog", tier: "A" },
  { slug: "fred-wilson", name: "Fred Wilson", company: "Union Square Ventures", era: "USV / AVC.com, 2003-present", sourceUrl: "https://avc.com", sourceKind: "blog", tier: "B" },
  { slug: "sahil-lavingia", name: "Sahil Lavingia", company: "Gumroad", era: "Gumroad, 2011-present", sourceUrl: "https://sahillavingia.com", sourceKind: "blog", tier: "B" },
  { slug: "patrick-collison", name: "Patrick Collison", company: "Stripe", era: "Stripe, 2010-present", sourceUrl: "https://patrickcollison.com", sourceKind: "essays", tier: "B" },
  { slug: "sam-altman", name: "Sam Altman", company: "OpenAI / Y Combinator", era: "YC -> OpenAI, 2011-present", sourceUrl: "https://blog.samaltman.com", sourceKind: "blog", tier: "B" },
  { slug: "garry-tan", name: "Garry Tan", company: "Y Combinator / Initialized", era: "Initialized -> YC, 2011-present", sourceUrl: "https://blog.garrytan.com", sourceKind: "blog", tier: "B" },
  { slug: "david-heinemeier-hansson", name: "David Heinemeier Hansson", company: "37signals / Rails", era: "37signals / Rails, 2003-present", sourceUrl: "https://world.hey.com/dhh", sourceKind: "blog", tier: "A" },
  { slug: "brian-chesky", name: "Brian Chesky", company: "Airbnb", era: "Airbnb, 2008-present", sourceUrl: "https://medium.com/@bchesky", sourceKind: "blog", tier: "B" },
  { slug: "tobi-lutke", name: "Tobi Lutke", company: "Shopify", era: "Shopify, 2004-present", sourceUrl: "https://tobi.lutke.com", sourceKind: "blog", tier: "B" },
  { slug: "eugene-wei", name: "Eugene Wei", company: "Remains of the Day", era: "Remains of the Day, 2002-present", sourceUrl: "https://www.eugenewei.com", sourceKind: "essays", tier: "A" },
  { slug: "steve-blank", name: "Steve Blank", company: "E.piphany / Lean LaunchPad", era: "E.piphany -> Lean Startup, 1996-present", sourceUrl: "https://steveblank.com", sourceKind: "blog", tier: "B" },
  { slug: "eric-ries", name: "Eric Ries", company: "IMVU / Lean Startup", era: "IMVU -> Lean Startup, 2004-present", sourceUrl: "https://www.startuplessonslearned.com", sourceKind: "blog", tier: "B" },
  { slug: "mark-suster", name: "Mark Suster", company: "Koral / Upfront Ventures", era: "Koral -> Upfront, 1999-present", sourceUrl: "https://bothsidesofthetable.com", sourceKind: "blog", tier: "B" },
  { slug: "dharmesh-shah", name: "Dharmesh Shah", company: "HubSpot", era: "HubSpot, 2006-present", sourceUrl: "https://www.onstartups.com", sourceKind: "blog", tier: "B" },
  { slug: "hiten-shah", name: "Hiten Shah", company: "KISSmetrics / Nira", era: "KISSmetrics -> Nira, 2008-present", sourceUrl: "https://hitenism.com", sourceKind: "blog", tier: "B" },
  { slug: "neil-patel", name: "Neil Patel", company: "Crazy Egg / NP Digital", era: "Crazy Egg -> NP Digital, 2005-present", sourceUrl: "https://neilpatel.com/blog", sourceKind: "blog", tier: "B" },
  { slug: "joel-spolsky", name: "Joel Spolsky", company: "Fog Creek / Stack Overflow", era: "Fog Creek -> Stack Overflow, 2000-present", sourceUrl: "https://www.joelonsoftware.com", sourceKind: "essays", tier: "B" },
  { slug: "derek-sivers", name: "Derek Sivers", company: "CD Baby", era: "CD Baby, 1998-present", sourceUrl: "https://sive.rs", sourceKind: "essays", tier: "B" },
  { slug: "pieter-levels", name: "Pieter Levels", company: "Nomad List / Remote OK", era: "Nomad List, 2014-present", sourceUrl: "https://levels.io", sourceKind: "blog", tier: "B" },
  { slug: "patrick-mckenzie", name: "Patrick McKenzie", company: "Bingo Card Creator / Stripe", era: "Bingo Card Creator -> Stripe, 2006-present", sourceUrl: "https://www.kalzumeus.com", sourceKind: "essays", tier: "B" },
  { slug: "ryan-hoover", name: "Ryan Hoover", company: "Product Hunt", era: "Product Hunt, 2013-present", sourceUrl: "https://ryanhoover.me", sourceKind: "blog", tier: "B" },
  { slug: "andrew-chen", name: "Andrew Chen", company: "Reforge / a16z", era: "Reforge -> a16z, 2009-present", sourceUrl: "https://andrewchen.com", sourceKind: "essays", tier: "B" },
  { slug: "elad-gil", name: "Elad Gil", company: "Color / Mixer Labs", era: "Mixer Labs -> Color, 2009-present", sourceUrl: "https://blog.eladgil.com", sourceKind: "newsletter", tier: "B" },
  { slug: "lenny-rachitsky", name: "Lenny Rachitsky", company: "Localmind / Airbnb", era: "Localmind -> Airbnb, 2010-present", sourceUrl: "https://www.lennysnewsletter.com", sourceKind: "newsletter", tier: "B" },
  { slug: "julie-zhuo", name: "Julie Zhuo", company: "Sundial", era: "Facebook -> Sundial, 2006-present", sourceUrl: "https://lg.substack.com", sourceKind: "newsletter", tier: "B" },
  { slug: "david-skok", name: "David Skok", company: "SilverStream / Matrix Partners", era: "SilverStream -> Matrix, 1996-present", sourceUrl: "https://www.forentrepreneurs.com", sourceKind: "blog", tier: "B" },
  { slug: "tomasz-tunguz", name: "Tomasz Tunguz", company: "Theory Ventures", era: "Redpoint -> Theory, 2008-present", sourceUrl: "https://tomtunguz.com", sourceKind: "blog", tier: "B" },
  { slug: "brad-feld", name: "Brad Feld", company: "Foundry Group / Techstars", era: "Foundry Group / Techstars, 1987-present", sourceUrl: "https://feld.com", sourceKind: "blog", tier: "B" },
  { slug: "david-cummings", name: "David Cummings", company: "Pardot / Atlanta Tech Village", era: "Pardot -> Atlanta Tech Village, 2007-present", sourceUrl: "https://davidcummings.org", sourceKind: "blog", tier: "B" },
  { slug: "matt-mullenweg", name: "Matt Mullenweg", company: "WordPress / Automattic", era: "WordPress / Automattic, 2003-present", sourceUrl: "https://ma.tt", sourceKind: "blog", tier: "B" },
  { slug: "john-onolan", name: "John O'Nolan", company: "Ghost", era: "Ghost, 2013-present", sourceUrl: "https://john.onolan.org", sourceKind: "blog", tier: "B" },
  { slug: "jeff-atwood", name: "Jeff Atwood", company: "Stack Overflow / Discourse", era: "Stack Overflow -> Discourse, 2008-present", sourceUrl: "https://blog.codinghorror.com", sourceKind: "blog", tier: "B" },
  { slug: "ev-williams", name: "Ev Williams", company: "Blogger / Twitter / Medium", era: "Blogger -> Twitter -> Medium, 1999-present", sourceUrl: "https://evhead.com", sourceKind: "archive", tier: "B" },
  { slug: "caterina-fake", name: "Caterina Fake", company: "Flickr / Hunch", era: "Flickr -> Hunch, 2004-present", sourceUrl: "https://caterina.net", sourceKind: "blog", tier: "B" },
  { slug: "alexis-ohanian", name: "Alexis Ohanian", company: "Reddit / Seven Seven Six", era: "Reddit -> Seven Seven Six, 2005-present", sourceUrl: "https://alexisohanian.com", sourceKind: "blog", tier: "B" },
  { slug: "dave-mcclure", name: "Dave McClure", company: "500 Startups", era: "500 Startups, 2010-present", sourceUrl: "https://500hats.com", sourceKind: "blog", tier: "B" },
  { slug: "aaron-harris", name: "Aaron Harris", company: "TutorSpree / Y Combinator", era: "TutorSpree -> YC, 2011-present", sourceUrl: "https://www.aaronkharris.com", sourceKind: "blog", tier: "B" },
  { slug: "michael-seibel", name: "Michael Seibel", company: "Justin.tv / Y Combinator", era: "Justin.tv -> YC, 2007-present", sourceUrl: "https://www.michaelseibel.com", sourceKind: "essays", tier: "B" },
  { slug: "geoff-ralston", name: "Geoff Ralston", company: "RocketMail / Y Combinator", era: "RocketMail -> YC, 1996-present", sourceUrl: "https://www.geoffralston.com", sourceKind: "essays", tier: "B" },
  { slug: "jared-friedman", name: "Jared Friedman", company: "Scribd / Y Combinator", era: "Scribd -> YC, 2006-present", sourceUrl: "https://jaredfriedman.com", sourceKind: "essays", tier: "B" },
  { slug: "dalton-caldwell", name: "Dalton Caldwell", company: "imeem / Y Combinator", era: "imeem -> YC, 2003-present", sourceUrl: "https://www.daltoncaldwell.com", sourceKind: "blog", tier: "B" },
  { slug: "justin-kan", name: "Justin Kan", company: "Twitch / Atrium", era: "Twitch -> Atrium, 2007-present", sourceUrl: "https://justinkan.com", sourceKind: "blog", tier: "B" },
  { slug: "emmett-shear", name: "Emmett Shear", company: "Twitch", era: "Twitch, 2007-present", sourceUrl: "https://emmett.ca", sourceKind: "blog", tier: "B" },
  { slug: "alex-maccaw", name: "Alex MacCaw", company: "Clearbit", era: "Clearbit, 2015-present", sourceUrl: "https://blog.alexmaccaw.com", sourceKind: "blog", tier: "B" },
  { slug: "noah-kagan", name: "Noah Kagan", company: "AppSumo", era: "AppSumo, 2010-present", sourceUrl: "https://okdork.com", sourceKind: "blog", tier: "B" },
  { slug: "seth-godin", name: "Seth Godin", company: "Yoyodyne / Squidoo", era: "Yoyodyne -> Squidoo, 1995-present", sourceUrl: "https://seths.blog", sourceKind: "blog", tier: "B" },
  { slug: "reid-hoffman", name: "Reid Hoffman", company: "LinkedIn", era: "LinkedIn, 2002-present", sourceUrl: "https://www.reidhoffman.org", sourceKind: "essays", tier: "B" },
  { slug: "ben-casnocha", name: "Ben Casnocha", company: "Comcate / Village Global", era: "Comcate -> Village Global, 2000-present", sourceUrl: "https://casnocha.com", sourceKind: "blog", tier: "B" },
  { slug: "chris-dixon", name: "Chris Dixon", company: "Hunch / a16z crypto", era: "Hunch -> a16z crypto, 2005-present", sourceUrl: "https://cdixon.org", sourceKind: "essays", tier: "B" },
  { slug: "nabeel-hyatt", name: "Nabeel Hyatt", company: "Conduit Labs / Spark Capital", era: "Conduit Labs -> Spark, 2007-present", sourceUrl: "https://nabeelqu.co", sourceKind: "blog", tier: "B" },
  { slug: "hunter-walk", name: "Hunter Walk", company: "Homebrew", era: "Homebrew, 2013-present", sourceUrl: "https://hunterwalk.com", sourceKind: "blog", tier: "B" },
  { slug: "jason-cohen", name: "Jason Cohen", company: "WP Engine / Smart Bear", era: "Smart Bear -> WP Engine, 2003-present", sourceUrl: "https://longform.asmartbear.com", sourceKind: "essays", tier: "B" },
  { slug: "rob-walling", name: "Rob Walling", company: "Drip / TinySeed", era: "Drip -> TinySeed, 2012-present", sourceUrl: "https://robwalling.com", sourceKind: "blog", tier: "B" },
  { slug: "arvid-kahl", name: "Arvid Kahl", company: "FeedbackPanda", era: "FeedbackPanda, 2017-present", sourceUrl: "https://thebootstrappedfounder.com", sourceKind: "blog", tier: "B" },
  { slug: "courtland-allen", name: "Courtland Allen", company: "Indie Hackers", era: "Indie Hackers, 2016-present", sourceUrl: "https://www.indiehackers.com/blog", sourceKind: "blog", tier: "B" },
  { slug: "nate-kontny", name: "Nate Kontny", company: "Highrise / Draft", era: "Draft -> Highrise, 2011-present", sourceUrl: "https://ninjasandrobots.com", sourceKind: "blog", tier: "B" },
  { slug: "steli-efti", name: "Steli Efti", company: "Close", era: "Close, 2013-present", sourceUrl: "https://blog.close.com/author/steli-efti", sourceKind: "blog", tier: "B" },
  { slug: "jason-lemkin", name: "Jason Lemkin", company: "EchoSign / SaaStr", era: "EchoSign -> SaaStr, 2005-present", sourceUrl: "https://www.saastr.com/author/jasonlk", sourceKind: "blog", tier: "B" },
  { slug: "peep-laja", name: "Peep Laja", company: "CXL / Wynter", era: "CXL -> Wynter, 2011-present", sourceUrl: "https://peeplaja.com", sourceKind: "blog", tier: "B" },
  { slug: "brian-balfour", name: "Brian Balfour", company: "Reforge", era: "Reforge, 2015-present", sourceUrl: "https://brianbalfour.com", sourceKind: "essays", tier: "B" },
  { slug: "matt-blumberg", name: "Matt Blumberg", company: "Return Path / Bolster", era: "Return Path -> Bolster, 1999-present", sourceUrl: "https://startupceo.com", sourceKind: "blog", tier: "B" },
  { slug: "david-cancel", name: "David Cancel", company: "Drift", era: "Drift, 2015-present", sourceUrl: "https://davidcancel.com", sourceKind: "blog", tier: "B" },
  { slug: "claire-lew", name: "Claire Lew", company: "Know Your Team", era: "Know Your Team, 2014-present", sourceUrl: "https://knowyourteam.com/blog/author/clairelew", sourceKind: "blog", tier: "B" },
  { slug: "rand-fishkin", name: "Rand Fishkin", company: "Moz / SparkToro", era: "Moz -> SparkToro, 2004-present", sourceUrl: "https://sparktoro.com/blog", sourceKind: "blog", tier: "B" },
  { slug: "nathan-barry", name: "Nathan Barry", company: "ConvertKit", era: "ConvertKit, 2013-present", sourceUrl: "https://nathanbarry.com/blog", sourceKind: "blog", tier: "B" },
  { slug: "aaron-levie", name: "Aaron Levie", company: "Box", era: "Box, 2005-present", sourceUrl: "https://levie.com", sourceKind: "blog", tier: "B" },
  { slug: "michael-arrington", name: "Michael Arrington", company: "TechCrunch", era: "TechCrunch, 2005-present", sourceUrl: "https://uncrunched.com", sourceKind: "blog", tier: "B" },
  { slug: "jason-calacanis", name: "Jason Calacanis", company: "Weblogs / Inside", era: "Weblogs -> Inside, 2003-present", sourceUrl: "https://calacanis.com", sourceKind: "blog", tier: "B" },
  { slug: "nir-eyal", name: "Nir Eyal", company: "AdNectar", era: "AdNectar -> Nir and Far, 2007-present", sourceUrl: "https://www.nirandfar.com", sourceKind: "blog", tier: "B" },
  { slug: "sean-ellis", name: "Sean Ellis", company: "Qualaroo / GrowthHackers", era: "Qualaroo -> GrowthHackers, 2012-present", sourceUrl: "https://www.startup-marketing.com", sourceKind: "archive", tier: "B" },
  { slug: "andrew-wilkinson", name: "Andrew Wilkinson", company: "Tiny", era: "Tiny, 2006-present", sourceUrl: "https://www.awilkinson.blog", sourceKind: "blog", tier: "B" },
  { slug: "ben-horowitz", name: "Ben Horowitz", company: "Opsware / a16z", era: "Opsware -> a16z, 1999-present", sourceUrl: "https://a16z.com/author/ben-horowitz", sourceKind: "essays", tier: "B" },
  { slug: "marc-andreessen", name: "Marc Andreessen", company: "Netscape / a16z", era: "Netscape -> a16z, 1994-present", sourceUrl: "https://pmarca.substack.com", sourceKind: "newsletter", tier: "B" },
  { slug: "vinod-khosla", name: "Vinod Khosla", company: "Sun Microsystems / Khosla Ventures", era: "Sun Microsystems -> Khosla Ventures, 1982-present", sourceUrl: "https://www.khoslaventures.com/author/vinod-khosla", sourceKind: "essays", tier: "B" },
  { slug: "bill-gurley", name: "Bill Gurley", company: "Benchmark", era: "Benchmark, 1999-present", sourceUrl: "https://abovethecrowd.com", sourceKind: "blog", tier: "B" },
  { slug: "keith-rabois", name: "Keith Rabois", company: "OpenStore / Founders Fund", era: "OpenStore, 2021-present", sourceUrl: "https://medium.com/@rabois", sourceKind: "blog", tier: "B" },
  { slug: "auren-hoffman", name: "Auren Hoffman", company: "LiveRamp / SafeGraph", era: "LiveRamp -> SafeGraph, 2000-present", sourceUrl: "https://summation.net", sourceKind: "blog", tier: "B" },
  { slug: "brian-armstrong", name: "Brian Armstrong", company: "Coinbase", era: "Coinbase, 2012-present", sourceUrl: "https://brianarmstrong.org", sourceKind: "essays", tier: "B" },
  { slug: "balaji-srinivasan", name: "Balaji Srinivasan", company: "Counsyl / Earn.com", era: "Counsyl -> Earn.com, 2007-present", sourceUrl: "https://balajis.com", sourceKind: "essays", tier: "B" },
  { slug: "brian-norgard", name: "Brian Norgard", company: "Chill / Tinder", era: "Chill -> Tinder, 2011-present", sourceUrl: "https://norgard.com", sourceKind: "essays", tier: "B" },
  { slug: "li-jin", name: "Li Jin", company: "Atelier Ventures / Variant", era: "Atelier -> Variant, 2020-present", sourceUrl: "https://li.substack.com", sourceKind: "newsletter", tier: "B" },
  { slug: "sarah-guo", name: "Sarah Guo", company: "Conviction", era: "Conviction, 2022-present", sourceUrl: "https://www.sarahguo.com/blog", sourceKind: "blog", tier: "B" },
  { slug: "anil-dash", name: "Anil Dash", company: "ThinkUp / Glitch", era: "ThinkUp -> Glitch, 2011-present", sourceUrl: "https://www.dashes.com", sourceKind: "blog", tier: "B" },
  { slug: "om-malik", name: "Om Malik", company: "GigaOm", era: "GigaOm, 2006-present", sourceUrl: "https://om.co", sourceKind: "blog", tier: "B" },
  { slug: "gina-trapani", name: "Gina Trapani", company: "Lifehacker / ThinkUp", era: "Lifehacker -> ThinkUp, 2005-present", sourceUrl: "https://ginatrapani.org", sourceKind: "blog", tier: "B" },
  { slug: "tom-preston-werner", name: "Tom Preston-Werner", company: "GitHub / Chatterbug", era: "GitHub -> Chatterbug, 2008-present", sourceUrl: "https://tom.preston-werner.com", sourceKind: "blog", tier: "B" },
  { slug: "zach-holman", name: "Zach Holman", company: "GitHub", era: "GitHub, 2010-present", sourceUrl: "https://zachholman.com", sourceKind: "essays", tier: "B" },
  { slug: "leah-culver", name: "Leah Culver", company: "Pownce / Breaker", era: "Pownce -> Breaker, 2007-present", sourceUrl: "https://leahculver.com", sourceKind: "blog", tier: "B" },
  { slug: "marco-arment", name: "Marco Arment", company: "Instapaper / Overcast", era: "Instapaper -> Overcast, 2008-present", sourceUrl: "https://marco.org", sourceKind: "blog", tier: "B" },
  { slug: "brent-simmons", name: "Brent Simmons", company: "NetNewsWire / Glassboard", era: "NetNewsWire -> Glassboard, 1999-present", sourceUrl: "https://inessential.com", sourceKind: "blog", tier: "B" },
  { slug: "amy-hoy", name: "Amy Hoy", company: "Noko / Stacking the Bricks", era: "Noko -> Stacking the Bricks, 2008-present", sourceUrl: "https://stackingthebricks.com", sourceKind: "blog", tier: "B" },
  { slug: "alex-hillman", name: "Alex Hillman", company: "Indy Hall", era: "Indy Hall, 2006-present", sourceUrl: "https://dangerouslyawesome.com", sourceKind: "blog", tier: "B" },
  { slug: "dan-shipper", name: "Dan Shipper", company: "Firefly / Every", era: "Firefly -> Every, 2014-present", sourceUrl: "https://danshipper.com", sourceKind: "essays", tier: "B" },
  { slug: "anne-laure-le-cunff", name: "Anne-Laure Le Cunff", company: "Ness Labs", era: "Ness Labs, 2019-present", sourceUrl: "https://nesslabs.com", sourceKind: "blog", tier: "B" },
  { slug: "simon-willison", name: "Simon Willison", company: "Django / Datasette", era: "Django -> Datasette, 2005-present", sourceUrl: "https://simonwillison.net", sourceKind: "blog", tier: "B" },
  { slug: "gergely-orosz", name: "Gergely Orosz", company: "The Pragmatic Engineer", era: "The Pragmatic Engineer, 2021-present", sourceUrl: "https://blog.pragmaticengineer.com", sourceKind: "newsletter", tier: "B" },
  { slug: "christina-cacioppo", name: "Christina Cacioppo", company: "Vanta", era: "Vanta, 2018-present", sourceUrl: "https://www.christinacacioppo.com", sourceKind: "essays", tier: "B" },
  { slug: "austen-allred", name: "Austen Allred", company: "Lambda School / BloomTech", era: "Lambda School -> BloomTech, 2017-present", sourceUrl: "https://austenallred.com", sourceKind: "blog", tier: "B" },
] as const satisfies ReadonlyArray<FounderSource>;

export const FOUNDER_SOURCE_BY_SLUG: ReadonlyMap<string, FounderSource> = new Map(
  FOUNDER_SOURCES.map((source) => [source.slug, source]),
);
