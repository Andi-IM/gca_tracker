# Astro Migration Plan

## Overview

Migrate the Arcade Tracker from vanilla HTML/JS to Astro with Preact, keeping the backend API separate.

**Current State:**
- Single-page vanilla HTML/JS app
- Custom Node.js server with `/api/scrape` endpoint (Playwright)
- Pure client-side calculation logic

**Target State:**
- Astro static site with Preact islands for interactivity
- Backend API deployed separately (Vercel Functions, Cloudflare Workers, or standalone)
- All existing functionality preserved

---

## Phase 1: Project Setup

### 1.1 Initialize Astro Project

```bash
# Create new Astro project in current directory
npm create astro@latest . -- --template minimal --no-install --no-git
```

**Files to create/modify:**
- `astro.config.mjs` - Astro configuration with Preact integration
- `package.json` - Add Astro, Preact dependencies
- `tsconfig.json` - TypeScript configuration (optional)

### 1.2 Install Dependencies

```bash
npm install astro @astrojs/preact preact
```

**Package.json changes:**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node tests/run-cases.js"
  },
  "dependencies": {
    "astro": "^5.x",
    "@astrojs/preact": "^4.x",
    "preact": "^10.x"
  },
  "devDependencies": {
    "playwright": "^1.49.1"
  }
}
```

### 1.3 Astro Configuration

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  integrations: [preact()],
  output: 'static',
  build: {
    format: 'directory'
  }
});
```

---

## Phase 2: Convert HTML to Astro

### 2.1 Create Astro Layout

`src/layouts/BaseLayout.astro`:
- Move `<head>` content (meta, title, favicon, CSS)
- Wrap content in layout component
- Handle global styles

### 2.2 Convert index.html to Astro Page

`src/pages/index.astro`:
- Import BaseLayout
- Convert static HTML sections to Astro component syntax
- Add `client:load` directives for Preact islands

**Structure:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CalculatorIsland from '../components/CalculatorIsland.tsx';
---

<BaseLayout>
  <main class="page">
    <!-- Static sections (hero, warnings) stay as Astro -->
    <section class="hero">...</section>
    
    <!-- Interactive calculator becomes Preact island -->
    <CalculatorIsland client:load />
    
    <!-- Static sections (milestone table) stay as Astro -->
    <section class="table-panel">...</section>
  </main>
</BaseLayout>
```

---

## Phase 3: Convert JavaScript to Preact Components

### 3.1 Component Architecture

Break `app.js` (705 lines) into Preact components:

```
src/
├── components/
│   ├── CalculatorIsland.tsx      # Main wrapper component
│   ├── InputPanel.tsx            # Form inputs (URL, games, badges)
│   ├── OutputPanel.tsx           # Results display
│   ├── TargetPanel.tsx           # Target and progress lists
│   ├── MilestoneTable.tsx        # Milestone reference table
│   └── WarningList.tsx           # Warning messages
├── hooks/
│   ├── useCalculator.ts          # Calculator state and logic
│   ├── useLocalStorage.ts        # URL storage hook
│   └── useScrape.ts              # Profile scraping hook
├── lib/
│   ├── calculator.ts             # Core calculation logic
│   ├── milestones.ts             # Milestone data and constants
│   ├── planner.ts                # Target planning logic
│   ├── scraper.ts                # Client-side scraping utilities
│   └── types.ts                  # TypeScript interfaces
└── data/
    └── syllabus-assertions.json  # Static data (copy from root)
```

### 3.2 Extract Logic to Pure Functions

**`src/lib/calculator.ts`:**
- Port `Calculator` object methods
- Export pure functions: `calculateProgress()`, `findHighestMilestone()`, `getNextMilestone()`
- Remove DOM dependencies

**`src/lib/milestones.ts`:**
- Export `MILESTONES` array
- Export `WARNING_MESSAGES`, `REWARD_NOTICE`

**`src/lib/planner.ts`:**
- Port `TargetPlanner` methods
- Export: `getOfficialSkillBadges()`, `buildArcadeGameTargets()`, `buildSkillBadgeTargets()`, `getNextTargetPlan()`

### 3.3 Create Preact Components

**`CalculatorIsland.tsx`:**
```tsx
import { useState, useEffect } from 'preact/hooks';
import { calculateProgress } from '../lib/calculator';
import { scrapeProfileHtml } from '../lib/scraper';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import TargetPanel from './TargetPanel';

