# Founder Panel landing-page design

## Direction

Modern editorial minimalism: a founder letter, a Stripe Press volume, and an austere technical manual. The page should feel intelligent and useful before it feels like software.

Avoid generic SaaS patterns: gradients, bubbly cards, icon grids, oversized pills, fake dashboards, decorative blobs, and startup clichés.

## Visual system

- **Paper:** warm off-white `#F4F0E7`
- **Ink:** near-black `#171714`
- **Accent:** brick red `#A03B2A`
- **Rules:** warm gray `#CBC3B4`
- **Editorial type:** Newsreader
- **Interface type:** DM Sans
- **Commands and metadata:** IBM Plex Mono
- **Radius:** none, except circular real-person portraits
- **Motion:** deliberate and modern, always respecting `prefers-reduced-motion`:
  - staggered fade-up entrance on hero content (CSS keyframes, `--d` delay variable);
  - scroll-triggered reveals on sections via the `Reveal` component (IntersectionObserver, once, with a `noscript` fallback);
  - a typed terminal demo (`TypingTerminal`) that plays once on scroll into view; a hidden sizer reserves its final height so nothing shifts;
  - count-up hero statistics (`CountUp`; server renders the final number);
  - an infinite roster marquee (`FounderMarquee`, pure CSS, pauses on hover, wraps statically under reduced motion);
  - hover micro-interactions: offset shadows grow on previews/terminal, nav underlines scale in, button arrows nudge;
  - ambient depth only: fixed film grain overlay and one slow-drifting warm radial glow behind the hero. No other gradients.

## Logo

The primary mark is a compact `FP` printer's monogram: a classic editorial
colophon with a contemporary brick-red diagonal slash. It should read clearly
at favicon and Product Hunt thumbnail sizes without drifting into generic SaaS
or AI imagery.

- **Letterform:** exact capital `FP`, heavy black engraved/woodcut character
- **Accent:** one restrained diagonal slash in brick red `#A03B2A`
- **Treatment:** flat, vector-like, high contrast, no gradients or shadows
- **Background:** transparent in every shipped asset
- **Avoid:** robots, light bulbs, speech bubbles, rockets, brains, and extra text
- **Master:** `public/brand/founder-panel-logo.png`
- **Square launch asset:** `public/brand/founder-panel-product-hunt.png`
- **App icon:** `app/icon.png`

## Composition

The single page contains:

1. a sticky, blurred-glass wordmark navigation bar with a GitHub button;
2. a large, centered, plain-language hero with staggered entrance, one red italic
   accent phrase per heading (`.hl`), a licensed avatar cluster, and a
   four-cell statistics row;
3. a self-typing terminal demo;
4. a full-bleed marquee of every roster member with a licensed portrait or
   initials medallion;
5. two detailed previews: one founder conversation and one three-person board;
6. a centered three-step explanation of source grounding on the dark band;
7. clone-and-run installation instructions on a deep-paper band;
8. a prominent, centered non-affiliation statement card; and
9. generated portrait attribution from data/founder-portraits.json.

No eyebrow labels or generic tag chips anywhere. Section intros are centered;
emphasis comes from the single red italic accent per heading, never from
additional badges.

The primary action is always GitHub. There are no sign-up, payment, or in-product actions.

## Content rules

- Say “AI synthesis” or “source-grounded conversation,” never imply a real founder is participating.
- Show canonical citations in product previews.
- Voice, post, and word counts are derived from `.claude/founders-corpus/ROSTER.md` at build time (`lib/roster.ts`) and must never be hardcoded in the page.
- Keep the two command names visible above the fold and in their feature sections.
- Preserve useful reading order and a single-column mobile layout at 680px and below.
