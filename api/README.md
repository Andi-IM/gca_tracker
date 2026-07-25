# Arcade Tracker API

Python backend API for scraping Google Skills Arcade profiles with `httpx` and `lxml`.

## Setup

1. Create the project virtual environment and install dependencies with `uv`:
   ```bash
   uv sync
   ```

## Running

```bash
cd ..
uv run python -m api.server
```

The API will be available at `http://localhost:3001`.

## Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-25T15:30:00.000Z"
  "runtime": "python",
  "parser": "lxml"
}
```

### Scrape Profile
```
GET /api/scrape?url=https://www.skills.google/public_profiles/...
```

Query parameters:
- `url` (required): Google Skills public profile URL

Response:
```json
{
  "source_url": "https://www.skills.google/public_profiles/...",
  "scraped_at": "2026-07-25T15:30:00.000Z",
  "arcade_games_completed": 2,
  "skill_badges_completed": 5,
  "matched_arcade_games": [...],
  "completed_arcade_games": [...],
  "missing_arcade_games": [...],
  "target_arcade_games": [...],
  "skill_badge_targets": [...],
  "completed_skill_badge_targets": [...],
  "missing_skill_badge_targets": [...],
  "diagnostics": {
    "page_title": "...",
    "link_count": 150,
    "body_text_length": 5000
  }
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `ALLOWED_ORIGIN`: Allowed frontend origin (default: `*`; set this in production)

## CORS

CORS is enabled for all origins. For production, configure allowed origins in `server.py`.

## Deployment

This API can be deployed as a standalone Python service. The repository includes
`api/Dockerfile`; build it from the repository root so the image also receives
the shared `data/` directory. The image uses `uv` and an isolated environment.

### VPS / Railway / Render / Fly.io

1. Connect your repository
2. Set build command: `uv sync --frozen --no-dev`
3. Set start command: `uv run --no-sync python -m api.server`

## Notes

This backend intentionally does not run a headless browser. It fetches the public profile with `httpx` and parses the returned HTML with `lxml`, so it is lighter than the previous Playwright service. If Google moves the badge list behind client-only rendering, the API may need a browser-capable fallback again.
