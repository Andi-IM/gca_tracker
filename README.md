# Google Cloud Arcade Tracker

A milestone progress calculator for Google Skills Arcade Fasilitator participants.

## Project Structure

```text
/
├── api/                          # Backend API (separate deployment)
│   ├── server.py                 # Python HTTP server with scraping endpoint
│   ├── scraper.py                # httpx + lxml profile scraper
│   ├── utils.py                  # Utility functions
│   └── planner.py                # Target planning logic
├── data/
│   └── syllabus-assertions.json  # Syllabus data
├── public/
│   └── data/                     # Static data for client
├── src/
│   ├── components/               # Preact components
│   │   ├── CalculatorIsland.tsx  # Main calculator wrapper
│   │   ├── InputPanel.tsx        # Form inputs
│   │   ├── OutputPanel.tsx       # Results display
│   │   └── TargetPanel.tsx       # Target lists
│   ├── layouts/
│   │   └── BaseLayout.astro      # Base HTML layout
│   ├── lib/                      # TypeScript modules
│   │   ├── calculator.ts         # Score calculations
│   │   ├── milestones.ts         # Milestone data
│   │   ├── planner.ts            # Target planning
│   │   ├── scraper.ts            # Client-side scraping
│   │   ├── storage.ts            # LocalStorage helpers
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── utils.ts              # Utility functions
│   ├── pages/
│   │   └── index.astro           # Main page
│   └── styles/
│       └── global.css            # Global styles
├── tests/
│   └── run-cases.mjs             # Test suite
└── docs/
    └── astro-migration-plan.md   # Migration documentation
```

## Commands

### Frontend (Astro)

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                            |
| `npm run dev`             | Start dev server at `localhost:4321`            |
| `npm run build`           | Build production site to `./dist/`              |
| `npm run preview`         | Preview build locally                           |
| `npm test`                | Run test suite                                  |

### Backend API

```bash
uv sync
uv run python -m api.server  # Start API server at localhost:3001
```

## Development

1. Install dependencies:
   ```bash
   npm install
   uv sync
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. (Optional) Start API server:
   ```bash
   npm run dev:api
   ```

## Architecture

- **Frontend**: Astro static site with Preact islands for interactivity
- **Backend**: Separate Python API for profile scraping with `httpx` + `lxml` (deploy independently)
- **Data**: Syllabus assertions in JSON format

## Deployment

### Frontend
Deploy the `dist/` folder to any static hosting:
- Tencent Cloud EdgeOne Pages
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

### Backend API
Deploy the `api/` directory as a standalone service:
- Tencent Cloud Lighthouse / VPS
- Vercel Functions
- Railway
- Render
- Fly.io

See [edgeone-deployment.md](file:///D:/01_Projects/arcade-tracker/docs/edgeone-deployment.md) for Tencent Cloud EdgeOne hybrid deployment instructions, and `api/README.md` for general standalone API deployment.

Quick EdgeOne CLI deployment:

```powershell
$env:PUBLIC_API_URL = "https://api.domain-anda.com"
npm run build
npx edgeone makers deploy dist --name arcade-tracker --env production --area global
```

## Testing

Run the test suite:
```bash
npm test
uv run pytest -q api/test_scraper.py
```

Tests verify:
- Milestone calculations
- Score computations
- Profile scraping logic
- Data integrity
