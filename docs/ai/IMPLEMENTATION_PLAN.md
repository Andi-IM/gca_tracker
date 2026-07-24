# Implementation Plan

## Current Shape

- Static files only: `index.html`, `styles.css`, `app.js`.
- Test runner: `tests/run-cases.js`.
- Single local app server: `npm start` runs `scripts/serve.js`.

## Calculation Rules

- `game_points = arcade_games_completed`.
- `badge_points = Math.floor(skill_badges_completed / 2)`.
- `arcade_points = game_points + badge_points`.
- Check milestone from highest to lowest: Ultimate, Milestone 3, Milestone 2, Milestone 1.
- A milestone is complete only when both game and badge requirements are met.
- Apply only the `bonus_points` from the highest achieved milestone.
- Add 10 Bonus Milestone points only when the checkbox is active and at least one milestone is achieved.

## UI Requirements

- Keep all text in Indonesian.
- Show input validation errors for negative or non-integer numeric values.
- Store only the public Skills Google URL in browser `localStorage`.
- Populate Arcade Games and Badge Keahlian counts from public profile scraping.
- Use `scripts/profile-scraper.js` through `/api/scrape` from the same `npm start` server for real public profile scraping with Playwright.
- Return completed and missing target arrays from scraping: `completed_arcade_games`, `missing_arcade_games`, `completed_skill_badge_targets`, and `missing_skill_badge_targets`. Do not expose raw scraped Skill Badge lists to the UI; scraping only filters official assertion data.
- Show the current monthly Arcade Game release based on the program period. July 2026 games are a separate release; August and September releases must be added as separate data when available.
- Show Skill Badge targets as navigable items. Use official fixture URLs from the RSVP Silabus page when present; otherwise fall back to a Skills Google catalog search URL for that target name.
- Show official milestone table, warning notes, next target gap, and reward notice.
- Keep the app usable by opening `index.html` directly.

## Verification

- Run `npm test`.
- Manually test browser interaction after calculation changes.
