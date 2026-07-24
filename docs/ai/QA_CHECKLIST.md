# QA Checklist

## Automated

- `npm test`
- Syllabus assertion fixture loads from `data/syllabus-assertions.json`.
- `npm start`
- `/api/scrape?url=<public_profile_url>` returns JSON from the same local app server.
- Syllabus fixture contains 6 incomplete July 2026 Arcade Games and 51 incomplete Skill Badges split 17/17/17.
- Future August/later Arcade Game badges must not overwrite the July release data.

## Calculation Cases

- `6 games, 14 badges, bonus false` returns total `20`.
- `6 games, 14 badges, bonus true` returns total `30`.
- `8 games, 28 badges, bonus true` returns total `50`.
- `10 games, 42 badges, bonus true` returns total `70`.
- `12 games, 56 badges, bonus true` returns total `90`.

## Edge Cases

- `8 games, 20 badges` remains Milestone 1.
- `12 games, 14 badges` remains Milestone 1.
- `0 games, 0 badges, bonus true` gives no bonus.
- `3 badges` gives 1 badge point.
- Negative and decimal inputs show validation errors.

## UI

- Inputs and outputs use Indonesian labels.
- Public Skills Google URL is restored after refresh.
- Clear URL removes only the saved public URL.
- Arcade Games and Badge Keahlian inputs are read-only and populated by profile scraping.
- Target section shows completed/missing Arcade Games and next Skill Badge targets.
- Official milestone table is visible.
- Warning notes and reward notice are visible.
- Layout works on mobile and desktop.
