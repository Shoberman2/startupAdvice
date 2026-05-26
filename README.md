# Founder Panel

**An AI research agent for founder advice, grounded in public sources.**

A web app that asks an AI agent to research public writing by founders selected from a founder corpus (PG, Naval, Jason Fried, Patrick Collison, Sam Altman, Fred Wilson, Sahil Lavingia, Garry Tan, and others). It returns source-backed advice with citations that link back to the exact paragraph in the source essay. It does not contact, impersonate, or imply endorsement by the founders.

Built with Next.js App Router on Vercel, AI SDK v6, Anthropic Claude Sonnet 4.6 via AI Gateway, Neon Postgres with pgvector.

## Quick start

```bash
# 1. Install
bun install

# 2. Env vars — copy and fill in
cp .env.example .env.local
# DATABASE_URL (Neon postgres URL)
# AI_GATEWAY_API_KEY (Vercel AI Gateway)

# 3. Run the migration
psql $DATABASE_URL < db/migrations/0001_initial.sql

# 4. Scrape + embed the corpus (~10-30 minutes depending on rate limits)
bun run scrape

# 5. Dev server
bun run dev
# open http://localhost:3000
```

## Architecture

```
                    User types question → click "Ask the panel"
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │  POST /api/panel/select      │
                    │  - embed question (cached    │
                    │    in question_embeddings)   │
                    │  - pgvector HNSW search      │
                    │  - rank authors by max sim   │
                    │  - filter < 0.55 threshold   │
                    └──────────────┬───────────────┘
                                   │
                  returns {author_slugs[5], question_hash}
                                   │
                                   ▼
                Client opens 5 parallel fetch streams
                                   │
        ┌──────────┬───────────┬───┴───────┬──────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼
   /api/panel/  /api/panel/  /api/panel/  /api/panel/  /api/panel/
   [pg]         [naval]      [jfried]     [collison]   [garry]
        │          │           │           │          │
   ─────┴──────────┴───────────┴───────────┴──────────┴─────
   Each route:
   - load embedding from question_embeddings by hash
   - retrieve top-8 author chunks via pgvector
   - persona system prompt + chunks → streamObject(Sonnet 4.6)
   - schema: { retrieved[], weighing, answer, opted_out? }
   - on finish: citation validation (fail-closed)
   - record spend in spend_tracker
```

## Project layout

```
app/
├── page.tsx                    # Pre-question landing (wordmark, claim, input, pinned questions)
├── panel/
│   ├── page.tsx                # Active panel page (server shell)
│   └── PanelClient.tsx         # Client orchestrator: select → 5 streams
├── founders/
│   ├── page.tsx                # Founders index (TOC list of 12)
│   └── [slug]/page.tsx         # Per-founder profile (bio + ideas + wins/failures + essays)
├── api/
│   ├── panel/
│   │   ├── select/route.ts     # POST — embed + rank + select 5 authors
│   │   └── [author_slug]/route.ts  # GET — stream one panelist's response
│   └── sources/
│       └── [author_slug]/route.ts  # GET — ±2 paragraph window for the drawer
├── layout.tsx
└── globals.css                 # Design tokens (mirrors DESIGN.md)

components/
├── PanelColumn.tsx             # One panelist column (avatar → reasoning → answer → citations)
└── SourceDrawer.tsx            # Faux-page drawer with ±2 paragraph window

lib/
├── cache/single-flight.ts      # In-memory dedup (try/finally cleanup)
├── db/client.ts                # Pooled pg client with pgvector
├── founders/
│   ├── index.ts                # Loader: joins personas frontmatter with profiles
│   └── profiles.ts             # Hand-curated bio/wins/failures per founder
├── panel/
│   ├── all-panelists.ts        # Static metadata for the 12 founders
│   ├── embed.ts                # Embed via AI Gateway, cache by question hash
│   ├── errors.ts               # Locked API error contract
│   ├── parse-stream.ts         # Fallback delimited markup parser
│   ├── partial-json.ts         # Client-side streamObject text consumer
│   ├── select.ts               # Author ranking by chunk similarity
│   ├── spend-cap.ts            # Daily LLM spend cap with auto-degradation
│   └── validate-citations.ts   # Fail-closed citation validator
├── personas/index.ts           # Persona markdown loader
└── scrape/
    ├── base.ts                 # Shared scraper utilities
    ├── index.ts                # Registry of all 8 scrapers
    ├── paul-graham.ts          # Reference implementation (bespoke HTML)
    ├── naval.ts, jason-fried.ts, fred-wilson.ts, sahil-lavingia.ts,
    ├── patrick-collison.ts, sam-altman.ts, garry-tan.ts

personas/                       # Persona system prompts (committed markdown)
├── paul-graham.md … garry-tan.md

db/migrations/0001_initial.sql  # chunks + question_embeddings + spend_tracker + HNSW index

scripts/
├── scrape.ts                   # bun run scrape — fetch + embed corpus
└── warm-cache.ts               # bun run warm-cache — pre-warm canonical questions

DESIGN.md                       # Locked design system
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection string (must support pgvector) |
| `AI_GATEWAY_API_KEY` | yes | Vercel AI Gateway — provides Sonnet + embeddings under one key |
| `OPENAI_API_KEY` | optional | Direct OpenAI key as fallback for embeddings |
| `DAILY_LLM_SPEND_CAP_USD` | optional | Daily spend cap (default $200). On hit, auto-degrades to cache_only. |
| `PANEL_LIVE_MODE` | optional | Set to `cache_only` to disable live LLM calls (kill switch) |
| `PROMPT_VERSION` | optional | Cache-busting version string for persona prompt changes |
| `BASE_URL` | optional | Used by scripts/warm-cache.ts (defaults to localhost:3000) |

## Commands

```bash
bun run dev                 # next dev --turbopack
bun run build               # next build
bun run start               # next start

