# Changelog

## [0.1.0.0] - 2026-07-20

### Added

- You can launch Founder Panel with a classic `FP` logo, transparent Product Hunt thumbnail, app icon, and ready-to-paste listing copy in `PRODUCT_HUNT.md`.
- Release checks now validate the launch images, responsive safeguards, corpus merge precedence, and supported `--only` argument forms with 49 automated tests.

### Fixed

- Mobile visitors can read and copy the installation command without horizontal clipping, and portrait credits have larger touch targets.
- Rebuilding selected founder corpora no longer drops unselected founders when `report.json` is missing or stale.
- The declared `bun run test` command now completes successfully in a clean clone.
