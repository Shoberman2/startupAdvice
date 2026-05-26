# DESIGN — Founder Panel

The design system for Founder Panel. Source of truth for typography, color, spacing, motion, and composition. If you are about to add a CSS rule that contradicts something here, fix this file first and discuss the change in a PR.

## Aesthetic stance

Editorial. Patrick Collison essays. Stripe Press. Naval's almanack. Paul Graham's site austerity. Quiet confidence. The product is a serious tool that respects the reader's intelligence.

**Posture across surfaces.** The product is a literary magazine that streams. Every screen is a typographic format, not a UI pattern: the panel is a five-column broadsheet, single-voice chat is a letter, the debates feed is a front page, an individual debate is a transcript, the summaries library is a book's table of contents, and an individual summary is a chapter. The citation drawer is a magazine spread, not a side panel — receipts are the centerpiece, not an afterthought.

**Anti-aesthetic.** Generic SaaS. Card-grid features. AI-slop heroes. Purple gradients. Centered-everything. Bubbly border-radius. Decorative blobs. Icons in colored circles. System-ui as the primary font. Chat bubbles.

## Brand

- **Wordmark:** "Founder Panel" set in `--font-serif` at 18px, color `--accent`, top-left.
- **Product claim:** "An AI research agent for founder advice." Centered above the input on the pre-question page, 32px `--font-serif`, color `--text`.

The claim must be explicit that Founder Panel is an AI research agent working from public founder sources. Do not imply the founders are answering live, participating, endorsing the advice, or being impersonated.

## Typography

| Role | Family | Where |
|---|---|---|
| Headlines, asked questions, answer body | `--font-serif` (EB Garamond, New Spirit) | All editorial text |
| UI chrome (buttons, labels, names, eras) | `--font-sans` (Inter) | Chrome only |
| Citation marks `[1]`, attribution, stats, timestamps | `--font-mono` (JetBrains Mono) | Citations, mono metadata |

Never use a default font stack. If `--font-serif` fails to load, fall through to Georgia — never to `system-ui`.

Scale:

| Token | Size | Use |
|---|---|---|
| `--type-question` | 32px | The user's asked question at the top of the active state; the masthead on `/watch` and `/think` |
| `--type-h1` | 24px | Section heading, founder name in `/with` letterhead |
| `--type-body` | 18px | Answer body |
| `--type-meta` | 14px | Founder names, eras, footnotes (sans) |
| `--type-micro` | 12px | Citation marks, stats, timestamps (mono) |

Chapter pages (`/think/[founder]/[topic]`) read at 19px serif with a 21px italic lead — slightly larger than answer body because that surface is long-form, single-column reading.

## Color

Near-monochrome. One accent. Warm off-white background.

| Token | Hex (light) | Where |
|---|---|---|
| `--bg` | `#FCFBF7` | Page background. Warm off-white. |
| `--surface` | `#F7F4EC` | Citation drawer body, active-turn fill base |
| `--text` | `#141414` | Body text, asked-question header. |
| `--muted` | `#6B6863` | Founder eras, attribution, metadata. |
| `--accent` | `#8A3324` | Wordmark, citation links, streaming-underline pulse, drop caps, avatar accent. |
| `--accent-soft` | `rgba(138, 51, 36, 0.12)` | Active-turn background fill, avatar background |
| `--hairline` | `#E8E5DD` | Input border, divider rules, dotted TOC leaders |
| `--hairline-strong` | `#D8D3C7` | Composer border, byline separators, drawer gutter |

No other colors. If you need a "warning" or "success" state, derive it from `--accent` opacity. If you need shading, use `--hairline` or `--surface`.

Contrast measurements (against `--bg`):
- `--text`: 14:1 (AAA)
- `--accent`: 6.5:1 (AA)
- `--muted`: 4.6:1 (acceptable for non-body usage; never use for body text)

## Dark mode

The dark mode is a redesigned palette, **not inverted light-mode colors**.

