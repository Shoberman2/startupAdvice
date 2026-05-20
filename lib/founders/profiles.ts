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

  // ───────────────────────────────────────────────────────────────────
  // Directory-only founders. Book-author founders whose primary source
  // is a book or lecture series. They do not appear in /panel selection
  // and /with chat is disabled for them. Inline name/era/blog_url required.
  // ───────────────────────────────────────────────────────────────────

  {
    slug: "peter-thiel",
    directory_only: true,
    name: "Peter Thiel",
    era: "PayPal / Palantir / Founders Fund, 1998–present",
    blog_url: "https://founderfund.com",
    company: "PayPal / Palantir / Founders Fund",
    primary_source: "Zero to One (2014) + CS183 Stanford lectures (transcribed)",
    bio: "Co-founded PayPal in 1998, where he led a team that included Elon Musk, Reid Hoffman, Max Levchin, and Jeremy Stoppelman before eBay acquired the company in 2002 for $1.5B. In 2003 he co-founded Palantir Technologies with Alex Karp and others; Palantir later went public in 2020. Founded Founders Fund in 2005, one of the most influential contrarian VC firms of the 2010s with positions in Facebook (Thiel was the first outside investor, putting $500K in for ~10% in 2004), SpaceX, Stripe, and Airbnb. His 2014 book Zero to One — built from his Stanford CS183 lecture series — became the canonical contrarian text on what makes a startup actually new versus merely competitive. He's also operated Thiel Capital, the Thiel Fellowship (which pays people under 22 to skip or drop out of college), and Mithril Capital.",
    notable_stories: [
      {
        title: "The first $500K into Facebook",
        body: "In summer 2004, after meeting Mark Zuckerberg through Reid Hoffman, Thiel invested $500,000 in Facebook for ~10% equity — making him the company's first outside investor. The valuation implied was about $5M. When Facebook went public in 2012 at a $104B valuation, that initial stake had become one of the most profitable VC investments in history. Thiel sold most of his Facebook position around the IPO."
      },
      {
        title: "The PayPal Mafia",
        body: "PayPal's early team became one of the most consequential founding networks in tech. Alumni went on to start or run YouTube (Chad Hurley, Steve Chen, Jawed Karim), LinkedIn (Reid Hoffman), Tesla and SpaceX (Elon Musk), Yelp (Russel Simmons, Jeremy Stoppelman), Palantir (Thiel), Yammer (David Sacks), and many others. Thiel has often pointed to the network density as proof that what matters in a founding team is not just talent — it's that the people stay connected and back each other for decades."
      },
      {
        title: "The contrarian interview question",
        body: "Thiel is famous for asking job candidates and founders 'What important truth do very few people agree with you on?' The question is designed to surface genuine intellectual independence rather than rehearsed contrarianism. Most answers fail. He's described the question as a filter for the kind of unusual perspective that produces actually new companies rather than incremental ones."
      },
      {
        title: "The Thiel Fellowship",
        body: "In 2010, Thiel announced a program paying $100,000 to people under 22 to skip or drop out of college and pursue ambitious projects instead. The fellowship was widely criticized at launch as anti-education; over the next decade fellows founded companies including Figma, Loom, Luminar, and others worth tens of billions in aggregate. The premise — that credentialing is a poor filter for ambition and ability — has aged better than its early critics expected."
      },
    ],
    advice: [
      { headline: "Monopoly is the goal, not the sin", elaboration: "Competition is for losers. The best businesses are ones with no real competitors — markets they invented or expanded so completely that they own them outright." },
      { headline: "Last mover advantage", elaboration: "The goal isn't being first. It's being last — capturing a market position so durable that everyone after you is playing for second place." },
      { headline: "Find the secret", elaboration: "Every great business is built on a secret — something true and important that few others believe. If your idea sounds plausible to everyone in your industry, it probably isn't a secret." },
      { headline: "Start small and monopolize", elaboration: "Dominate a tiny niche entirely before expanding. PayPal started with eBay power-sellers, Facebook with one Ivy League campus. Going broad too soon means being thin everywhere." },
      { headline: "Sales matters as much as product", elaboration: "Most engineers underestimate distribution. A product that sells itself is rare — usually 'sells itself' means someone built a great sales machine that's invisible to outsiders." },
      { headline: "Definite optimism beats indefinite optimism", elaboration: "Believing the future will be better is necessary but not sufficient. You need a specific plan for how. Vague optimism produces nothing." },
      { headline: "Founders are bimodal", elaboration: "The traits that make founders great — intensity, contrarianism, eccentricity — also tend to make them difficult. Don't be surprised when great founders have visible flaws; the same distribution produces both." },
    ],
    why_listen: "The canonical contrarian voice on what makes startups actually new versus merely competitive — with the track record to back it.",
  },

  {
    slug: "ben-horowitz",
    directory_only: true,
    name: "Ben Horowitz",
    era: "Loudcloud / Opsware / a16z, 1999–present",
    blog_url: "https://a16z.com/author/ben-horowitz",
    company: "Loudcloud / Opsware / Andreessen Horowitz",
    primary_source: "The Hard Thing About Hard Things (2014) + What You Do Is Who You Are (2019)",
    bio: "Co-founded Loudcloud with Marc Andreessen in 1999 — an early cloud-services company that survived the dot-com crash by pivoting into enterprise software as Opsware, eventually sold to HP for $1.6B in 2007. In 2009, with Marc Andreessen, he co-founded Andreessen Horowitz (a16z), now one of the largest and most influential VC firms in the world. His 2014 book The Hard Thing About Hard Things is widely regarded as one of the few startup books that addresses the actual day-to-day brutality of running a company in crisis — layoffs, near-bankruptcy, executive disputes — rather than the polished mythology. His 2019 book What You Do Is Who You Are extends the framework into organizational culture, drawing examples from samurai code, Toussaint Louverture, and Shaka Senghor.",
    notable_stories: [
      {
        title: "Loudcloud's near-death IPO",
        body: "In early 2001, Loudcloud was running out of cash with the dot-com bubble collapsing around it. Horowitz and team decided to take the company public anyway in March 2001 as a survival move, against advice from nearly everyone. The IPO priced at $6 (way below the original target), but raised the cash that kept the company alive long enough to pivot into software and eventually become Opsware. The book describes this as the hardest decision of his career."
      },
      {
        title: "The 'I'm CEO, bitch' calling card",
        body: "Horowitz tells the story of meeting with EDS during the Loudcloud pivot. EDS executives were treating him like an irrelevant startup CEO. He produced a business card that simply read 'Ben Horowitz, CEO' and slid it across the table. The moment is shorthand for the calibrated assertiveness he argues is necessary for CEOs in adversarial situations. The book's title is a riff on the broader theme."
      },
      {
        title: "Founding a16z",
        body: "When Horowitz and Andreessen launched a16z in 2009, they made several unconventional choices: they targeted technical founders as the primary customer (not LPs), hired operators rather than analysts as partners, and built a large internal services team to help portfolio companies with hiring, PR, and business development. The model was widely copied by other VC firms in the 2010s."
      },
      {
        title: "Layoffs at Opsware",
        body: "During the Opsware pivot, Horowitz had to lay off about half the company in a single morning. He has written and spoken about the experience — the night before, the speech he wrote, how he told the team, what he said to the people who stayed. The advice has become a touchstone for first-time CEOs facing the same task; he argues the only thing worse than doing layoffs is doing them slowly or dishonestly."
      },
    ],
    advice: [
      { headline: "The struggle is the job", elaboration: "Running a company isn't success punctuated by setbacks. It's setbacks punctuated by occasional success. The CEOs who survive are the ones who learned to function inside the struggle." },
      { headline: "Take care of the people, the products, and the profits — in that order", elaboration: "If you don't take care of the people, none of the rest matters. People build products; products generate profits. Inverting this order has killed more companies than bad markets." },
      { headline: "Tell it like it is", elaboration: "Founders are tempted to soften bad news. Don't. The team can handle the truth and can't handle being lied to. Reputational debt accrues faster than financial debt." },
      { headline: "Wartime CEO vs peacetime CEO", elaboration: "The skills that win in peacetime — process, delegation, broad consensus — actively lose in wartime. The CEOs who can switch modes are rare and disproportionately valuable." },
      { headline: "Hire for strength, not lack of weakness", elaboration: "Most hiring processes optimize for 'no obvious flaws.' That produces middling executives. The exceptional ones have spiky strengths and obvious gaps — and a team that compensates." },
      { headline: "Manage your own psychology", elaboration: "CEOs lose to their own minds more than to the market. Learn to function under conditions where you can't sleep, can't trust anyone, and don't know what to do. That capacity is the real job." },
      { headline: "Culture is what you do, not what you say", elaboration: "Stated values matter less than which behaviors you reward, tolerate, and punish. Culture is the residue of those repeated decisions across years." },
    ],
    why_listen: "The clearest writing on what running a company in actual crisis is like — without the polished mythology.",
  },

  {
    slug: "reid-hoffman",
    directory_only: true,
    name: "Reid Hoffman",
    era: "LinkedIn / Greylock, 2002–present",
    blog_url: "https://www.reidhoffman.org",
    company: "LinkedIn / Greylock Partners",
    primary_source: "Blitzscaling (2018) + Masters of Scale podcast + Impromptu (2023)",
    bio: "Was COO of PayPal in the early 2000s before co-founding LinkedIn in 2002 with Allen Blue, Konstantin Guericke, Eric Ly, and Jean-Luc Vaillant. LinkedIn went public in 2011 and sold to Microsoft in 2016 for $26.2B — making it one of the largest social-media acquisitions in history. Joined Greylock Partners as a partner in 2009 and remains active there, with positions in Airbnb, Convoy, Coda, and many others. Has authored or co-authored several books — The Start-up of You (2012), The Alliance (2014), Blitzscaling (2018), Masters of Scale (2021), and Impromptu (2023, written substantially with GPT-4). His Masters of Scale podcast has interviewed essentially every major modern operator. Also a founding investor and board member at OpenAI.",
    notable_stories: [
      {
        title: "LinkedIn's slow start",
        body: "LinkedIn launched in May 2003 and grew slowly for years — Hoffman has written that they had about 4,500 members after the first month, well below expectations. The team kept iterating on the value proposition: was it for jobs, networking, or knowledge? It wasn't until invitations-by-email and the 'how you're connected' feature shipped that growth inflected. The story is now Hoffman's canonical example of why early traction is often misread."
      },
      {
        title: "Backing OpenAI early",
        body: "Hoffman was an early board member and supporter of OpenAI starting around 2015, when most observers regarded AI as a niche research field. He used his platform — speeches, books, and the Masters of Scale podcast — to push the case for AI as a major economic force years before the ChatGPT moment. His 2023 book Impromptu was written largely in dialogue with GPT-4 and was one of the earliest mainstream books about LLMs by a major founder."
      },
      {
        title: "The Microsoft acquisition",
        body: "In June 2016, Microsoft acquired LinkedIn for $26.2B, one of the largest tech acquisitions ever. The deal kept LinkedIn operating semi-independently under CEO Jeff Weiner. Hoffman has written about why he sold rather than continued as an independent public company: scale was getting harder, and Microsoft offered both capital and distribution that would have taken LinkedIn years to build alone."
      },
      {
        title: "The Stanford 'Blitzscaling' class",
        body: "Hoffman co-taught a Stanford class on Blitzscaling in 2015 — the rapid-scaling playbook that hyper-growth companies use, with all its tradeoffs. The class became the basis for his 2018 book. The framework has been both widely adopted and criticized — the criticism being that it normalizes burnout and shortcut-taking that don't always pay off. Hoffman has acknowledged the tradeoffs but argues that for winner-take-most markets, the math forces the bet."
      },
    ],
    advice: [
      { headline: "If you're not embarrassed by your first product, you launched too late", elaboration: "Perfection is the enemy of shipping. The market gives you information you can't get from any amount of internal review." },
      { headline: "Blitzscale when the market is winner-take-most", elaboration: "Most markets reward speed over efficiency only when network effects compound. Identify which type of market you're in before choosing the playbook." },
      { headline: "Network is the leverage", elaboration: "Most founder advantage comes from the people they can quickly mobilize — for advice, hiring, customers. Networks compound over decades; treat them as your most important asset." },
      { headline: "Compete by playing your own game", elaboration: "Beating the incumbent at their game is brutal. Find a wedge where the rules are different — a new platform, a new use case, a new pricing model — and run on that vector." },
      { headline: "Theory plus action, not theory or action", elaboration: "Pure theorists never ship; pure tacticians never see the whole. The best operators do both — read deeply, then move fast on what they read." },
      { headline: "Invest in the messy middle", elaboration: "Founders get plenty of advice on starting up and on the exit. The years between — when scale is hard but the company isn't optimized yet — is where most of the actual work happens." },
    ],
    why_listen: "Has been at the center of every major social-platform wave from PayPal to LinkedIn to OpenAI, with the writing and podcast to back the pattern-matching.",
  },

  {
    slug: "phil-knight",
    directory_only: true,
    name: "Phil Knight",
    era: "Blue Ribbon Sports / Nike, 1964–2004 (Chairman through 2016)",
    blog_url: "https://about.nike.com",
    company: "Nike",
    primary_source: "Shoe Dog (2016) — memoir",
    bio: "Co-founded Blue Ribbon Sports in 1964 with his University of Oregon track coach Bill Bowerman as a side hustle importing Japanese running shoes (Onitsuka Tigers) to sell out of his car at track meets. Renamed the company Nike in 1971 and built it into one of the most globally recognized brands in history. Nike went public in 1980; Knight served as CEO until 2004 and Chairman until 2016. His 2016 memoir Shoe Dog covers the early years (1962–1980) — the obsessive period of bootstrapping, near-bankruptcies, lawsuits with Onitsuka, and the cultural construction of Nike. The book is unusual for a major-CEO memoir in how raw it is about doubt, failure, and the personal costs of building. He has also been a major philanthropist (Knight Cancer Institute, University of Oregon, Stanford GSB).",
    notable_stories: [
      {
        title: "The Onitsuka lawsuit",
        body: "Blue Ribbon Sports's business model depended on importing Tiger shoes from Onitsuka in Japan. By 1971, the relationship was deteriorating — Onitsuka was selling to other US distributors despite Knight's exclusive agreement. The breaking point came when Knight discovered Onitsuka representatives plotting to acquire Blue Ribbon. He scrambled to launch the Nike brand with new shoes manufactured in Mexico, then survived a brutal lawsuit. The episode forced Nike into existence."
      },
      {
        title: "The crazy idea",
        body: "Shoe Dog opens with Knight describing his 'crazy idea' — that Japanese running shoes could be sold in the United States by an American who knew running. The idea came out of a Stanford business school paper he wrote in 1962. He spent years convincing his father to fund the trip to Japan to pitch Onitsuka, and the entire Nike story stems from that single uncertain bet by a 24-year-old runner."
      },
      {
        title: "Going public to survive",
        body: "By the late 1970s Nike was profitable but starved for capital, and Knight resisted going public for years — partly because he didn't want to lose control. In 1980 he finally took the company public to fund the international expansion. The IPO valued the company at $429M. By 2024 Nike was worth over $100B. He has written about the public-vs-private tradeoff as one of the hardest founder choices he ever made."
      },
      {
        title: "Naming Nike",
        body: "The original name 'Blue Ribbon Sports' was a placeholder. When the team needed a new name in 1971, Jeff Johnson (Nike's first employee) suggested 'Nike,' the Greek goddess of victory. Knight has admitted he wasn't enthusiastic — he wanted to call it 'Dimension Six.' He went with Nike because they needed to file paperwork the next day. The swoosh logo cost $35 from a Portland State graphic design student."
      },
    ],
    advice: [
      { headline: "Let it ride", elaboration: "Knight's father's advice to him on starting Blue Ribbon: don't sweat the small reverses; commit to the journey and let it ride. Most founders quit one bad year before the curve inflects." },
      { headline: "Hire people who love the thing", elaboration: "Nike's early hires were runners. They didn't need to be sold on the mission because they lived it. The depth of conviction in early hires set the standard for everyone who came later." },
      { headline: "Cash is everything", elaboration: "Nike survived several near-deaths because Knight protected cash flow obsessively. Growth without cash is just slower bankruptcy." },
      { headline: "Brand is built one decade at a time", elaboration: "The Nike brand wasn't built by a 1988 'Just Do It' campaign. It was built by 25 years of consistent design, consistent storytelling, and consistent product before that campaign could land." },
      { headline: "Take the meeting", elaboration: "Knight constantly emphasizes that random meetings — with track coaches, with shoe-factory managers, with bankers — created the unexpected breakthroughs Nike needed. Calendar discipline is real; so is staying open to chance." },
      { headline: "Don't quit", elaboration: "Knight's most-repeated advice. Most founders don't lose to the market; they lose to fatigue. The ones who win are usually the ones who couldn't bring themselves to stop." },
    ],
    why_listen: "Built one of the most globally recognized brands in history; the memoir is the most honest account of the early grind by any major CEO.",
  },

  {
    slug: "andrew-grove",
    directory_only: true,
    name: "Andrew Grove",
    era: "Intel, 1968–2005",
    blog_url: "https://en.wikipedia.org/wiki/Andrew_Grove",
    company: "Intel",
    primary_source: "High Output Management (1983) + Only the Paranoid Survive (1996) + Swimming Across (2001)",
    bio: "Born András István Gróf in Budapest in 1936. Survived Nazi occupation as a child, fled Hungary after the 1956 uprising, and made his way to the US, earning a PhD in chemical engineering from Berkeley in 1963. Joined the new Intel Corporation in 1968 as employee #3, behind Robert Noyce and Gordon Moore. Became President in 1979, CEO in 1987, and Chairman in 1998. Steered Intel through the brutal pivot out of memory chips and into microprocessors in the mid-1980s — one of the most consequential strategic moves in business history. Time named him Man of the Year in 1997. His books — High Output Management (1983), Only the Paranoid Survive (1996), and his memoir Swimming Across (2001) — are widely considered among the most useful management writing ever published. Grove died in 2016.",
    notable_stories: [
      {
        title: "Walking through the revolving door",
        body: "In 1985, Intel's memory chip business was being destroyed by Japanese competitors. Grove asked Gordon Moore: 'If we got kicked out and the board brought in a new CEO, what do you think he would do?' Moore answered: 'He would get us out of memories.' Grove replied: 'Why shouldn't you and I walk out the door, come back in, and do it ourselves?' That conversation — recounted in Only the Paranoid Survive — is now the canonical example of how to recognize and act on a strategic inflection point."
      },
      {
        title: "The Pentium FDIV bug",
        body: "In 1994, a math professor reported a floating-point division bug in Intel's Pentium chips. Intel's initial response — to argue that the bug was statistically rare and most users wouldn't encounter it — became a public relations disaster. Grove eventually reversed course and offered to replace any affected chip, costing Intel about $475M. He wrote about the episode publicly as one of the worst handled moments of his career and a lesson in crisis management."
      },
      {
        title: "The making of High Output Management",
        body: "Grove wrote High Output Management in 1983 not because he wanted to be a writer, but because he wanted Intel's middle managers to operate from a shared framework. The book introduces concepts that have become standard — managerial leverage, one-on-ones, task-relevant maturity, the idea that a manager's output is the output of their team and the teams they influence. It remains one of the most-recommended management books in tech."
      },
      {
        title: "OKRs from Intel to Google",
        body: "John Doerr learned the OKR (Objectives and Key Results) system while working at Intel under Grove in the 1970s. Doerr later brought OKRs to Google as an early investor, and from there they spread to LinkedIn, Twitter, and thousands of other companies. The Grove → Doerr → Page/Brin lineage is now one of the most copied management frameworks in the world."
      },
    ],
    advice: [
      { headline: "Only the paranoid survive", elaboration: "Successful companies don't get killed by their visible competitors. They get killed by changes they didn't see coming. Active paranoia — scanning for what might break the business — is a defensive practice, not pessimism." },
      { headline: "Recognize strategic inflection points", elaboration: "Every business goes through moments where the rules quietly change. Most CEOs notice these too late. The ones who survive are the ones who can name them when they're happening." },
      { headline: "A manager's output is the team's output", elaboration: "Managers should be measured by the leverage they create through others, not by their personal heroics. Most management dysfunction comes from confusing the two." },
      { headline: "Hold one-on-ones", elaboration: "Regular structured one-on-ones with direct reports are the single highest-leverage activity for a manager. They cost an hour and create dozens of hours of correctly-directed work." },
      { headline: "Knowledge workers need clarity", elaboration: "You can't supervise knowledge work the way you supervise factory work. The only meaningful management tool is making goals so clear that workers can self-correct." },
      { headline: "Constructive confrontation", elaboration: "Intel's culture under Grove demanded that disagreements be surfaced explicitly in meetings, not after them. Suppressing disagreement to be polite is more expensive than the discomfort of working it out in real time." },
    ],
    why_listen: "The strategist who steered Intel through the most successful pivot in business history, and the most useful operational writing in tech.",
  },

  {
    slug: "reed-hastings",
    directory_only: true,
    name: "Reed Hastings",
    era: "Pure Software / Netflix, 1991–2023",
    blog_url: "https://about.netflix.com/en/leadership/reed-hastings",
    company: "Pure Software / Netflix",
    primary_source: "No Rules Rules (2020, with Erin Meyer) + Freedom & Responsibility deck (2009)",
    bio: "Co-founded Pure Software in 1991, which sold to Rational Software in 1995. Co-founded Netflix in 1997 with Marc Randolph, originally as a DVD-by-mail service. Pivoted Netflix to streaming in 2007 — one of the most consequential strategic pivots in modern media — and then to original content production starting with House of Cards in 2013. Stepped down as CEO in January 2023, taking the Executive Chairman role and handing co-CEO duties to Ted Sarandos and Greg Peters. His 2009 'Freedom & Responsibility' deck (often called the Netflix Culture Deck) was downloaded by millions and reshaped how Silicon Valley talked about culture. His 2020 book No Rules Rules, co-authored with INSEAD professor Erin Meyer, is the definitive articulation of the Netflix management philosophy.",
    notable_stories: [
      {
        title: "The Pure Software lesson",
        body: "Hastings has written that Pure Software taught him what NOT to do: as the company grew, he watched bureaucracy accumulate — process, sign-offs, approvals — until innovation slowed. He sold Pure in 1995 and resolved that whatever he built next would resist this default. The lesson became the foundation for Netflix's deliberately rule-light culture."
      },
      {
        title: "The $40 late fee that birthed Netflix",
        body: "Hastings has told the story (which Marc Randolph has gently disputed) of returning Apollo 13 to Blockbuster six weeks late and being charged a $40 late fee. The episode reportedly prompted him to wonder why video rentals couldn't work like a gym membership — subscription-based, no per-rental penalties. The story may be partly apocryphal but the subscription model it inspired was real."
      },
      {
        title: "The 2011 Qwikster catastrophe",
        body: "In July 2011, Hastings announced that Netflix would split into two services: Netflix for streaming, and 'Qwikster' for DVDs. Customers revolted, the stock dropped ~75%, and Hastings reversed the decision within three weeks. He wrote a public apology and walked the company back. The episode is now his canonical example of a CEO mistake — and of how to recover from one."
      },
      {
        title: "The Freedom & Responsibility deck",
        body: "In 2009 Hastings and former CHRO Patty McCord published Netflix's internal culture deck — 'Reference Guide on Our Freedom & Responsibility Culture.' It included radical positions like 'adequate performance gets a generous severance package' and 'we hire and reward people for judgment, not following process.' The deck was downloaded over 20 million times and became a foundational document for Silicon Valley's culture wars of the 2010s."
      },
      {
        title: "Cancelling traditional vacation policy",
        body: "Netflix eliminated formal vacation tracking around 2004. Employees take time off when they need it; managers are expected to model good behavior. Hastings has written that the policy works because it forces alignment around outcomes rather than presence. Many companies have copied the policy with mixed results; Hastings argues those failures come from copying the policy without copying the surrounding culture."
      },
    ],
    advice: [
      { headline: "Talent density beats process", elaboration: "Most companies add process to compensate for talent gaps. A company of A-players doesn't need most of those processes — and is dramatically more effective without them." },
      { headline: "Pay top of personal market", elaboration: "Compensate the best people what they're worth on the open market, not at internal-equity bands. Underpaying top talent is more expensive than overpaying it." },
      { headline: "Keeper test", elaboration: "Periodically ask: if this person were leaving for another job, would I fight to keep them? If not, give them a generous severance and free the seat. Adequate performance gets a package, not a promotion." },
      { headline: "Context, not control", elaboration: "Managers should provide context (strategy, goals, constraints) and let smart people decide how to execute. Control breeds dependency; context produces judgment." },
      { headline: "Disagree out loud, then commit", elaboration: "Open disagreement in meetings is healthy. Silent dissent after a decision is corrosive. Netflix's culture demands the former and explicitly rejects the latter." },
      { headline: "Don't seek to please your boss", elaboration: "Optimize for what's best for the business, not what your boss wants to hear. Bosses are wrong often. The org gets dumber if everyone hides that fact." },
    ],
    why_listen: "Built one of the most-copied modern management systems and pivoted Netflix three times across thirty years without losing the company.",
  },

  {
    slug: "eric-ries",
    directory_only: true,
    name: "Eric Ries",
    era: "IMVU / Lean Startup, 2004–present",
    blog_url: "https://leanstartup.co",
    company: "IMVU / Lean Startup Co.",
    primary_source: "The Lean Startup (2011) + The Startup Way (2017)",
    bio: "Co-founded IMVU in 2004 — a 3D avatar-based chat platform that eventually scaled to millions of users. From that experience (and his subsequent work as a startup advisor), he developed and popularized the Lean Startup methodology, which combined customer development (from Steve Blank) with lean manufacturing principles (from Toyota's TPS) to create a framework for early-stage product development under uncertainty. His 2011 book The Lean Startup became one of the best-selling startup books ever — translated into 30+ languages, taught in essentially every business school, and shaping how a generation of founders thought about MVPs, pivot/persevere decisions, and validated learning. His 2017 follow-up The Startup Way extended the framework to large enterprises. He has also pushed for governance reforms (including a Long-Term Stock Exchange he founded in 2019).",
    notable_stories: [
      {
        title: "Failing at IMVU first",
        body: "IMVU's first product was built in stealth for six months — a serious investment of time and engineering — and the team launched it confident customers would love it. Almost nobody used it as designed. Ries has written that this was the experience that forced him to take customer development seriously. Most of what they had built was discarded; the actually-used version emerged from iterated experiments with real users."
      },
      {
        title: "The minimum viable product",
        body: "Ries did not invent the term 'minimum viable product' — Frank Robinson coined it earlier — but he popularized it through The Lean Startup. The framing was specific: an MVP is not a small product; it's the smallest experiment that lets you learn something validated about whether the business will work. Many companies confused the term to mean 'small product,' which Ries has spent years correcting."
      },
      {
        title: "Pivot or persevere",
        body: "The 'pivot' as a startup term originates with Ries. He defined it carefully — a structured course-correction designed to test a new fundamental hypothesis — distinct from random direction-changing. The 'pivot or persevere' framework, decided on a regular cadence, became standard operating practice for early-stage companies post-2011."
      },
      {
        title: "Founding the Long-Term Stock Exchange",
        body: "In 2019, Ries founded the LTSE — a stock exchange explicitly designed for companies committed to long-term decision-making, with rules that reward long-tenured shareholders and require additional disclosure. The first companies listed in 2020. The premise: public-market pressure forces short-termism that destroys long-term value. The LTSE was an attempt to create a structural alternative."
      },
    ],
    advice: [
      { headline: "Build–measure–learn", elaboration: "The fastest feedback loop wins. Build the smallest experiment, measure the result, learn, repeat. Most founders spend too long in 'build' and not enough in 'learn.'" },
      { headline: "Vanity metrics will kill you", elaboration: "Total signups, total visits, total downloads — these feel like progress and aren't. Cohort retention, activation rate, paid conversion — these tell you whether the product is actually working." },
      { headline: "Validated learning is the unit of progress", elaboration: "Not feature ships, not lines of code — what did you learn that's true about your customers? Every sprint should produce a piece of validated learning." },
      { headline: "Pivot when the data says to", elaboration: "Persevere when the metrics are moving in the right direction. Pivot when they aren't and you've eliminated execution as the cause. Most founders pivot too late, not too early." },
      { headline: "Customer development before product development", elaboration: "Talk to customers, watch them use products (yours or competitors'), and validate the problem before building the solution. The expensive mistakes happen when you skip this step." },
      { headline: "Long-term thinking needs long-term structure", elaboration: "Public companies optimize quarterly because that's what their market structure rewards. Building a long-term company requires deliberately structuring out the short-term incentives — through governance, capital structure, and culture." },
    ],
    why_listen: "Synthesized the methodology that shaped how an entire generation of startups built their first products.",
  },

  {
    slug: "marc-andreessen",
    directory_only: true,
    name: "Marc Andreessen",
    era: "Netscape / Loudcloud / a16z, 1994–present",
    blog_url: "https://pmarca.substack.com",
    company: "Netscape / Andreessen Horowitz",
    primary_source: "Pmarchive (2007 blog, archived) + 'Why Software Is Eating the World' (2011) + Techno-Optimist Manifesto (2023)",
    bio: "Co-created the Mosaic web browser at the NCSA at the University of Illinois in 1993 — the first widely-used graphical web browser. Co-founded Netscape Communications with Jim Clark in 1994; the company IPO'd in 1995 in what's often regarded as the symbolic start of the dot-com era. Sold Netscape to AOL in 1999. Co-founded Loudcloud / Opsware with Ben Horowitz (1999), then co-founded Andreessen Horowitz (a16z) with Horowitz in 2009. His 2007 'pmarchive' blog set the early template for VC blogging. His 2011 Wall Street Journal essay 'Why Software Is Eating the World' became the canonical short-form articulation of the software/SaaS investment thesis. His 2023 'Techno-Optimist Manifesto' was a major and divisive statement of his current public positioning.",
    notable_stories: [
      {
        title: "Mosaic and the birth of the consumer web",
        body: "At 22, working at the National Center for Supercomputing Applications, Andreessen co-led the team that built Mosaic — the first widely-distributed web browser to render images inline with text. Before Mosaic, the web was a text-only academic tool. After Mosaic, it was the consumer internet. Within a year, the team had been recruited by Jim Clark to launch what became Netscape."
      },
      {
        title: "Netscape's IPO",
        body: "On August 9, 1995, Netscape went public at $28 a share and closed the day at $58, briefly valuing the 16-month-old company at $2.9B with no profits. The IPO is widely cited as the symbolic start of the dot-com era — the moment when the public market began treating internet companies as a category worth more than their fundamentals justified."
      },
      {
        title: "'Why Software Is Eating the World'",
        body: "In August 2011, Andreessen published a Wall Street Journal op-ed arguing that software companies were taking over economic sectors at an accelerating rate — and that the trend would continue for decades. The essay became one of the most-cited pieces of investment writing of the 2010s and the implicit thesis behind a16z's investment strategy. It also aged well: most of the verticals he named (media, finance, retail, healthcare) have been substantially restructured by software in the decade since."
      },
      {
        title: "Founding a16z",
        body: "In 2009, Andreessen and Ben Horowitz launched Andreessen Horowitz with a different model than traditional Sand Hill VC: technical founders as the primary customer, hired operators (not analysts) as partners, a large in-house services arm. The firm grew rapidly through the 2010s and became one of the largest VC firms in the world by AUM. Many of its operational moves were widely copied by competitors."
      },
      {
        title: "The Techno-Optimist Manifesto",
        body: "In October 2023, Andreessen published a roughly 5,000-word 'Techno-Optimist Manifesto' arguing for technology as the unambiguous force for human flourishing. The document was widely read and widely criticized — admirers saw a needed counter to techno-pessimism; critics saw a sweeping defense of unaccountable industry. The piece marked a sharp public turn in his political and rhetorical positioning."
      },
    ],
    advice: [
      { headline: "Software is eating the world", elaboration: "Almost every industry is being restructured by software, and the timeline is decades, not quarters. The companies that win in any vertical will increasingly look like software companies first." },
      { headline: "The market is the most important factor", elaboration: "Great teams in bad markets lose to mediocre teams in great markets. The single biggest determinant of startup outcome is the size and trajectory of the market." },
      { headline: "Strong opinions, strongly held", elaboration: "VCs and founders both win by having clear theses they're willing to defend in public. Vague positioning loses to specific positioning across decades." },
      { headline: "Distribution is harder than product", elaboration: "Most engineers underestimate the difficulty of getting a great product in front of users. Distribution channels are the actual competitive moat for most businesses." },
      { headline: "Build the infrastructure layer", elaboration: "The most durable software companies sell to developers, not consumers. Tools and infrastructure compound; consumer products churn." },
      { headline: "Cycle through fear and greed slowly", elaboration: "Markets oscillate. The best operators are the ones who can act counter-cyclically — invest during fear, harvest during greed — without flipping on every quarterly headline." },
    ],
    why_listen: "Has been at the technical and intellectual center of essentially every major internet wave from 1993 to today — with the writing to back the pattern-matching.",
  },

  {
    slug: "bill-gurley",
    directory_only: true,
    name: "Bill Gurley",
    era: "Benchmark, 1999–2020 (Partner Emeritus)",
    blog_url: "https://abovethecrowd.com",
    company: "Benchmark Capital",
    primary_source: "Above the Crowd — abovethecrowd.com (1996–present)",
    bio: "Joined Benchmark Capital as a general partner in 1999 after early career as a sell-side analyst at Hambrecht & Quist and Deutsche Bank. Led Benchmark's investments in OpenTable, Zillow, GrubHub, Uber, NextDoor, and many others. Stepped back to Partner Emeritus role at Benchmark in 2020. Has written 'Above the Crowd' — one of the longest-running active VC blogs on the internet, dating back to 1996 — with deep posts on unit economics, take-rate analysis, marketplace dynamics, public-market pricing, and SaaS metrics. Was at the center of the high-profile Uber boardroom dispute that led to Travis Kalanick's removal as CEO in 2017. Stands 6'9\".",
    notable_stories: [
      {
        title: "The Uber boardroom crisis",
        body: "In June 2017, after a series of internal crises at Uber (sexual-harassment lawsuit, executive misconduct, criminal probes), a small group of Benchmark partners including Gurley and several other investors pushed for Travis Kalanick's removal as CEO. The standoff played out in extraordinary public detail, ending with Kalanick's resignation and an eventual lawsuit Benchmark filed (and then dropped) over Kalanick's board seats. The episode became a defining moment in VC-founder conflict."
      },
      {
        title: "OpenTable's seventeen-year journey",
        body: "Gurley invested in OpenTable in 2000. The company struggled through the dot-com crash, survived, slowly built network effects with restaurants and diners, went public in 2009, and was acquired by Booking.com in 2014 for $2.6B. The total time from initial investment to exit was about 14 years — a touchstone in Gurley's writing about how marketplace investments require unusual patience."
      },
      {
        title: "The 'All-Revenue-Is-Not-Created-Equal' essay",
        body: "In 2011 Gurley published a now-canonical post on his blog dissecting why investors should treat different kinds of revenue with different multiples — recurring subscription revenue vs marketplace take-rate vs one-time hardware sales vs ad revenue. The essay became foundational reading for both founders and public-market analysts. Many similar pieces from later writers cite it directly."
      },
      {
        title: "Calling the unicorn correction",
        body: "Starting around 2014, Gurley publicly warned that late-stage private valuations were detached from economic fundamentals. He coined or popularized phrases like 'risk free no more' (about Uber) and was widely seen as the most credible bear voice in mainstream tech VC. The 2022–2023 correction in private valuations — exactly the kind he had predicted — vindicated his thesis. He used the moment to write extensively about why."
      },
    ],
    advice: [
      { headline: "All revenue is not created equal", elaboration: "Recurring subscription revenue trades at a higher multiple than marketplace take, which trades higher than hardware. Founders who don't understand which type they have can't price their business properly." },
      { headline: "Unit economics or nothing", elaboration: "Every business eventually has to make positive unit economics work. Companies that postpone the question by raising larger rounds are postponing a reckoning, not avoiding it." },
      { headline: "Marketplaces are slow", elaboration: "Network effects in two-sided marketplaces compound, but they compound over many years. Founders who expect marketplace velocity to match SaaS velocity are setting themselves up for forced exits." },
      { headline: "Power-law returns require power-law conviction", elaboration: "VCs win by holding through volatility that would force most operators to sell. The discipline is psychological as much as analytical." },
      { headline: "Public markets eventually win", elaboration: "Late-stage private valuations can deviate from public-market math for years, but eventually the gap closes — usually painfully. Don't mistake a deviation for a new permanent regime." },
      { headline: "Tell the truth to founders", elaboration: "VCs add value primarily by being honest brokers — by telling founders what they don't want to hear, calibrated to the situation. Most don't. The few who do are sought after." },
    ],
    why_listen: "The most analytically rigorous public voice on unit economics, marketplace dynamics, and pricing — with the call record to back it.",
  },

  {
    slug: "tony-hsieh",
    directory_only: true,
    name: "Tony Hsieh",
    era: "LinkExchange / Zappos, 1996–2020",
    blog_url: "https://en.wikipedia.org/wiki/Tony_Hsieh",
    company: "LinkExchange / Zappos",
    primary_source: "Delivering Happiness (2010)",
    bio: "Co-founded LinkExchange in 1996, an ad-network startup that sold to Microsoft in 1998 for $265M when Hsieh was 24. Joined the founding team of Zappos in 1999 (originally called ShoeSite.com) as an investor, then as CEO. Built Zappos into a billion-dollar online shoe retailer with a famously customer-obsessed culture — including 365-day returns, free shipping both ways, and 24/7 customer service that emphasized 'WOW' moments over call efficiency. Amazon acquired Zappos in 2009 for $1.2B in stock. His 2010 book Delivering Happiness articulated his philosophy of company-building as happiness-engineering — for customers, for employees, and for the broader community. He led the Downtown Project — an attempt to revitalize downtown Las Vegas — from 2011 onward. Hsieh died in November 2020 at age 46 from injuries sustained in a fire.",
    notable_stories: [
      {
        title: "Selling LinkExchange while regretting it",
        body: "Hsieh sold LinkExchange to Microsoft in 1998 for $265M, but he later wrote in Delivering Happiness that he wasn't enjoying the company by the end — culture had eroded, hiring had gotten loose, and going to the office had become a chore. The experience shaped his obsession at Zappos with culture as the central operating system of the company. The Zappos culture infrastructure is essentially the inverse of what LinkExchange became."
      },
      {
        title: "Paying new hires to quit",
        body: "Zappos famously offered new hires $2,000 to quit at the end of their first week of training. The premise: anyone willing to take the money wasn't committed enough to deliver the kind of customer service Zappos needed. The offer was widely copied. About 2-3% of new hires took it; the rest were demonstrably more committed afterward."
      },
      {
        title: "The Amazon acquisition",
        body: "In 2009, Amazon acquired Zappos for $1.2B in stock. Hsieh negotiated unusual terms: Zappos would operate independently, retain its culture and leadership, and Hsieh would continue as CEO. He has written that the deal was structured this way because he was convinced Amazon's culture would otherwise overwrite Zappos's. The arrangement largely held until his eventual departure."
      },
      {
        title: "The Downtown Project",
        body: "In 2011, Hsieh moved Zappos's headquarters to downtown Las Vegas and committed $350M of his own money to revitalizing the surrounding neighborhood through the Downtown Project — funding small businesses, restaurants, tech startups, a music festival, and other civic infrastructure. The effort had mixed results: it brought genuine vitality to the area but suffered from internal management problems and lost significant money. The story is one of the most ambitious modern attempts at founder-led urban renewal."
      },
    ],
    advice: [
      { headline: "Culture is the product", elaboration: "Customer experience is a function of employee experience. The fastest way to scale customer happiness is to obsess over employee happiness first." },
      { headline: "Hire for culture fit", elaboration: "Zappos hired primarily for cultural alignment, even when it meant rejecting otherwise-qualified candidates. The math: a mis-hire on culture costs far more than a missed hire on competence." },
      { headline: "Pay people to quit", elaboration: "The offer-to-quit filter works because it's a credible signal of commitment. People who pass it are demonstrably more invested than people who don't have to make the choice." },
      { headline: "Be willing to make less in the short term", elaboration: "Zappos's customer service decisions (365-day returns, free shipping, no call-time limits) cost real money in the short term. They paid back in retention and word-of-mouth over years. Don't optimize quarterly metrics that destroy decade returns." },
      { headline: "WOW is a strategy, not a slogan", elaboration: "Every customer interaction is a chance to do something genuinely surprising — beyond expectations, beyond policy if needed. Most companies say they want this; almost none actually build the org structure that allows it." },
      { headline: "Happiness is the underlying business", elaboration: "Companies that figure out how to make their customers, employees, and communities happier in measurable ways tend to compound. The framing isn't soft — it's an operational discipline applied to harder-to-measure variables." },
    ],
    why_listen: "Built one of the most-cited customer-experience cultures in modern retail, and articulated it more clearly than anyone else has.",
  },
];

export const FOUNDERS_BY_SLUG: ReadonlyMap<string, FounderProfile> = new Map(
  PROFILES.map((p) => [p.slug, p]),
);

export const ALL_PROFILES: ReadonlyArray<FounderProfile> = PROFILES;

export function isDirectoryOnly(profile: FounderProfile): profile is DirectoryOnlyProfile {
  return profile.directory_only === true;
}
