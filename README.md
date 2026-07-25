# Google Cloud Arcade Tracker

A milestone progress calculator for Google Skills Arcade Fasilitator participants.

## Project Structure

```text
/
├── api/                          # Backend API (separate deployment)
│   ├── server.js                 # Express server with scraping endpoint
│   ├── scraper.js                # Playwright-based profile scraper
│   ├── utils.js                  # Utility functions
│   └── planner.js                # Target planning logic
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
cd api
npm install
npx playwright install chromium
npm start                    # Start API server at localhost:3001
```

## Development

1. Install dependencies:
   ```bash
   npm install
   cd api && npm install && cd ..
   ```

2. Install Playwright browsers (for API):
   ```bash
   npx playwright install chromium
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. (Optional) Start API server:
   ```bash
   cd api && npm start
   ```

## Architecture

- **Frontend**: Astro static site with Preact islands for interactivity
- **Backend**: Separate Node.js API for profile scraping (deploy independently)
- **Data**: Syllabus assertions in JSON format

## Deployment

### Frontend
Deploy the `dist/` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

### Backend API
Deploy the `api/` directory as a standalone service:
- Vercel Functions
- Railway
- Render
- Fly.io

See `api/README.md` for detailed deployment instructions.

## Testing

Run the test suite:
```bash
npm test
```

Tests verify:
- Milestone calculations
- Score computations
- Profile scraping logic
- Data integrity
