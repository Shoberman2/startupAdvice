/**
 * Hand-curated profile content for each founder in the directory.
 *
 * Two profile shapes:
 *   - PersonaBackedProfile: founders with a persona file in personas/*.md.
 *     They appear in /panel selection (if scraped) and /with chat. Their
 *     display name, era, and blog_url come from persona frontmatter.
 *   - DirectoryOnlyProfile (directory_only: true): founders whose advice
 *     comes from books or lectures. They appear on /founders only. They do
 *     not appear in /panel selection (no chunks) and /with chat is disabled
 *     (no persona prompt). Inline name/era/blog_url required.
 *
 * Source-of-truth contract:
 *   - Every chat-able persona MUST have a profile here.
 *   - A profile with directory_only: true does NOT need a persona file.
 *   - Both rules are enforced by lib/founders/index.ts at module load.
 *
 * Content drafted from public, verifiable sources. Specific dates and
 * numbers should be proofread before relying on them.
 */
export interface FounderStory {
  /** Headline phrase that anchors the anecdote. */
  title: string;
  /** ~80-140 word narrative. Active voice. */
  body: string;
}

export interface FounderAdvice {
  /** Punchy actionable phrase. Often something they actually said. */
  headline: string;
  /** 1-2 sentence elaboration putting it in context. */
  elaboration: string;
}

interface FounderProfileCore {
  slug: string;
  /** Short company / role line. */
  company: string;
  /** Where their advice lives: book, blog, or essay collection. */
  primary_source: string;
  /** ~120-180 word biographical paragraph. */
  bio: string;
  /** 3-5 narrative anecdotes. */
  notable_stories: FounderStory[];
  /** 5-8 actionable advice items. */
  advice: FounderAdvice[];
  /** One sentence: why their advice is worth reading. */
  why_listen: string;
}

export interface PersonaBackedProfile extends FounderProfileCore {
  directory_only?: false;
}

export interface DirectoryOnlyProfile extends FounderProfileCore {
  directory_only: true;
  /** Display name (would come from persona frontmatter if chat-able). */
  name: string;
  /** Era string, e.g. "Intel, 1968–1998". */
  era: string;
  /** Personal website, book Amazon link, or primary online presence. */
  blog_url: string;
}

export type FounderProfile = PersonaBackedProfile | DirectoryOnlyProfile;