| Token | Hex (dark) | Notes |
|---|---|---|
| `--bg` | `#15110D` | Warm near-black. Never pure black. |
| `--surface` | `#1C1814` | One step up from `--bg` for drawer pages and active-turn fills |
| `--text` | `#F5F1E8` | Warm bone — pairs with the warm bg to keep editorial warmth |
| `--muted` | `#A09A8E` | Eras, attribution, metadata |
| `--accent` | `#D86A52` | Lifted from `#8A3324`, which reads muddy/brown on dark |
| `--accent-soft` | `rgba(216, 106, 82, 0.14)` | Active-turn background fill |
| `--hairline` | `#2B2620` | Divider rules |
| `--hairline-strong` | `#3B342B` | Composer border, byline separators, drawer gutter |

Why lift the accent: `#8A3324` on a dark warm-black background reads as muddy brown and loses its identity as red. `#D86A52` keeps the same hue family while staying readable as the same accent across modes.

Default to `prefers-color-scheme`. Persist user override in `localStorage` under key `fp-theme`. The toggle is a two-segment pill in the page header (top-right), 12px `--font-sans` with `0.08em` tracking, all-caps. No icon. No "auto" option in v1 — the system pref already provides that default.

`prefers-contrast: more` is not yet differentiated; treat as a future commitment.

## Radius

Almost-no-radius.

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `0` | Card-like containers (avoid using cards in general) |
| `--radius-input` | `2px` | Text input, submit button, theme toggle |
| `--radius-button` | `2px` | Buttons |
| `--radius-avatar` | `50%` | Founder portrait circles — the ONLY round element in the system |

## Spacing

8px base scale.

