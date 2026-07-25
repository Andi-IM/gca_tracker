import { useState, useEffect } from 'preact/hooks';
import { calculateProgress } from '../lib/calculator';
import { loadSyllabus } from '../lib/planner';
import { scrapePublicProfile } from '../lib/scraper';
import { loadPublicProfileUrl, savePublicProfileUrl } from '../lib/storage';
import type { CalculatorResult } from '../lib/calculator';
import type { ScrapedProfile, SyllabusAssertions } from '../lib/types';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import TargetPanel from './TargetPanel';

export default function CalculatorIsland() {
  const [arcadeGames, setArcadeGames] = useState(0);
  const [skillBadges, setSkillBadges] = useState(0);
  const [bonusMilestone, setBonusMilestone] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState('');
  const [scrapeResult, setScrapeResult] = useState<ScrapedProfile | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusAssertions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState('');

  useEffect(() => {
    // Load syllabus data
    loadSyllabus().then(setSyllabus);
    
    // Load saved URL
    const savedUrl = loadPublicProfileUrl();
    if (savedUrl) {
      setPublicProfileUrl(savedUrl);
      setStorageStatus('URL tersimpan sementara di browser ini.');
    } else {
      setStorageStatus('URL belum diisi. Jika diisi, URL akan disimpan sementara di browser ini.');
    }
  }, []);

  const result: CalculatorResult = syllabus ? calculateProgress({
    arcade_games_completed: arcadeGames,
    skill_badges_completed: skillBadges,
    bonus_milestone_completed: bonusMilestone
  }) : { errors: [] };

  const handleUrlChange = (url: string) => {
    setPublicProfileUrl(url);
    savePublicProfileUrl(url);
    setStorageStatus(url.trim()
      ? 'URL tersimpan sementara di browser ini.'
      : 'URL belum diisi. Jika diisi, URL akan disimpan sementara di browser ini.');
  };

  const handleClearUrl = () => {
    setPublicProfileUrl('');
    savePublicProfileUrl('');
    setStorageStatus('URL belum diisi. Jika diisi, URL akan disimpan sementara di browser ini.');
  };

  const handleScrape = async () => {
    if (!publicProfileUrl.trim()) {
      setError('Isi URL publik Skills Google terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStorageStatus('Membaca profil publik...');

    try {
      const scraped = await scrapePublicProfile(publicProfileUrl);
      setScrapeResult(scraped);
      setArcadeGames(scraped.arcade_games_completed);
      setSkillBadges(scraped.skill_badges_completed);
      setStorageStatus(`Profil terbaca: ${scraped.arcade_games_completed} Arcade Games Juli dan ${scraped.skill_badges_completed} Badge Keahlian terdeteksi.`);
    } catch (err) {
      setError(`Profil publik belum bisa dibaca: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="calculator-content">
      <InputPanel
        publicProfileUrl={publicProfileUrl}
        arcadeGames={arcadeGames}
        skillBadges={skillBadges}
        bonusMilestone={bonusMilestone}
        storageStatus={storageStatus}
        isLoading={isLoading}
        error={error}
        onUrlChange={handleUrlChange}
        onClearUrl={handleClearUrl}
        onScrape={handleScrape}
        onArcadeGamesChange={setArcadeGames}
        onSkillBadgesChange={setSkillBadges}
        onBonusMilestoneChange={setBonusMilestone}
      />
      <OutputPanel result={result} />
      {syllabus && (
        <TargetPanel
          syllabus={syllabus}
          result={result}
          scrapeResult={scrapeResult}
          arcadeGames={arcadeGames}
          skillBadges={skillBadges}
        />
      )}
    </div>
  );
}