export default function CalculatorIsland() {
  const [arcadeGames, setArcadeGames] = useState(0);
  const [skillBadges, setSkillBadges] = useState(0);
  const [bonusMilestone, setBonusMilestone] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  
  const result = calculateProgress({
    arcade_games_completed: arcadeGames,
    skill_badges_completed: skillBadges,
    bonus_milestone_completed: bonusMilestone
  });
  
  return (
    <section class="calculator">
      <InputPanel 
        arcadeGames={arcadeGames}
        skillBadges={skillBadges}
        bonusMilestone={bonusMilestone}
        onArcadeGamesChange={setArcadeGames}
        onSkillBadgesChange={setSkillBadges}
        onBonusMilestoneChange={setBonusMilestone}
        onScrape={handleScrape}
      />
      <OutputPanel result={result} />
      <TargetPanel result={result} scrapeResult={scrapeResult} />
    </section>
  );
}
```

---

## Phase 4: Styling Migration

### 4.1 Move CSS to Astro

**Option A: Keep global CSS (simpler)**
- Move `styles.css` to `src/styles/global.css`
- Import in layout: `import '../styles/global.css'`

**Option B: Component-level CSS (recommended)**
- Split `styles.css` into component-specific files
- Use Astro's built-in CSS scoping

**Recommended approach:** Start with Option A, refactor to Option B later.

### 4.2 CSS File Structure

```
src/
└── styles/
    ├── global.css           # Base styles, variables, reset
    ├── calculator.css       # Calculator section
    ├── panels.css           # Panel components
    ├── tables.css           # Table styles
    └── responsive.css       # Media queries
```

---

## Phase 5: Backend API Separation

### 5.1 Extract API to Separate Service

Create `api/` directory for standalone backend:

```
api/
├── package.json
├── server.js               # Express/Fastify server
├── scraper.js              # Playwright scraping logic
└── vercel.json             # (if deploying to Vercel)
```

### 5.2 API Options

**Option A: Vercel Functions (Recommended)**
- Convert `scripts/serve.js` + `scripts/profile-scraper.js` to Vercel serverless function
- Deploy to Vercel alongside static Astro site
- Free tier available

**Option B: Cloudflare Workers**
- Use Cloudflare Workers with Playwright
- Requires paid plan for Playwright

**Option C: Standalone Node.js Service**
- Keep existing `scripts/` structure
- Deploy separately (Railway, Render, Fly.io)
- Update frontend to point to new API URL

### 5.3 CORS Configuration

Since frontend and API will be on different domains:
- Add CORS headers to API responses
- Configure allowed origins

---

## Phase 6: Data Migration

### 6.1 Static Data

**`src/data/syllabus-assertions.json`:**
- Copy from `data/syllabus-assertions.json`
- Import directly in components using `import` statement

### 6.2 Constants

Move all constants from `app.js` to dedicated files:
- `src/lib/milestones.ts` - MILESTONES array
- `src/lib/constants.ts` - WARNING_MESSAGES, REWARD_NOTICE, storage keys

---

## Phase 7: Testing Strategy

### 7.1 Preserve Existing Tests

The current `tests/run-cases.js` tests pure calculation logic. After migration:

1. **Keep pure logic tests working:**
   - Extract `calculator.ts`, `planner.ts` as pure functions
   - Tests should pass with minimal changes (just import paths)

2. **Update test imports:**
   ```js
   // Before
   const { calculateProgress } = require('../app.js');
   
   // After
   const { calculateProgress } = require('../src/lib/calculator.ts');
   ```

### 7.2 Add Component Tests (Optional)

Consider adding:
- Vitest for unit tests
- Playwright Component Testing for Preact components

---

## Phase 8: Build & Deploy

### 8.1 Build Commands

```bash
# Development
npm run dev          # Start Astro dev server

