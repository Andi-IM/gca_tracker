# Arcade Tracker API

Backend API for scraping Google Skills Arcade profiles.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Running

```bash
npm start
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
- `PLAYWRIGHT_CHANNEL`: Browser channel (default: "chrome")

## CORS

CORS is enabled for all origins. For production, configure allowed origins in `server.js`.

## Deployment

This API can be deployed as a standalone Node.js service or as serverless functions:

### Vercel
1. Create `vercel.json` in this directory
2. Deploy with `vercel deploy`

### Cloudflare Workers
1. Use `wrangler` to deploy
2. Note: Playwright requires paid plan on Cloudflare

### Railway/Render/Fly.io
1. Connect your repository
2. Set build command: `cd api && npm install`
3. Set start command: `cd api && npm start`
