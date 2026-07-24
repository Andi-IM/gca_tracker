# Data Source

The current app does not fetch external data.

## Source Of Truth

Use the provided "Sistem Poin" JSON from the user prompt:

- Milestone 1: 6 games, 14 badges, 7 bonus points, optional 10 Bonus Milestone points.
- Milestone 2: 8 games, 28 badges, 18 bonus points, optional 10 Bonus Milestone points.
- Milestone 3: 10 games, 42 badges, 29 bonus points, optional 10 Bonus Milestone points.
- Ultimate Milestone: 12 games, 56 badges, 40 bonus points, optional 10 Bonus Milestone points.

Do not add scraping, public profile reads, CSV import, or external API assumptions.

## Future Scraping Assertions

Use `data/syllabus-assertions.json` as the expected syllabus/catalog fixture when validating scraped public Skills Google profile data later. The six Arcade Games in this fixture are the July 2026 release only; August and later game badges can change and must be stored as separate release fixtures. This fixture also records 51 placeholder Skill Badges split across Beginner, Intermediate, and Advanced. Badge names are placeholders until the Google Skills catalog names are filled in.

## Scraping Method

Use Playwright via `scripts/profile-scraper.js` for public profile scraping because Skills Google pages can be client-rendered and browser `fetch()` is commonly blocked by CORS. The scraper launches a real browser, waits for render/network idle, extracts HTML, body text, and links, then passes that content into the shared parser in `app.js`. The app calls it through the local `/api/scrape` endpoint from the same `npm start` server.
