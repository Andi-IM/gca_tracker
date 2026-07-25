import express from 'express';
import cors from 'cors';
import { scrapeProfileUrl } from './scraper.js';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Scrape profile endpoint
app.get('/api/scrape', async (req, res) => {
  const profileUrl = req.query.url;

  if (!profileUrl || !profileUrl.startsWith('https://www.skills.google/public_profiles/')) {
    return res.status(400).json({ error: 'URL profil publik Skills Google tidak valid.' });
  }

  try {
    const result = await scrapeProfileUrl(profileUrl);
    res.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(502).json({ error: formatScrapeError(error) });
  }
});

function formatScrapeError(error) {
  const message = error instanceof Error ? error.message : 'Scrape gagal.';

  if (message.includes('spawn EPERM')) {
    return 'Playwright tidak bisa membuka Chrome dari proses server ini. Tutup server yang sedang berjalan, lalu jalankan npm start langsung dari terminal PowerShell biasa.';
  }

  if (message.includes("Executable doesn't exist") || message.includes('playwright install')) {
    return 'Browser Playwright belum terpasang. Jalankan npx playwright install chromium, lalu ulangi npm start.';
  }

  return message;
}

app.listen(port, () => {
  console.log(`Arcade Tracker API siap di http://localhost:${port}`);
  console.log('CORS enabled for all origins.');
});