# Production
npm run build        # Build static site to dist/
npm run preview      # Preview production build locally
```

### 8.2 Deployment Options

**Vercel (Recommended):**
- Static site: Connect GitHub repo, auto-deploy
- API: Deploy `api/` directory as serverless functions
- Environment variables for API URL

**Netlify:**
- Static site: Connect repo, auto-deploy
- API: Use Netlify Functions

**GitHub Pages:**
- Static site only
- API must be separate

### 8.3 Environment Variables

```env
# Frontend
PUBLIC_API_URL=https://api.example.com

# Backend (if using Vercel)
PLAYWRIGHT_PATH=/path/to/chromium
```

---

## Migration Checklist

### Phase 1: Setup
- [ ] Initialize Astro project
- [ ] Install Astro + Preact dependencies
- [ ] Configure `astro.config.mjs`
- [ ] Update `package.json` scripts

### Phase 2: HTML Conversion
- [ ] Create BaseLayout.astro
- [ ] Convert index.html to index.astro
- [ ] Verify static rendering works

### Phase 3: JavaScript Conversion
- [ ] Extract calculator logic to `src/lib/calculator.ts`
- [ ] Extract milestone data to `src/lib/milestones.ts`
- [ ] Extract planner logic to `src/lib/planner.ts`
- [ ] Create CalculatorIsland component
- [ ] Create InputPanel component
- [ ] Create OutputPanel component
- [ ] Create TargetPanel component
- [ ] Create MilestoneTable component
- [ ] Create WarningList component
- [ ] Implement useCalculator hook
- [ ] Implement useLocalStorage hook
- [ ] Implement useScrape hook

### Phase 4: Styling
- [ ] Move CSS to `src/styles/`
- [ ] Import global styles in layout
- [ ] Test responsive behavior

### Phase 5: Backend Separation
- [ ] Create `api/` directory structure
- [ ] Extract scraper logic
- [ ] Configure CORS
- [ ] Deploy API separately
- [ ] Update frontend API URL

### Phase 6: Data
- [ ] Copy syllabus data to `src/data/`
- [ ] Update imports in components
- [ ] Verify data loading works

### Phase 7: Testing
- [ ] Update test imports
- [ ] Run existing tests
- [ ] Verify all calculations pass

### Phase 8: Build & Deploy
- [ ] Run `npm run build`
- [ ] Test production build locally
- [ ] Deploy to hosting platform
- [ ] Verify API connectivity

---

## Risk Assessment

### Low Risk
- Static HTML to Astro conversion (straightforward)
- CSS migration (can keep as-is initially)
- Data migration (just copy files)

### Medium Risk
- Preact component conversion (requires rewriting event handlers)
- State management (need to replicate vanilla JS state flow)
- Test updates (import paths change)

### High Risk
- Backend API separation (Playwright deployment complexity)
- CORS configuration (cross-origin requests)
- Environment-specific Playwright paths

---

## Timeline Estimate

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Setup | Low | 30 mins |
| Phase 2: HTML Conversion | Low | 1 hour |
| Phase 3: JavaScript Conversion | High | 4-6 hours |
| Phase 4: Styling | Low | 1 hour |
| Phase 5: Backend Separation | Medium | 2-3 hours |
| Phase 6: Data Migration | Low | 30 mins |
| Phase 7: Testing | Medium | 1-2 hours |
| Phase 8: Build & Deploy | Medium | 1-2 hours |
| **Total** | | **10-15 hours** |

---

## Next Steps

1. Review this plan and provide feedback
2. Approve or suggest modifications
3. Begin Phase 1: Project Setup
