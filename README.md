# Founder Panel

**Source-grounded startup office hours for Claude Code.**

Founder Panel is two open-source Claude Code skills backed by URL indexes for 43 founders and investors and 3,436 public essays and posts:

- `/founder-conversation` — choose one person for a focused, cited conversation.
- `/board-room` — seat 2–5 people for openings, cross-examination, and synthesis.

There is no hosted AI product, account, payment flow, or database. The website in this repository is the installation landing page.

## Install

Prerequisites: [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), [Git](https://git-scm.com/), and [Bun](https://bun.sh/).

```bash
git clone https://github.com/Shoberman2/startupAdvice.git founder-panel
cd founder-panel
bun install
claude
```

Claude Code discovers the project skills automatically. Run either command:

```text
/founder-conversation
/board-room
```

You can also select people directly:

```text
/founder-conversation paul-graham Should we stay bootstrapped?
/board-room naval, garry-tan, patrick-collison Our distribution is founder-led. What breaks next?
```

## What the commands do

Both commands:

- let you browse the complete generated roster;
- create or reopen a private Markdown idea memo in `ideas/`;
- retrieve only the selected person's public-source index;
- read relevant canonical pages with WebFetch, or local research copies when available;
- include canonical links and short verified quotations;
- say when the sources do not support an answer instead of inventing one;
- save takeaways, questions, agreements, and dissents back to the idea memo; and
- disclose that the response is an AI synthesis, not the real person.

`/board-room` keeps each member's evidence separate. A member cannot borrow another member's corpus to support a claim.

## Optional local corpus

The committed indexes are enough to use the commands immediately. To create private local research copies for faster retrieval and offline reuse:

```bash
bun run founders:corpus
```

This politely fetches public pages, respects `robots.txt`, and writes full text under `.claude/founders-corpus/`. Full-text copies are gitignored and must not be redistributed.

Build one person only:

```bash
bun run founders:corpus --only paul-graham
```

## Verify

```bash
bun run founders:validate:release  # clean-clone/index-only contract
bun run founders:validate          # also checks local full-text copies when present
bun test                           # scraper regression tests
bun run build                      # landing-page production build
```

## Repository shape

```text
.claude/
  skills/
    founder-conversation/SKILL.md
    board-room/SKILL.md
  founders-corpus/
    ROSTER.md
    <slug>/INDEX.md
app/                         # one-page installation website
data/founder-sources.ts      # public source registry
lib/scrape/                  # optional local corpus builders
scripts/                     # corpus build + integrity validation
```

## Legal and privacy posture

Founder Panel produces AI syntheses grounded in public writing. It is not affiliated with, endorsed by, or speaking on behalf of any featured person or company.

- The repository distributes source metadata—titles, canonical URLs, dates, and word counts—not copies of the underlying writing.
- Generated full-text corpora and user idea memos are private and gitignored.
- Quotes are limited to 10–25 consecutive words, with no more than 25 words from one source per reply.
- Every substantive claim links to the original public source.
- Source owners can request removal by opening an issue.

## Portrait credits

Landing-page portraits are used under their Wikimedia Commons licenses:

- Paul Graham — Sarah Harlin, [public domain](https://commons.wikimedia.org/wiki/File:Paulgraham_240x320.jpg)
- Naval Ravikant — Edmund Hillary Fellowship, [CC BY 3.0](https://commons.wikimedia.org/wiki/File:Naval2019.png)
- Garry Tan — Web Summit, [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Garry_Tan,_Web_Summit_2018,_November_6_SD5_6949_(45700698642)(portrait_4x3_crop).jpg)
- Patrick Collison — JD Lasica, [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Patrick_Collison.jpg)

## License

[GNU AGPLv3](./LICENSE)