bun run scrape              # scrape + embed all 8 blogs (idempotent)
bun run scrape -- --only paul-graham   # one author
bun run scrape -- --dry-run            # list URLs, no fetch

bun run warm-cache          # hit each canonical question to pre-populate cache

bun run test                # vitest run (unit + integration)
bun run test:watch          # vitest watch
bun run test:e2e            # playwright tests
bun run eval:voice          # snapshot eval for voice fidelity
```

## Adding a new founder (V1.1+)

1. Add a row to `lib/panel/all-panelists.ts`.
2. Write `personas/<slug>.md` with YAML frontmatter and a starter system prompt.
3. Implement `lib/scrape/<slug>.ts` exporting a `BlogScraper`.
4. Register the scraper in `lib/scrape/index.ts`.
5. Generate an avatar PNG (DALL·E with the locked prompt from DESIGN.md) at `public/avatars/<slug>.png`.
6. Run `bun run scrape -- --only <slug>` to ingest.

## Design system

See [DESIGN.md](./DESIGN.md). All visual decisions calibrate against it. If you're adding a CSS rule that contradicts a token, update DESIGN.md in the same PR.

## Legal posture

- **Citation integrity.** Every quote is verified post-stream against the source chunk. Failures replace the entire response with an `opted_out` state — we degrade rather than lie.
- **No full reproduction.** The source drawer only renders ±2 paragraphs around the cited paragraph. The full essay link goes to the original site.
- **robots.txt.** Hard-stop on disallow. The scraper excludes any author whose `/robots.txt` forbids `FounderPanelBot`.
- **Rate limiting.** 1 request per second per domain. User-Agent is `FounderPanelBot/1.0`.

## Voice fidelity gate (launches the launch)

Before announcing to HN, run the blind voice test:

1. Pick 3 readers who can name at least 2 PG essays from memory.
2. Show each reader the same 3 unlabeled panel responses on a canonical question — one PG, one Jason Fried, one Naval.
3. Each reader labels all 3.
4. **2 of 3 readers labeling correctly is the launch gate.** If only 1 passes, spend Monday on prompt iteration before launching.

Also run the citation-integrity check:

```bash
bun run warm-cache && bun run validate-citations   # TODO: this script
```

## Deferred to V1.1

- Disagreement-highlighting post-processing call
- OG-image share button (`/share/[id].png`)
- Mobile-optimized swipe carousel
- Voice fidelity eval as a snapshot test

## Built with

[Next.js](https://nextjs.org) · [Vercel AI SDK](https://sdk.vercel.ai) · [Anthropic Claude Sonnet 4.6](https://www.anthropic.com) · [Neon Postgres](https://neon.tech) · [pgvector](https://github.com/pgvector/pgvector) · [Bun](https://bun.sh)
