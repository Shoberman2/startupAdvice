# Changelog

## [0.1.0.0] - 2026-07-20

### Added

- You can launch Founder Panel with a classic `FP` logo, platform-matched Product Hunt thumbnail, app icon, ready-to-paste listing copy, and a 1080p terminal demo in `PRODUCT_HUNT.md`.
- The landing page now embeds the 24-second terminal walkthrough with a responsive, accessible video player and poster frame.
- The FP logo now ships as a classic `/favicon.ico` fallback alongside the high-resolution PNG icon for consistent browser-tab branding.
- Release checks now validate the launch images and video, favicon, listing limits, responsive safeguards, corpus merge precedence, and supported `--only` argument forms with 53 automated tests.

### Fixed

- Mobile visitors can read and copy the installation command without horizontal clipping, and portrait credits have larger touch targets.
- Rebuilding selected founder corpora no longer drops unselected founders when `report.json` is missing or stale.
- The declared `bun run test` command now completes successfully in a clean clone.
