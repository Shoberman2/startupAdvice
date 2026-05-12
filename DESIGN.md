# DESIGN — Founder Panel

The design system for Founder Panel. Source of truth for typography, color, spacing, motion, and composition. If you are about to add a CSS rule that contradicts something here, fix this file first and discuss the change in a PR.

## Aesthetic stance

Editorial. Patrick Collison essays. Stripe Press. Naval's almanack. Paul Graham's site austerity. Quiet confidence. The product is a serious tool that respects the reader's intelligence.

**Anti-aesthetic.** Generic SaaS. Card-grid features. AI-slop heroes. Purple gradients. Centered-everything. Bubbly border-radius. Decorative blobs. Icons in colored circles. System-ui as the primary font.

## Brand

- **Wordmark:** "Founder Panel" set in `--font-serif` at 18px, color `--accent`, top-left.
- **Product claim:** "Eight founders. Your question. With receipts." Centered above the input on the pre-question page, 32px `--font-serif`, color `--text`.

The claim is locked. It earns the visitor's first 5 seconds and names the trust unlock (receipts → citations).

## Typography

| Role | Family | Where |
|---|---|---|
| Headlines, asked questions, answer body | `--font-serif` (EB Garamond, New Spirit) | All editorial text |
| UI chrome (buttons, labels, names, eras) | `--font-sans` (Inter) | Chrome only |
| Citation marks `[1]`, attribution | `--font-mono` (JetBrains Mono) | Citations and attribution |

Never use a default font stack. If `--font-serif` fails to load, fall through to Georgia — never to `system-ui`.

Scale:

| Token | Size | Use |
|---|---|---|
| `--type-scale-question` | 32px | The user's asked question at the top of the active state |
| `--type-scale-h1` | 24px | Reserved |
| `--type-scale-body` | 18px | Answer body |
| `--type-scale-meta` | 14px | Founder names, eras, footnotes |

## Color

Near-monochrome. One accent.

| Token | Hex | Where |
|---|---|---|
| `--bg` | `#FCFBF7` | Page background. Warm off-white. |
| `--text` | `#141414` | Body text, asked-question header. |
| `--muted` | `#6B6863` | Founder eras, attribution, metadata. |
| `--accent` | `#8A3324` | Wordmark, citation links, streaming-underline pulse, avatar accent. |
| `--hairline` | `#E8E5DD` | Input border, divider rules. |

No other colors. If you need a "warning" or "success" state, derive it from `--accent` opacity. If you need shading, use `--hairline` for subtle separation.

Contrast measurements (against `--bg`):
- `--text`: 14:1 (AAA)
- `--accent`: 6.5:1 (AA)
- `--muted`: 4.6:1 (acceptable for non-body usage; never use for body text)

## Radius

Almost-no-radius.

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `0` | Card-like containers (avoid using cards in general) |
| `--radius-input` | `2px` | Text input, submit button |
| `--radius-button` | `2px` | Buttons |

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

No springs. No bounces. No long durations. Calm and deliberate.

Streaming-underline pulse: 1.5s sine cycle on the 2px accent underline beneath each founder's name while their stream is active. Goes static when streaming completes.

Respect `prefers-reduced-motion: reduce` — when set, the pulse is replaced with a solid underline throughout streaming, with screen-reader status announced on completion.

## Composition

### Pre-question state

1. Wordmark top-left
2. Generous vertical space
3. Product claim centered, 32px serif
4. Large input field below the claim, hairline border, 2px radius
5. Below input: 4 canonical questions as **quiet text links** with a leading bullet `·`, not cards

### Active state

1. Wordmark stays top-left
2. Top-right: small "Ask another →" link
3. A thin horizontal rule
4. The asked question in 32px serif as a header
5. Five columns equal width, separated by `--space-4` gutter
6. Each column: portrait → name + era → reasoning section (3 essay titles + 1 italic weighing sentence) → answer body with inline `[N]` citations

### Citation drawer

Right-side panel, 480px wide on desktop, full-width on mobile, slides in over 250ms. Inside:

1. Editorial attribution at top: "From Paul Graham, How to Get Startup Ideas, 2012"
2. The cited paragraph styled like the source — same serif, same em-dashes, same em — with a thin accent underline beneath it as a highlight (not a yellow background)
3. ±2 paragraphs of surrounding context above and below
4. "Read full essay on paulgraham.com →" link at the bottom
5. Esc closes; click-outside closes; focus returns to the originating `[N]` marker

### Mobile (375px)

The 5-column desktop layout becomes a horizontal swipe carousel. One full-width column at a time. 5 indicator dots at the top of the viewport, current one filled `--accent`. All 5 streams still run in parallel; the user sees one at a time via swipe.

## Cards: when to use them

Almost never. A card earns its existence only when the card IS the interaction (you click the whole card and something happens). Decorative cards are banned.

If a section feels like it needs cards, it needs better content first.

## AI-slop blacklist (instant fail)

Flag any of these in code review:

1. Purple/violet/indigo gradient backgrounds
2. Three-column feature grid (icon-in-circle + bold title + 2-line description)
3. Icons in colored circles as section decoration
4. `text-align: center` on everything
5. Border-radius > 8px on any element
6. Floating blobs, wavy SVG dividers, decorative shapes
7. Emoji as design elements
8. Colored left-border on cards
9. "Welcome to" copy
10. `system-ui` or `-apple-system` as primary font

## Accessibility commitments

- Tab navigates between columns. Shift+Tab reverses. Arrow keys move between citations within a column.
- Each panelist column is `aria-live="polite" aria-atomic="false"` so screen readers announce completed text without interrupting reasoning chunks.
- Citation drawer is `role="dialog"`, focus-trapped, Esc closes.
- Touch targets ≥ 44 × 44px.
- Color contrast verified WCAG AA on every token combination (see Color table).
- `prefers-reduced-motion: reduce` — no underline pulse, status announced on completion instead.

## How to extend this document

When a new screen, component, or token is added, update this file in the same PR. A locked design system that drifts is worse than no system.
