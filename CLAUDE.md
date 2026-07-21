# Founder Panel

Founder Panel has exactly two product surfaces:

1. Claude Code skills: `/founder-conversation` and `/board-room`.
2. A single installation landing page at `/` linking to the GitHub repository.

Do not add a hosted chat product, API routes, authentication, payments, databases, user accounts, analytics, founder profile pages, or other application routes unless the user explicitly changes the product direction.

## Command contract

- Project skills live under `.claude/skills/<name>/SKILL.md`.
- The generated roster and URL-only source indexes are committed under `.claude/founders-corpus/`.
- Full-text research copies and `ideas/` memos are local and gitignored.
- Every answer is source-grounded, uses canonical citations, limits quotations, and includes a no-affiliation disclosure.
- `/founder-conversation` selects exactly one roster member.
- `/board-room` seats 2–5 roster members and keeps each member's evidence separate.

## Validation

```bash
bun run founders:validate:release
bun run founders:validate
bun run test
bun run build
```

## Landing page

The design source of truth is `DESIGN.md`. Keep the landing page static, fast, accessible, and focused on explaining the two commands and sending visitors to GitHub.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
