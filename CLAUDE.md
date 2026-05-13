# Founder Panel

Eight founders. Your question. With receipts. A Next.js App Router app on Vercel with AI SDK v6, streaming answers from a pgvector-backed corpus of founder essays.

See `README.md` for the architecture diagram, env vars, and run instructions.

## Design System

Always read `DESIGN.md` before making any visual or UI decisions. It is the source of truth for typography, color, spacing, motion, and per-surface composition (`/`, `/panel`, `/with`, `/watch`, `/watch/[id]`, `/think`, `/think/[founder]/[topic]`, citation drawer).

All font choices, colors, spacing, radii, and aesthetic direction are defined there. Do not deviate without explicit user approval — open a PR that updates `DESIGN.md` first, then the code that consumes it.

In QA mode, flag any code that doesn't match `DESIGN.md`. Specifically:
- Chat bubbles anywhere
- Status pills / tag chips for live/concluded state
- Card grids for things that should be typographic lists
- `system-ui` or `-apple-system` as primary font
- Border-radius > 8px on anything except avatars
- Anything else on the AI-slop blacklist in `DESIGN.md`