const PROFILES: ReadonlyArray<FounderProfile> = [
  {
    slug: "paul-graham",
    company: "Y Combinator",
    primary_source: "paulgraham.com — ~200 essays",
    bio: "Co-founded Viaweb (1995), one of the first e-commerce platforms, and sold it to Yahoo in 1998 for around $49M, where it became Yahoo Store. In 2005, with Jessica Livingston (his future wife), Robert Morris, and Trevor Blackwell, he co-founded Y Combinator — the seed accelerator that would later fund Reddit, Airbnb, Dropbox, Stripe, and thousands of others. Outside of YC he wrote ~200 essays from the early 2000s onward that became the canon for early-stage startup advice. His earlier life is unusual for a tech founder: PhD in Computer Science from Harvard (1990), and painting study at RISD and the Accademia di Belle Arti in Florence. He stepped back from day-to-day YC operations around 2014.",
    notable_stories: [
      {
        title: "Viaweb's Lisp advantage",
        body: "Viaweb was written in Common Lisp at a time when essentially nobody was using Lisp in production web apps. Graham later argued this was the entire reason they outpaced competitors with much more capital: while rivals built static HTML stores with rigid templates, Viaweb could ship new features in hours. He called Lisp a 'secret weapon.' The essay 'Beating the Averages' became one of the most-cited arguments in software engineering for choosing the most powerful tool you can, even — especially — when nobody else does."
      },
      {
        title: "Y Combinator started as an experiment",
        body: "The first YC batch in Summer 2005 was framed as a one-off experiment to test whether funding a small group of founders together would work. Eight teams got around $6,000 each, with weekly group dinners and guest speakers. Reddit came out of that first batch. Graham has said they only decided to run YC year-round after seeing the quality of batch two. The model — small checks, small batches, peer effect, demo day — has been copied by hundreds of accelerators since."
      },
      {
        title: "Schlep blindness",
        body: "Graham coined the term to describe a specific way good startup ideas get overlooked: not because they're hard to see, but because they involve unglamorous, annoying work. Stripe is his canonical example — payments looks like a slog (regulation, fraud, integrations), so most ambitious founders avoid it, leaving an enormous opportunity for whoever is willing to do the schlep. The essay reframes a lot of 'why didn't someone do this' moments."
      },
      {
        title: "The Y Combinator interview format",
        body: "YC interviews are famously short — about ten minutes — and the partners ask blunt, specific questions about traction, the team, and the market. Graham has written that you can usually tell within minutes whether founders know their business. The brevity is deliberate: it forces founders to communicate clearly and exposes hand-waving. The format spread well beyond YC and reshaped how early-stage investors run first meetings."
      },
    ],
    advice: [
      { headline: "Make something people want", elaboration: "The YC motto. Not 'something innovative,' not 'something disruptive' — something users actually pull out of your hands. Most other founder problems are downstream of getting this right." },
      { headline: "Do things that don't scale", elaboration: "Personally onboard your first users, hand-craft their experience, email them one by one. Scaling is what you do once something works — not the test for whether it works." },
      { headline: "Live in the future, then build what's missing", elaboration: "The best startup ideas are visible to people who already inhabit the world the technology is making possible. Notice what's frustrating you that shouldn't be." },
      { headline: "Be ramen profitable", elaboration: "Get to the point where founder salaries cover ramen-tier living costs. Optional fundraising beats forced fundraising, and bargaining power compounds." },
      { headline: "Default alive, not default dead", elaboration: "Run the numbers: at current burn and growth, will you reach profitability before running out of money? Most founders don't actually do this calculation until it's too late." },
      { headline: "Talk to your users", elaboration: "Not 'send a survey' — actually talk. Watch them use the product. Most product mistakes are visible in five minutes of observation." },
      { headline: "Avoid making the wrong people happy", elaboration: "Some early users will love the product for the wrong reasons. Listening too much to them will pull you away from the people you should serve." },
    ],
    why_listen: "The most-cited startup essayist of the 2000s and 2010s, with patterns drawn from observing thousands of YC companies up close.",
  },
  {
    slug: "naval",
    company: "AngelList",
    primary_source: "nav.al + Almanack of Naval Ravikant (free, online)",
    bio: "Co-founded Epinions in 1999, then Vast.com, then AngelList (2010) with Babak Nivi — which started as a blog (Venture Hacks) and became the primary platform for syndicating early-stage startup investments. He stepped back from operational AngelList leadership in 2018 to focus on writing, podcasting, and personal investing. He has become more famous as a compressed-wisdom essayist than as an operator: his Twitter threads on wealth, leverage, and judgment have been widely circulated and compiled into the freely-distributed Almanack of Naval Ravikant. Earlier in his career he was an early investor in Twitter, Uber, Postmates, and dozens of others.",
    notable_stories: [
      {
        title: "Losing Epinions equity",
        body: "Naval has spoken openly about how he and his co-founders lost most of their equity at Epinions through investor terms they didn't fully understand. The company eventually sold to eBay's Shopping.com for around $40M in 2003, but the founders saw little of it. He sued, won, and the experience became foundational to how he later framed Venture Hacks and AngelList — both originally tools for founders to better understand the terms they were being offered."
      },
      {
        title: "Venture Hacks → AngelList",
        body: "AngelList didn't start as a company. It started as a blog (Venture Hacks) Naval ran with Babak Nivi to demystify term sheets and investor behavior. Out of demand from readers, they began curating a list of angel investors interested in pre-seed deals. The list became a product, the product became a marketplace, and AngelList became the dominant platform for syndicated angel investing in the early 2010s."
      },
      {
        title: "The Calacanis equity dispute",
        body: "Jason Calacanis and Naval had a public falling-out over AngelList equity that played out in tweets and blog posts. Calacanis had been an early advisor; the disagreement was over whether his contribution merited a larger equity stake. Naval has cited this as one of the reasons he later emphasized 'play long-term games with long-term people' so heavily — early partnerships have downstream consequences for years."
      },
      {
        title: "How to Get Rich, on Twitter",
        body: "In May 2018 Naval posted a tweetstorm titled 'How to Get Rich (Without Getting Lucky)' that compressed years of his thinking into about forty tweets. It went viral, became one of the most-shared threads of that era, and ultimately seeded the entire 'Almanack' book project — which was assembled by Eric Jorgenson largely from Naval's public writing. The thread reframed wealth-building around leverage rather than effort."
      },
    ],
    advice: [
      { headline: "Specific knowledge × leverage × judgment", elaboration: "Wealth doesn't come from working harder. It comes from accumulating skills nobody else has, applying them through scalable leverage (code, media, capital), and exercising good judgment about where to point them." },
      { headline: "Play long-term games with long-term people", elaboration: "Compounding works in relationships too. Most outsized returns come from people you've worked with for a decade — investors, employees, friends. Burn bridges and you lose the compounding." },
      { headline: "Seek wealth, not money or status", elaboration: "Wealth is owning assets that earn while you sleep. Money is the temporary translation of value. Status is a zero-sum game played at others' expense." },
      { headline: "Code and media are permissionless leverage", elaboration: "The two forms of leverage you can deploy without anyone's approval. They scale 24/7 with zero marginal cost." },
      { headline: "Embrace accountability", elaboration: "Take on risk under your own name. Reputation is a moat. Avoiding accountability also avoids the upside." },
      { headline: "Choose to be peaceful", elaboration: "Most of the misery you'll experience is self-inflicted. The mind is a muscle you can train toward equanimity." },
    ],
    why_listen: "Compresses wealth and leverage to first principles in tweet-length aphorisms that hold up under pressure.",
  },
  {
    slug: "jason-fried",
    company: "37signals / Basecamp",
    primary_source: "world.hey.com/jason + Rework, Remote, It Doesn't Have to Be Crazy at Work",
    bio: "Co-founded 37signals in 1999 as a small Chicago web design consultancy, then pivoted to making web apps — Basecamp launched in 2004. The company famously bootstrapped, stayed small, and rejected venture capital. Co-authored Rework, Remote, and It Doesn't Have to Be Crazy at Work with David Heinemeier Hansson. In 2014 the company renamed from 37signals to Basecamp; in 2022 they reverted to 37signals after launching the HEY email product and other tools under that umbrella again. His public stance is anti-VC, anti-hypergrowth, pro-calm, pro-profitable, pro-small-team — a contrarian position that has held for two decades.",
    notable_stories: [
      {
        title: "Rejecting Jeff Bezos's offer to invest more",
        body: "In 2006 Jeff Bezos personally bought a minority stake in 37signals. According to Fried, Bezos later offered to invest more capital, and the founders declined. The reasoning was simple: they were already profitable, and additional capital would only create expectations about growth they didn't share. The story became a touchstone in his writing about staying small on purpose."
      },
      {
        title: "Inventing Shape Up",
        body: "After years of trying to make Scrum-style agile work at Basecamp, Fried and the team developed their own approach — six-week 'cycles' with two-week cool-down periods, fixed time and variable scope, and 'shaping' work before it ever hits a team. They published the methodology as a free book (Shape Up) in 2019. It was adopted widely by small product teams looking for an alternative to ceremony-heavy agile."
      },
      {
        title: "The 2021 Basecamp memo",
        body: "In April 2021, Fried published a memo announcing that Basecamp would no longer permit 'societal and political discussions' on internal company channels. The decision triggered a public firestorm and roughly a third of the staff resigned within weeks. Fried defended the policy as a return to focus on work; critics framed it as silencing employees. The episode remains the most controversial event in Basecamp's public history."
      },
      {
        title: "HEY versus the App Store",
        body: "When 37signals launched HEY email in 2020, Apple rejected the iOS app for not offering in-app purchases (which would have given Apple 30%). The standoff became public, with Fried and DHH publicly criticizing Apple's App Store policies. Apple eventually backed down. The episode became part of the broader push that led to App Store policy reforms in 2021."
      },
    ],
    advice: [
      { headline: "Stay small on purpose", elaboration: "Growth is a choice, not a destiny. A small profitable team can outlast a large funded one." },
      { headline: "Constraints are features", elaboration: "Less time, less money, fewer people — these force decisions you would otherwise put off. They don't make work worse; they make it shippable." },
      { headline: "Meetings are toxic", elaboration: "Pre-Fried, meetings were defaults. Post-Fried, async writing is the default and meetings need a justification." },
      { headline: "Ship small, ship often", elaboration: "Big launches hide bad assumptions. Small iterations expose them while they're still cheap to fix." },
      { headline: "Stop comparing your inside to others' outside", elaboration: "Public company narratives are PR. Your team's messy reality is normal. Operate from your own numbers, not someone else's press release." },
      { headline: "Profit is permission", elaboration: "A profitable business doesn't owe anything to investors or markets. That permission compounds into freedom of decision-making over years." },
    ],
    why_listen: "Rare working operator who has run the same calm, profitable software company for two decades against industry orthodoxy.",
  },
  {
    slug: "patrick-collison",
    company: "Stripe",
    primary_source: "patrickcollison.com + Stripe Press (publishes others' books)",
    bio: "With his younger brother John, founded Stripe in 2010 while he was a student at MIT (John was at Harvard). Earlier, at 19, he sold Auctomatic — a tool for eBay power-sellers — to Live Current Media for about $5M. Stripe started as 'seven lines of code' for accepting payments and grew into the dominant payments infrastructure of the 2010s and 2020s, processing well over a trillion dollars annually at peak. Collison is also widely known for reading broadly outside his industry: he co-authored a 2019 Atlantic essay calling for 'progress studies' as a field, helped launch Fast Grants during COVID-19 in 2020, and runs an unusually thoughtful personal website with reading lists, open questions, and book reviews.",
    notable_stories: [
      {
        title: "Seven lines of code",
        body: "The original Stripe pitch was that you could accept credit cards on your site with seven lines of code, instead of weeks of integration work with traditional payment processors. The brothers built the first version while still in school, with the YC class of Summer 2010. The 'seven lines' framing was both technically true and an extraordinary act of marketing — it described the developer experience as a product, not the underlying complexity."
      },
      {
        title: "Selling Auctomatic at 19",
        body: "Before Stripe, Patrick and his brother built Auctomatic, a tool for managing high-volume eBay listings. They sold it in 2008 for around $5M to Live Current Media. Patrick has spoken about it as a humbling experience — the company didn't escape velocity at scale — and as the foundation for the more ambitious bet they made with Stripe."
      },
      {
        title: "Fast Grants and COVID-19 science",
        body: "In April 2020, when traditional grant cycles were running slow during the early COVID-19 emergency, Collison co-founded Fast Grants with Tyler Cowen — distributing emergency funding to scientists in days rather than months. The program disbursed tens of millions of dollars to dozens of research teams. It became a high-profile example of how startup-style speed could be applied to public-interest funding."
      },
      {
        title: "Stripe's 2023 valuation cut",
        body: "In March 2023, Stripe raised a tender round that valued the company at about $50B — down from a peak of around $95B in 2021. The cut was widely reported and became a marker for the broader correction in late-stage private tech valuations. Collison handled it publicly with unusual candor, framing it as a recalibration to be expected after a frothy market."
      },
    ],
    advice: [
      { headline: "Read widely outside your industry", elaboration: "Most novel ideas come from importing patterns from other fields. Read history, science, biographies. The compounding is enormous over a decade." },
      { headline: "Build infrastructure that compounds for decades", elaboration: "The best businesses are ones where today's investment makes tomorrow's investment easier. Stripe is built this way; many of its bets only paid off years later." },
      { headline: "Speed is a feature", elaboration: "Fast Grants happened in days because traditional cycles were the bottleneck. Most processes are slow because nobody questioned the pace, not because the pace is needed." },
      { headline: "Hire ahead of your problems", elaboration: "If you wait until you need a senior person to recruit them, you're already behind. The best operators have a six-month roadmap of hires they'd want." },
      { headline: "Write things down", elaboration: "Public writing forces clarity and creates a paper trail you can pattern-match against later. It's also the cheapest possible marketing for a serious company." },
      { headline: "Take long-arc bets seriously", elaboration: "Most companies optimize for the next quarter. The companies that compound for decades are the ones who can actually think in terms of decades." },
    ],
    why_listen: "Operator-intellectual building one of the most consequential pieces of internet infrastructure of the 2010s and 2020s.",
  },
  {
    slug: "sam-altman",
    company: "OpenAI",
    primary_source: "blog.samaltman.com + Stanford CS183 lectures (with PG)",
    bio: "Founded Loopt (location-sharing) as part of the first Y Combinator batch in 2005, sold it to Green Dot in 2012 for about $43M. Became YC President in 2014 and led a major expansion of the program (including launching YC Continuity for follow-on funding). Co-founded OpenAI in 2015 with Elon Musk, Greg Brockman, Ilya Sutskever, and others as a nonprofit AI lab, then became CEO of the company's for-profit subsidiary in 2019. Briefly fired by the OpenAI board in November 2023 over governance disagreements; reinstated within five days after employee and investor pressure. Has written publicly since the late 2000s on startups, AI safety, and long-arc bets.",
    notable_stories: [
      {
        title: "Loopt's struggle and exit",
        body: "Loopt was a location-sharing service that predated the smartphone era by enough that the product never quite found its market. Altman has described it as a lesson in how being too early is functionally the same as being wrong. The company sold to Green Dot for around $43M in 2012 — a meaningful outcome for the team but well below the trajectory of YC's later breakouts."
      },
      {
        title: "Scaling YC as President",
        body: "When Altman took over YC from Paul Graham in 2014, the program funded ~150 companies a year. By the time he stepped down in 2019, that number had grown significantly and YC Continuity had been launched as a $700M growth fund for breakouts. The expansion was controversial inside the community — some felt the magic of small batches was being lost — but it positioned YC for the AI-era boom."
      },
      {
        title: "The OpenAI board firing",
        body: "On November 17, 2023, the OpenAI board (then including Helen Toner, Tasha McCauley, Adam D'Angelo, and Ilya Sutskever) fired Altman as CEO, citing a lack of candor with the board. Within hours, hundreds of OpenAI employees signed an open letter threatening to leave. By November 22, Altman was reinstated as CEO with a new board. The five-day arc became one of the most-watched corporate dramas in modern tech."
      },
      {
        title: "ChatGPT as a 'low-key research preview'",
        body: "ChatGPT was launched on November 30, 2022 as what OpenAI internally framed as a low-key demo of GPT-3.5 with a chat interface. Within a week, it had a million users. Within two months, it had a hundred million. Altman has admitted the team did not anticipate the consumer response and had to scramble infrastructure to keep the service up."
      },
    ],
    advice: [
      { headline: "Move fast on reversible decisions", elaboration: "Most decisions are two-way doors. Speed compounds. The mistake is treating reversible decisions as if they were one-way." },
      { headline: "Conviction over consensus", elaboration: "The best founders hold strong opinions through long periods of social skepticism. Consensus is often a signal you're following, not leading." },
      { headline: "Willfulness as strategy", elaboration: "Push hard in one direction for long enough and the world tends to yield. Most people give up too early to find out." },
      { headline: "Long-term thinking is the real edge", elaboration: "Almost nobody is willing to plan in five-year horizons. If you can, you're operating in a less crowded space." },
      { headline: "Hire for slope, not intercept", elaboration: "A great hire is one who improves at the rate you need. Past pedigree matters less than current learning velocity." },
      { headline: "Take asymmetric bets", elaboration: "When the downside is bounded and the upside is large, take the bet — even if the expected value calculation looks ambiguous in the moment." },
    ],
    why_listen: "One of the most consequential operator-leaders of the modern AI era, with a paper trail going back to 2007.",
  },
  {
    slug: "fred-wilson",
    company: "Union Square Ventures",
    primary_source: "avc.com — daily blogging since 2003",
    bio: "Co-founded Union Square Ventures in 2003 with Brad Burnham, after running Flatiron Partners in the late 1990s. USV's portfolio over two decades includes Twitter, Etsy, Tumblr, Coinbase, Duolingo, MongoDB, Stripe, and many others. Has written almost every day at AVC.com since 2003 — the longest continuously-running active VC blog on the internet. Has been an early and consistent voice on the consumer internet, social platforms, and crypto markets. Often credited with the 'network of networks' investment thesis that shaped how seed investors evaluated social products in the 2000s and 2010s.",
    notable_stories: [
      {
        title: "The Twitter investment thesis",
        body: "USV led Twitter's Series A in 2007, when the company was barely twelve months old and had no business model. Wilson has written that the thesis was simple: the engagement curves looked like the early internet itself, and platforms with that shape rarely fail to find monetization eventually. The bet looked premature at the time and prescient afterwards."
      },
      {
        title: "Selling Tumblr to Yahoo for $1.1B",
        body: "USV was an early backer of Tumblr, and in 2013 Yahoo acquired the company for $1.1B in cash — a major exit at the time. Yahoo later wrote the asset down significantly. Wilson wrote publicly about both the win and the eventual decline of Tumblr under Yahoo's stewardship, treating it as a case study in how acquisitions can starve a product of the energy that made it valuable."
      },
      {
        title: "The Coinbase early call",
        body: "USV invested in Coinbase's Series A in 2013, when Bitcoin was around $100 and most institutional investors treated crypto as a curiosity. The bet was based on the conviction that crypto needed a regulated on-ramp for ordinary people. When Coinbase went public in 2021 at a $86B valuation, it was one of the largest VC returns in history."
      },
      {
        title: "Two decades of daily blogging",
        body: "Wilson started AVC in September 2003 and has posted nearly every day since — well over 7,000 posts. The discipline came from a deliberate decision to think publicly in real time, even when the posts were short or imperfect. The blog has become both his reputation moat and a primary source of deal flow."
      },
    ],
    advice: [
      { headline: "Network effects beat features", elaboration: "Features are commodity over time. Network effects compound. The best investments are in platforms where users bring users." },
      { headline: "Write in public, every day", elaboration: "The act of writing forces clarity, builds reputation, and creates compounding distribution. Most people overestimate the risk and underestimate the upside." },
      { headline: "Patience with breakout outliers", elaboration: "A few investments will return the whole fund. Many will return zero. The trick is to wait for the winners to fully play out without forcing exits." },
      { headline: "Hold your sells", elaboration: "Selling early in a power-law business is more costly than buying late. The best returns come from holding through volatility that makes you uncomfortable." },
      { headline: "Bet on entrepreneurs over markets", elaboration: "Markets change. Entrepreneurs who can execute through change are rare and disproportionately valuable." },
      { headline: "Be transparent about losses", elaboration: "Writing about failed investments is good for your network and great for your judgment. People remember who told the truth when it cost them something." },
    ],
    why_listen: "20+ years of transparent VC thinking in public, in real time, with the receipts to back the pattern-matching.",
  },
  {
    slug: "sahil-lavingia",
    company: "Gumroad",
    primary_source: "sahillavingia.com + The Minimalist Entrepreneur",
    bio: "Founded Gumroad in 2011 at 19, after leaving Pinterest as one of its earliest employees. The original trajectory was classic VC-scale software: he raised about $7M from a16z, Kleiner Perkins, and others. When growth didn't reach the rates his investors expected, he laid off most of the team in 2015 and Gumroad shrunk to a tiny, remote, profitable operation. He wrote about the reset publicly in a 2019 Medium piece ('Reflecting on My Failure to Build a Billion-Dollar Company') that became one of the most-cited 'small and good' founder essays of that era. His book The Minimalist Entrepreneur (2021) crystallized the philosophy. He also paints and has done a side-project (Painter) on creative tools.",
    notable_stories: [
      {
        title: "Leaving Pinterest at 18",
        body: "Lavingia joined Pinterest in 2010 as one of its earliest designers and engineers, while still a teenager. He left a year later to start Gumroad, walking away from what would have been one of the most lucrative early-employee outcomes of the decade as Pinterest grew. He has written that the decision wasn't about money — it was about wanting to build his own thing."
      },
      {
        title: "Gumroad's 2015 layoff",
        body: "After several years of trying to grow Gumroad to VC-scale, Lavingia realized in 2015 that the product had a real but bounded market. He laid off the team, kept the product running with a skeleton crew, and let Gumroad continue as a small profitable business. He has written about the experience as the hardest thing he has done — but also the most clarifying."
      },
      {
        title: "Reflecting on Failure",
        body: "In February 2019, Lavingia published a long essay titled 'Reflecting on My Failure to Build a Billion-Dollar Company.' It was an unusually candid post-mortem of an entire founder career arc — what he had tried, what hadn't worked, and why staying small was a deliberate choice rather than a defeat. The piece became foundational to the 'indie hacker' and 'calm company' movements that grew in the 2020s."
      },
      {
        title: "Painter, the side project",
        body: "Outside of Gumroad, Lavingia paints and has built a small tool called Painter that helps people make art. The side project is part of a deliberate identity: founder, but also a person with a life and craft outside of company-building. He has written about how this informs his rejection of total-life-is-startup culture."
      },
    ],
    advice: [
      { headline: "Minimum viable company", elaboration: "Define the smallest viable business that lets you make a living doing work you care about. Optimize for the lifestyle that emerges, not the valuation." },
      { headline: "Sell shovels, not gold", elaboration: "Provide infrastructure for other creators. Their success becomes your distribution. You don't need to predict which creator will win — you just need to be the platform underneath." },
      { headline: "Cap your ambition, not your output", elaboration: "You can write, build, and ship at the same intensity whether you're going for a small business or a unicorn. The ambition cap is about what you call success, not how hard you work." },
      { headline: "Default to async", elaboration: "Remote-first, async-default work compounds time. Most meetings are status updates that should have been a paragraph." },
      { headline: "Public reflection is leverage", elaboration: "Writing about what worked and what didn't builds reputation in a way no marketing budget can buy. Your missteps are more credibility-building than your wins." },
      { headline: "Don't optimize for the press release", elaboration: "The metrics that make a good headline (raised X, hired Y) rarely correlate with the metrics that make a sustainable business (profit, retention)." },
    ],
    why_listen: "One of the most public stories of resetting from 'next big thing' to 'small and good' — with the financials shown openly.",
  },
  {
    slug: "garry-tan",
    company: "Y Combinator",
    primary_source: "garrytan.com + YC office hours (YouTube)",
    bio: "Designer-engineer turned investor. Co-founded Posterous in 2008 (acquired by Twitter in 2012). Joined Y Combinator as a designer and early partner around 2011, then co-founded Initialized Capital that same year. Initialized's portfolio includes Coinbase, Instacart, Cruise, and Flexport, with seed checks in many at very early stages. In 2022, he succeeded Geoff Ralston as President and CEO of Y Combinator — bringing strong design taste and a markedly louder public voice than his predecessor. Has been a vocal advocate of San Francisco urbanism and a sometimes-controversial public figure on X/Twitter.",
    notable_stories: [
      {
        title: "Posterous's Twitter acqui-hire",
        body: "Posterous was a lightweight blogging platform — competing with Tumblr and WordPress — that gained early traction but never reached escape velocity. Twitter acquired the company in 2012 in what was widely understood as an acqui-hire for the team. Tan has written publicly about the experience as a lesson in the difference between traction and a real market."
      },
      {
        title: "The Initialized seed bet on Coinbase",
        body: "Initialized was an early-stage investor in Coinbase, before crypto was a mainstream investment thesis. The check was small by later standards but the multiple over time was extraordinary. Tan has written about how the bet looked obvious only in retrospect — at the time it required a willingness to be wrong publicly for years."
      },
      {
        title: "Returning to YC as President",
        body: "When Tan took over YC in January 2022, the program had been through several transitions — Paul Graham → Sam Altman → Michael Seibel → Geoff Ralston. Tan brought a stronger design-and-marketing orientation and a much more visible public profile, including aggressive social-media presence. The early indications were a meaningful uptick in application volume and a renewed focus on hard-tech and AI startups."
      },
      {
        title: "San Francisco urbanism stance",
        body: "Tan has been an unusually vocal public voice on San Francisco politics, housing, public safety, and city management. He has backed candidates and ballot measures and used his platform to promote a YIMBY (yes-in-my-backyard) and pro-density agenda. The stance has been polarizing — admirers see civic engagement, critics see a tech leader weighing in on civic affairs in counterproductive ways."
      },
    ],
    advice: [
      { headline: "Design is a compounding moat", elaboration: "Most founders treat design as decoration. The best ones treat it as a wedge — the first thing people see, the thing that earns their trust before any feature does." },
      { headline: "Narrow the wedge", elaboration: "The first product should solve one problem for one type of person, completely. Once you own that surface, you can expand. Trying to be broad from day one usually means being thin everywhere." },
      { headline: "Found in the same city as your team", elaboration: "Co-location for early-stage teams accelerates trust and iteration. Distributed founding teams are possible but they trade away one of the few real advantages early-stage companies have." },
      { headline: "Be loud about your work", elaboration: "Public visibility creates compounding distribution, recruiting pipeline, and deal flow. Quietness is the default but it isn't free." },
      { headline: "Optimism is a skill", elaboration: "The default mode of most cities, companies, and industries is decline. Choosing to believe a place or product can be better is a skill — and a strategy." },
      { headline: "Hire engineers with founder DNA", elaboration: "The best early hires are people who could have founded their own company and chose not to. They bring agency, not just execution." },
    ],
    why_listen: "Active operator-investor with strong design taste and the current YC vantage point on early-stage startups.",
  },
  {
    slug: "david-heinemeier-hansson",
    company: "37signals / Basecamp",
    primary_source: "world.hey.com/dhh + Rework, Remote, REWORK, It Doesn't Have to Be Crazy at Work",
    bio: "Created Ruby on Rails in 2004 while building Basecamp at 37signals — extracting the framework from the application as he went. Rails became the foundation for huge swaths of the web (GitHub, Shopify, Basecamp itself) and arguably did more to shape how 2000s startups got built than any other piece of open-source software. Co-author with Jason Fried of Rework, Remote, and It Doesn't Have to Be Crazy at Work. Outside of software, he's a competitive racing driver (Le Mans class winner) and a vocal public critic of mainstream tech industry orthodoxies — including VC, microservices, cloud-only architectures, and political-discourse policies in workplaces.",
    notable_stories: [
      {
        title: "Extracting Rails from Basecamp",
        body: "Rails was never written as a standalone framework. DHH built Basecamp in Ruby, found the patterns he was repeating useful, and extracted them into what became Rails 0.5 in 2004. The 'extract a framework' approach became a methodology in itself — David has argued that almost every framework that gets used should come out of a real application, not be designed in the abstract."
      },
      {
        title: "The HEY launch standoff with Apple",
        body: "In June 2020, HEY (37signals's new email product) was rejected by Apple's App Store for not offering in-app purchases (which would have given Apple 30%). DHH and Jason Fried went public with the dispute, framing it as App Store extortion. Apple eventually reversed course. The episode contributed to the broader public pressure that led to App Store policy reforms in 2021–2022."
      },
      {
        title: "Leaving the cloud",
        body: "In 2022, 37signals began publicly migrating off AWS and other public cloud infrastructure, back to physically-owned servers. DHH wrote a series of essays explaining the economics — that for stable workloads with predictable traffic, owning hardware was dramatically cheaper than renting it. The series became foundational to a small but growing 'cloud repatriation' movement."
      },
      {
        title: "Le Mans class win",
        body: "In 2014, DHH and his co-drivers won their class at the 24 Hours of Le Mans — one of the most demanding endurance races in motorsport. He has written about racing as an emotional counterweight to software work: a domain where pure execution matters and where outcomes are visible on a clock, not in retention curves."
      },
    ],
    advice: [
      { headline: "Conceptual compression", elaboration: "Good abstractions hide complexity without losing power. Bad abstractions just shuffle complexity to a different place. The compression test is whether a junior developer can be productive in your stack on day one." },
      { headline: "Open source as career", elaboration: "Releasing code you would have built anyway makes you part of a network that compounds for decades. Rails put him in a position to write books, give talks, race cars, and run Basecamp on his own terms." },
      { headline: "Monolith first", elaboration: "Microservices are an organizational solution sold as a technical solution. For small teams they introduce more complexity than they remove. Start with a well-built monolith and split only when the team forces it." },
      { headline: "Own your infrastructure", elaboration: "Public cloud is great until you do the math at scale. For a stable, profitable business with predictable traffic, owning servers can save millions a year." },
      { headline: "Strong opinions, weakly held — for facts; strongly held for values", elaboration: "Change your mind on facts as evidence shifts. Don't change it on values to fit the room." },
      { headline: "Work isn't your identity", elaboration: "The healthiest founders have something they love that has nothing to do with their company. Hobbies aren't a distraction — they're a stabilizer." },
    ],
    why_listen: "Rare combination of working operator and prolific open-source tooling builder, with a strongly contrarian point of view.",
  },
  {
    slug: "brian-chesky",
    company: "Airbnb",
    primary_source: "medium.com/@bchesky + interviews and shareholder letters",
    bio: "Co-founded Airbnb in 2008 with Joe Gebbia and Nathan Blecharczyk after they began renting air mattresses in their San Francisco apartment during a design conference. Trained as an industrial designer at RISD. Led Airbnb through near-collapse during COVID-19 (April 2020 revenue dropped roughly 80%) to a successful IPO in December 2020 at a ~$47B valuation. Has more recently become known for 'Founder Mode' — a public articulation of how founder-led companies should operate, contrasted against professional-manager mode. Refocused Airbnb in 2022–2023 on design-led product development with much smaller, faster teams reporting more directly to him.",
    notable_stories: [
      {
        title: "The air mattress origin",
        body: "When a major design conference came to San Francisco in 2007 and the city's hotels sold out, Chesky and Gebbia — both struggling to pay rent on their apartment — put three air mattresses on their living room floor and posted a website offering them as paid accommodations. Three people booked. The episode is now famous as the founding moment of Airbnb, but at the time it was a hustle to make rent."
      },
      {
        title: "Cereal box financing",
        body: "Early in 2008, with the company struggling to raise money, Chesky and Gebbia designed two limited-edition cereal boxes — Obama O's and Cap'n McCain's — timed to the presidential election. They sold them for $40 each and used the proceeds to fund the company. The story became famous in YC lore as evidence of founder resourcefulness; the cereal boxes themselves became collector items."
      },
      {
        title: "11-star experience design",
        body: "Chesky and team famously did an exercise where they asked: what would a 5-star Airbnb experience look like? Then a 6-star? Then a 7-star — all the way to 11-star. The 11-star answer was something absurd (Elon Musk picking you up in a rocket). The exercise became a way to back-cast what a meaningfully better experience would look like, then ship the achievable parts toward it."
      },
      {
        title: "Surviving COVID",
        body: "In April 2020, Airbnb's bookings dropped by roughly 80% in eight weeks. The company laid off about a quarter of its workforce. Chesky's public letter to laid-off employees was widely cited as a model for how to do layoffs with dignity. The company emerged from COVID smaller, more focused on long-term stays, and reorganized around designer-led product teams. The IPO eight months later was one of the largest of 2020."
      },
      {
        title: "Founder Mode",
        body: "In September 2024, Paul Graham wrote an essay titled 'Founder Mode' that summarized a talk Chesky had given at a YC event — describing how founder-led companies operate differently from manager-led ones, often with deeper involvement at multiple levels. The framing went viral and became a major discussion point about what makes founders effective leaders versus delegators."
      },
    ],
    advice: [
      { headline: "Found a company you'd want to use", elaboration: "Most founders default to enterprise software they wouldn't touch personally. The best founders make products they're also customers of — the feedback loop is faster and more honest." },
      { headline: "Design is leadership", elaboration: "Designers see the whole user experience as one thing. That's the same skill the CEO needs. Hand product reviews to designers, not project managers." },
      { headline: "Cut what doesn't move the needle", elaboration: "In 2022–2023, Airbnb significantly reduced the number of product initiatives in flight to focus on a smaller set of fundamentally important ones. Most companies say no much less often than they should." },
      { headline: "Founder mode beats manager mode", elaboration: "Founders shouldn't fully delegate the things that made them founders. Deep involvement at multiple levels — especially design, hiring, and key partnerships — is not micromanagement when it expands the team's thinking." },
      { headline: "When the world breaks, accelerate", elaboration: "COVID could have killed Airbnb. Instead the team used the crisis to cut bloat, reorganize, and double down on the long-stay segment. The strongest companies pivot fastest when defaults collapse." },
      { headline: "Write the future you want", elaboration: "Chesky famously writes long letters to the company describing the future state he wants — sometimes years out. Writing forces specificity. Specificity is what makes plans into companies." },
    ],
    why_listen: "Designer-operator with a contrarian, design-first take on what running a tech company actually requires.",
  },
  {
    slug: "tobi-lutke",
    company: "Shopify",
    primary_source: "tobi.lutke.com + interviews + Shopify shareholder letters",
    bio: "Born in Germany, moved to Canada in 2002. Built a snowboarding e-commerce store (Snowdevil) in 2004 — Shopify spun out of the platform that ran it. Co-founders Scott Lake and Daniel Weinand were also involved early. He's been CEO since the company started, making him one of the longest-tenured operator-CEOs in modern commerce. Shopify went public in 2015 and grew to be worth well over $100B at its 2021 peak, powering a meaningful share of internet commerce — particularly for small and mid-sized merchants. Outside Shopify he's an unusual public CEO: tweets in his own voice, writes occasional long essays, plays chess publicly, and discusses topics far outside business.",
    notable_stories: [
      {
        title: "Snowdevil to Shopify",
        body: "In 2004, Lütke and Scott Lake tried to launch an online snowboard store and were frustrated with the existing e-commerce platforms — none of them were customizable enough for what they wanted. Lütke built one himself in Ruby on Rails. They realized other merchants might want the same thing, and pivoted from selling snowboards to selling the platform. Shopify launched in 2006."
      },
      {
        title: "2022 over-hiring and layoffs",
        body: "During COVID, Shopify hired aggressively, expecting the pandemic-driven shift to e-commerce to be permanent. When the rebalancing came in 2022, Lütke laid off about 10% of staff and admitted publicly that he had misjudged the shift. A second round of layoffs in 2023 cut another ~20%. He framed both publicly as his responsibility, which earned him cred for honesty and criticism for the volume of cuts."
      },
      {
        title: "Cancelling all meetings",
        body: "In January 2023, Lütke announced that Shopify was deleting all recurring meetings of three or more people from calendars and challenging managers to defend each one before re-adding it. The change was widely publicized and partially walked back later, but it became a template for other CEOs reconsidering meeting cultures."
      },
      {
        title: "The AI-as-default memo",
        body: "In a 2025 memo (leaked), Lütke wrote that effective AI use was now a baseline expectation for all Shopify employees and that requests for headcount needed to first justify why AI couldn't do the work. The framing was sharp and divisive — a public marker that the era of AI as 'nice to have' was, at Shopify, definitely over."
      },
    ],
    advice: [
      { headline: "Compound craft", elaboration: "Every skill you build stacks on top of every other skill. Most people undervalue this — they pursue the next promotion when they should be investing in the next decade of capability." },
      { headline: "First principles or nothing", elaboration: "Don't trust convention. Most accepted truths in business are inherited from contexts that no longer apply. Re-derive everything important from base assumptions." },
      { headline: "Treat AI as a multiplier, not a tool", elaboration: "If your team isn't dramatically more productive after a year of AI integration, you're using it wrong. The asymmetric advantage isn't in using AI — it's in using it relentlessly." },
      { headline: "Marathon, not sprint", elaboration: "Twenty years of CEO tenure is unusual on purpose. Sustained craft and consistency compound in ways founders who burn out at year four never see." },
      { headline: "Own your mistakes publicly", elaboration: "The 2022 over-hiring was Lütke's call and he said so. Owning the call builds trust internally more than spin protects it." },
      { headline: "Optimize for builders, not managers", elaboration: "Shopify's recurring theme is removing process to let builders move faster. Most companies accumulate management overhead the way old code accumulates dead branches." },
    ],
    why_listen: "One of the longest-tenured first-principles operator-CEOs in modern commerce.",
  },
  {
    slug: "eugene-wei",
    company: "Remains of the Day",
    primary_source: "eugenewei.com — long-form essays since 2002",
    bio: "Was one of Amazon's earliest employees, joining in the late 1990s during the first major scale-up. Later led product roles at Hulu, Flipboard, and Oculus Video. Best known publicly as the writer of Remains of the Day — a long-running blog with rare but consistently high-signal essays on product strategy, social platforms, and cultural dynamics. He doesn't publish often (often a handful of pieces per year) but each one tends to circulate for years. His 'Status as a Service' essay (2019) reframed how a generation of product leaders thought about social networks — arguing that status, not utility, was the primary driver of adoption.",
    notable_stories: [
      {
        title: "The Invisible Asymptote",
        body: "In a 2018 essay, Wei wrote about working at Amazon early in his career and how Jeff Bezos was particularly attuned to growth-asymptote curves — the invisible ceiling that limits how big a business can get. Wei described it as a uniquely Amazon way of thinking, one that shaped how every team at the company evaluated which problems to work on. The essay became foundational for product strategists trying to assess the long-arc trajectory of a business."
      },
      {
        title: "Status as a Service",
        body: "In February 2019, Wei published a roughly 25,000-word essay titled 'Status as a Service (StaaS)' arguing that social networks succeed not by being useful, but by giving people new ways to earn status. He used Instagram, TikTok, and Twitter as cases. The essay was widely circulated — almost every product person building a social product since 2019 has at least encountered it — and reshaped how investors and operators evaluated 'community' features."
      },
      {
        title: "Why TikTok succeeded",
        body: "In a 2020 essay series, Wei dissected why TikTok's algorithmic feed worked when so many competitors had failed. The argument: TikTok had separated content discovery from social graphs, making the algorithm itself the primary distribution mechanism rather than relying on who you follow. The series became required reading inside Meta and Snap as they responded with Reels and Spotlight."
      },
      {
        title: "Slow, high-signal writing",
        body: "Wei publishes infrequently — sometimes only two or three pieces a year. He's spoken about this as a deliberate strategy: rather than competing on volume in an attention-saturated landscape, he aims for essays that are still being shared two years after publication. The strategy is countercultural in 2020s media but has built him a uniquely durable audience among operators and investors."
      },
    ],
    advice: [
      { headline: "Status is the underlying product", elaboration: "Users adopt social products because they offer new ways to earn status. Utility is the cover story. If you can't articulate the status surface of your product, you don't yet understand why people would use it." },
      { headline: "Build for the cultural moment, not the market study", elaboration: "Markets shift slowly. Cultural moments shift fast. The best consumer products read the cultural moment correctly and build for it before the market catches up." },
      { headline: "Cultural osmosis as a product surface", elaboration: "Products that get absorbed into culture (lingo, meme formats, references) get distribution for free. Most product teams don't even consider this surface — but the ones that do, like TikTok, dominate." },
      { headline: "Slow, high-signal writing wins", elaboration: "In a saturated information landscape, the durable strategy is to write rarely and well rather than frequently and lightly. Two essays a year that still circulate in two years beat a hundred forgettable posts." },
      { headline: "Read the asymptote, not just the trajectory", elaboration: "Most analyses focus on current growth. The more valuable question is the ceiling — what's the largest version of this business, and how do you know?" },
      { headline: "Bezos-like discipline on growth ceilings", elaboration: "Wei has written about Amazon's habit of identifying invisible asymptotes early. Most teams ship features against the wrong KPI; the best teams identify the metric whose ceiling actually constrains the business." },
    ],
    why_listen: "Strategist-essayist with deep operator background; one of the sharpest cultural-product analysts working today.",
  },
];

export const FOUNDERS_BY_SLUG: ReadonlyMap<string, FounderProfile> = new Map(
  PROFILES.map((p) => [p.slug, p]),
);

export const ALL_PROFILES: ReadonlyArray<FounderProfile> = PROFILES;

export function isDirectoryOnly(profile: FounderProfile): profile is DirectoryOnlyProfile {
  return profile.directory_only === true;
}