| Token | Value |
|---|---|
| `--space-1` | 8px |
| `--space-2` | 16px |
| `--space-3` | 24px |
| `--space-4` | 48px (desktop column gutter) |
| `--space-5` | 96px |

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(0.2, 0.0, 0.2, 1)` | All easing |
| `--duration-fast` | 200ms | Most transitions |
| `--duration-drawer` | 250ms | Citation drawer open/close |

No springs. No bounces. No long durations. Calm and deliberate.

Streaming-underline pulse: 1.5s sine cycle on the 2px accent underline beneath each founder's name while their stream is active, and on the headline of a live debate in `/watch`. Goes static when streaming completes.

Respect `prefers-reduced-motion: reduce` — when set, the pulse is replaced with a solid underline throughout streaming, with screen-reader status announced on completion.

## Composition

### Pre-question state (`/`)

1. Wordmark top-left
2. Generous vertical space
3. Product claim centered, 32px serif
4. Large input field below the claim, hairline border, 2px radius
5. Below input: 4 canonical questions as **quiet text links** with a leading bullet `·`, not cards

### Active state — five-column panel (`/panel`)

1. Wordmark stays top-left
2. Top-right: small "Ask another →" link
3. A thin horizontal rule
4. The asked question in 32px serif as a header
5. Five columns equal width, separated by `--space-4` gutter
6. Each column: portrait → name + era → reasoning section (3 essay titles + 1 italic weighing sentence) → answer body with inline `[N]` citations

### Single-voice chat — letter (`/with/[founder]`)

Single-founder conversation, rendered as a transcript in a literary magazine. **No chat bubbles, ever.**

1. **Letterhead** at top, separated from the conversation by a 1px `--hairline`:
   - 56px circular avatar — `--accent-soft` background, 1px `--accent` border, founder initials in `--font-serif` 22px weight 500 `--accent`
   - Founder name in 24px `--font-serif` weight 500
   - Era in 12px `--font-mono` `--muted` directly below (e.g., `Stripe · 2010—`)
2. **The conversation:**
   - User questions: 19px `--font-serif` italic, color `--muted`, with a 2px `--hairline` left-border and a 11px `--font-mono` `--accent` superscript kicker `Q ·` at the start
   - Founder replies: 18px `--font-serif`, color `--text`, line-height 1.65
   - Inline `[N]` citations in 11px `--font-mono` `--accent`, vertical-align super, with a dotted bottom border; click opens the citation drawer
   - Reply-then-question flow alternates without any "you said / they said" headers — the typographic shift (italic muted vs body) carries the speaker
3. **Composer** pinned to the bottom of the conversation column (above the keyboard on mobile, using `100dvh` so iOS Safari doesn't crop it):
   - Thin `--hairline-strong` border, 2px radius
   - Italic placeholder using the founder's first name: `"Ask Patrick…"`, `"Ask Naval…"`, `"Ask Garry…"`
   - Submit button: solid `--text` background, `--bg` label, 13px `--font-sans` weight 500
4. **While the reply is streaming:** no "stop generating" button. The cursor at the end of the streaming text is a 2px `--accent` underline that pulses on the same 1.5s sine cycle as `/watch` live debates.

### Debate feed — front page (`/watch`)

A running front page of background debates. **No cards, no status pills, no avatars at this level.** Typography does the work.

1. **Masthead:** "Watch" in 34px `--font-serif` weight 500 on the left, current date and debate count in 12px `--font-mono` `--muted` on the right (`"Wednesday · 13 May 2026 · 3 debates today"`). Separated from the rows by a 2px solid `--text` rule.
2. **Each `.debate-row`** is separated from the next by 1px `--hairline`:
   - **Flag** (top): 11px `--font-sans` weight 600, all-caps, 0.18em tracking
     - `LIVE` in `--accent`, with a 6px pulsing dot before the word
     - `CONCLUDED` in `--muted`, no dot
     - Append turn count after the flag (`"Live · turn 4"`, `"Concluded · 12 turns"`)
   - **Headline:** 28px `--font-serif` weight 500, line-height 1.2
     - When the debate is live, the headline has a 2px `--accent` underline that pulses (1.5s sine cycle)
   - **Dek:** 17px `--font-serif` italic `--muted`, max 720px measure
   - **Byline:** 13px `--font-sans` `--muted` with founder names in `--text`, separators `·` in `--hairline-strong`, age stats in 11px `--font-mono` (`"8 min · 4 turns so far"`, `"Yesterday"`)
3. Entire row is clickable to open `/watch/[id]`. Hover lifts the headline color subtly (no underline added — the live pulse is reserved for the live-state signal).

### Individual debate — transcript (`/watch/[id]`)

Each debate reads as a transcript in a literary magazine.

1. **Header**, separated from the transcript by 1px `--hairline`:
   - Kicker: 11px `--font-sans` 0.18em tracking all-caps `--accent` (`"Live debate · turn 4 of ?"` or `"Concluded · 12 turns"`)
   - Title: 32px `--font-serif` weight 500
   - Meta: 12px `--font-mono` `--muted` (start time, participants)
2. **Each `.turn`** is padded `--space-2` `--space-2` `--space-2` `--space-3` with a transparent 2px left-border by default:
   - **Author row:** 11px `--font-sans` weight 600 all-caps 0.2em tracking, with the era inline as 10px `--font-mono` `--muted` (not transformed)
   - **Body:** 17px `--font-serif` line-height 1.6 with inline `[N]` citations
3. **The currently-writing turn** changes state:
   - Left-border becomes `--accent`
   - Background fills with `--accent-soft`
   - Author row gets a right-aligned `writing…` flag in 10px italic `--font-mono` `--accent`
4. **Streaming text that breaks mid-sentence is deliberate** — the reader watches writing happen. Do NOT replace with a skeleton, a spinner, or "typing…" dots.

### Summaries library — table of contents (`/think`)

The library is a book's table of contents, not a card grid.

1. **Library head:** "Think" in 34px `--font-serif`, italic dek in 17px `--font-serif` `--muted`. Separated by a 2px solid `--text` rule.
2. **Each `.part`** is a founder:
   - Part label: 11px `--font-sans` 0.2em tracking all-caps `--accent` (`"Part I"`)
   - Founder name: 22px `--font-serif` weight 500
3. **Each topic is a `.toc-entry`**, a 4-column grid:
   - Column 1: 28px wide, 12px `--font-mono` `--muted` Roman numeral (`i.`, `ii.`, `iii.`)
   - Column 2: topic title in 17px `--font-serif`, with an italic 14px `--muted` gloss after a 8px gap (`"How to Start a Startup — foundational essays on getting going"`)
   - Column 3: count in 12px `--font-mono` `--muted` (`"4 essays · 31 passages"`)
   - Column 4: right-pointing arrow `→` in 13px `--font-mono` `--accent`
   - Separator: 1px dotted `--hairline`
4. No thumbnails, no covers, no previews. The title and count sell the chapter.

### Individual summary — chapter (`/think/[founder]/[topic]`)

Long-form reading layout. Narrower than the panel (this is one column, not five).

1. Max width: 680px, centered
2. **Kicker:** 11px `--font-sans` 0.22em tracking all-caps `--muted`, with the founder name in `--accent` (`"PAUL GRAHAM · Part I · Chapter ii"`)
3. **Title:** 38px `--font-serif` weight 500, line-height 1.15
4. **Lead paragraph:** 21px `--font-serif` italic `--muted`, with a 1px `--hairline` below separating it from the body
5. **Body:**
   - **First paragraph** gets a 4-line drop cap: 64px `--font-serif` weight 500 `--accent`, float-left, padding `6px 10px 0 0`, line-height 0.85
   - Body paragraphs in 19px `--font-serif` line-height 1.65
   - Inline `[N]` citations
6. **Sources strip** at the bottom, separated by 1px `--hairline`: 12px `--font-mono` `--muted` with passage counts on the left and a `"Read all citations →"` link in `--accent` on the right

### Citation drawer — magazine spread

Triggered by clicking any `[N]` citation. **The drawer is a first-class surface, not a side panel.** Receipts are the product's defining feature; the drawer earns the same typographic care as the answer it cites.

On desktop and tablet: overlay opens with a 250ms ease transition, dims the page behind to 40%.
On mobile (< 760px): single column, full-width, slides up from the bottom.

1. **Attribution strip** at top, centered:
   - 12px `--font-sans`, source name in `--text` weight 500, the rest in `--muted`
   - Format: `"From Paul Graham, 'How to Get Startup Ideas' · paulgraham.com · November 2012"`
2. **Two-column spread**, max width 980px, with a 1px `--hairline-strong` vertical gutter between pages:
   - **Left page — the cited paragraph:** rendered in the **source's actual typography** (Georgia/Times for PG, the source's own sans for Naval's modern posts, the source's serif for Stripe Press / Collison, etc.). Fidelity to the source beats consistency with our own typography. The cited text has a 2px `--accent` underline beneath it as an editorial highlight — never a yellow background.
   - **Right page — surrounding context:** ±2 paragraphs in the same source typography, color `--muted`. The cited paragraph appears in-place rendered in `--text` so the reader can locate it in the flow.
3. **Footer:** 13px `--font-sans` centered, `"Read full essay on paulgraham.com →"` linking to the source canonical URL
4. **Behavior:**
   - Esc closes
   - Click-outside closes
   - Focus returns to the originating `[N]` marker
   - `role="dialog"`, `aria-modal="true"`, focus-trapped within the drawer
   - Source typography is loaded lazily — only fetch the source font when the drawer opens, not on page load

### Mobile (375px)

- **`/panel`:** the 5-column desktop layout becomes a horizontal swipe carousel. One full-width column at a time. 5 indicator dots at the top of the viewport, current one filled `--accent`. All 5 streams still run in parallel; the user sees one at a time via swipe.
- **`/with`:** composer pins to viewport bottom using `100dvh`; conversation scrolls behind it.
- **`/watch`:** rows stay typographic — just reduce horizontal padding to `--space-2`.
- **`/watch/[id]`:** turns flow vertically; no carousel. Reading order stays sequential.
- **`/think`:** TOC grid collapses — number and arrow stay in their tracks; title + count stack.
- **`/think/[founder]/[topic]`:** drop cap stays at 64px (it's a deliberate signal). Measure stays ≤680px; if the viewport is narrower, padding shrinks to `--space-2` each side.
- **Citation drawer:** two columns stack — cited paragraph on top, context below.

### Loading, empty, and error states

- **Loading (N-of-M selection, e.g., panel selecting 5 from 8):** prerender all M slots at low opacity (0.3), fade non-chosen slots out as the selection arrives. The layout itself communicates progress. Do not use skeletons, spinners, or progress bars. (See `learnings/prerender-then-fade-pattern`.)
- **Loading (streaming text):** the streaming-underline pulse is the only loading affordance. No "thinking…" dots.
- **Empty:** one-line italic serif message at the natural place where content would be (`"No debates yet today."`). No illustration. No CTA.
- **Error:** inline at the point of failure. Small-caps `Error` label in 11px `--font-sans` `--accent`, message in 17px `--font-serif`. No toast, no banner, no modal.
- **404:** full-screen centered. 64px `--font-serif` headline (`"Off the page."`), italic dek, single text link back home.

### Focus states

- All interactive elements (links, buttons, inputs, citation marks): 2px solid `--accent` outline, 2px offset, no border-radius change
- Never `outline: none` without a replacement
- Tab order follows visual order
- On `/watch/[id]`, Tab moves between turns (each turn is a focus target so screen-reader users can hear them announced as discrete sections)

## Cards: when to use them

Almost never. A card earns its existence only when the card IS the interaction (you click the whole card and something happens). Decorative cards are banned. The avatar circle on `/with` is not a card; the citation drawer is a surface, not a card; the debate row is typography on a hairline, not a card.

If a section feels like it needs cards, it needs better content first.

## AI-slop blacklist (instant fail)

Flag any of these in code review:

1. Purple/violet/indigo gradient backgrounds
2. Three-column feature grid (icon-in-circle + bold title + 2-line description)
3. Icons in colored circles as section decoration
4. `text-align: center` on everything
5. Border-radius > 8px on any element (except `--radius-avatar`)
6. Floating blobs, wavy SVG dividers, decorative shapes
7. Emoji as design elements
8. Colored left-border on cards (the `/watch/[id]` active-turn border is on a transcript turn, not a card — that's allowed)
9. "Welcome to" copy
10. `system-ui` or `-apple-system` as primary font
11. **Chat bubbles on any conversation surface** (`/with`, `/watch/[id]`, anywhere else)
12. Status pills / tag chips for live/concluded state (use typographic flags + the pulse instead)
13. Skeleton loaders or spinners where prerender-then-fade or streaming-underline would do

## Accessibility commitments

- Tab navigates between columns on `/panel`, between turns on `/watch/[id]`, between citation marks on `/with`. Shift+Tab reverses.
- Each panelist column is `aria-live="polite" aria-atomic="false"` so screen readers announce completed text without interrupting reasoning chunks.
- Citation drawer is `role="dialog" aria-modal="true"`, focus-trapped, Esc closes.
- Touch targets ≥ 44 × 44px on mobile, including citation marks (use `padding` to expand the hit area without changing the visual size).
- Color contrast verified WCAG AA on every token combination in both light and dark (see Color and Dark mode tables).
- `prefers-reduced-motion: reduce` — no underline pulse, no drawer animation, status announced on completion instead.
- `prefers-color-scheme` is the default; user override persists in `localStorage`.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-12 | Initial editorial system created | Five-column panel, EB Garamond + Inter + JetBrains Mono, warm off-white with deep red accent |
| 2026-05-13 | Added `/with` letter format, `/watch` front page, `/watch/[id]` transcript, `/think` library + chapter, magazine-spread citation drawer, dark mode tokens, focus + loading + empty + error specs | "Editorial+ sharper" direction. New surfaces shipped after v1 needed explicit composition rules. Memorable thing = receipts → citation drawer promoted to first-class surface. Dark mode redesigned (not inverted) to keep editorial warmth. |
| 2026-05-13 | Corpus grew from 8 to 12 founders (DHH, Brian Chesky, Tobi Lütke, Eugene Wei). The visible corpus count was updated at the time. | Added voices fill gaps: bootstrapped/anti-VC (DHH), design-led/operator (Chesky), first-principles operator (Tobi), strategy essayist (Wei). |
| 2026-05-26 | Reframed product copy around "AI research agent" and public-source grounding | Users must understand that Founder Panel researches public data about founders and generates source-backed notes. The product should never present outputs as live founder replies. |

## How to extend this document

When a new screen, component, or token is added, update this file in the same PR. A locked design system that drifts is worse than no system. Add a row to the decisions log so future contributors can read the why, not just the what.
