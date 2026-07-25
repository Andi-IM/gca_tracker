import { normalizeText, normalizeTitle, decodeHtml, escapeRegExp } from './utils';
import { getOfficialSkillBadges, skillBadgeNamesMatch, buildArcadeGameTargets, buildSkillBadgeTargets } from './planner';
import type { ArcadeGame, SkillBadge, SyllabusAssertions, ScrapedProfile, CompletedSkillBadge } from './types';

const SKILL_BADGE_TEXT_PATTERN = /\b(skill badge|badge keahlian|completion badge|completed badge|google cloud skill badge)\b/i;

export function extractEarnedBadges(html: string): CompletedSkillBadge[] {
  const lines = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .split(/\n+/)
    .map((line) => decodeHtml(line).trim())
    .filter(Boolean);
  const badges: { name: string; earned_at_label: string; url: string | null }[] = [];

  lines.forEach((line, index) => {
    const earnedMatch = line.match(/^Earned\s+(.+)$/i);
    const previousLine = lines[index - 1];

    if (earnedMatch && previousLine && !/^Earned\s+/i.test(previousLine)) {
      badges.push({
        name: previousLine,
        earned_at_label: earnedMatch[1],
        url: null
      });
    }
  });

  return dedupeByName(badges);
}

function isArcadeBadgeTitle(title: string): boolean {
  return /\barcade\b/i.test(title);
}

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeTitle(item.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichCompletedSkillBadges(badges: CompletedSkillBadge[], officialBadges: SkillBadge[]): CompletedSkillBadge[] {
  return badges.map((badge) => {
    const matchedBadge = officialBadges.find((officialBadge) => skillBadgeNamesMatch(officialBadge, badge.name));
    return matchedBadge ? { ...badge, official_id: matchedBadge.id } : badge;
  });
}

function findCompletedJulyArcadeGames(html: string, normalizedText: string, arcadeGames: ArcadeGame[]): ArcadeGame[] {
  return arcadeGames.filter((game) => {
    const gameUrlPattern = new RegExp(`(?:/games/|games%2F)${game.id}(?:\\D|$)`, 'i');
    const codePattern = new RegExp(escapeRegExp(game.code), 'i');
    const namePattern = new RegExp(`\\b${escapeRegExp(game.name)}\\b`, 'i');
    return gameUrlPattern.test(html) || codePattern.test(html) || namePattern.test(normalizedText);
  });
}

function countSkillBadgesFromHtml(html: string): number {
  if (typeof DOMParser !== 'undefined') {
    const documentValue = new DOMParser().parseFromString(html, 'text/html');
    const badgeNodes = Array.from(documentValue.querySelectorAll('a, article, li, div, section')).filter((node) => {
      const nodeText = normalizeText(node.textContent || '');
      return SKILL_BADGE_TEXT_PATTERN.test(nodeText) && !/\barcade\b/i.test(nodeText);
    });
    const uniqueLabels = new Set(badgeNodes.map((node) => normalizeText(node.textContent || '')).filter(Boolean));
    if (uniqueLabels.size > 0) return uniqueLabels.size;
  }
  const matches = normalizeText(html).match(new RegExp(SKILL_BADGE_TEXT_PATTERN.source, 'gi'));
  return matches ? matches.length : 0;
}

export function scrapeProfileHtml(html: string, syllabus: SyllabusAssertions): ScrapedProfile {
  const text = normalizeText(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));
  const earnedBadges = extractEarnedBadges(html);
  const arcadeGameMatches = findCompletedJulyArcadeGames(html, text, syllabus.arcade_games);
  const officialBadges = getOfficialSkillBadges(syllabus);
  const completedSkillBadges = enrichCompletedSkillBadges(
    earnedBadges.filter((badge) => !isArcadeBadgeTitle(badge.name)),
    officialBadges
  );
  const skillBadgeCount = completedSkillBadges.length > 0 ? completedSkillBadges.length : countSkillBadgesFromHtml(html);
  const targetArcadeGames = buildArcadeGameTargets(syllabus, arcadeGameMatches);
  const skillBadgeTargets = buildSkillBadgeTargets(syllabus, skillBadgeCount, completedSkillBadges);

  return {
    arcade_games_completed: arcadeGameMatches.length,
    skill_badges_completed: skillBadgeCount,
    completed_skill_badges: completedSkillBadges,
    matched_arcade_games: arcadeGameMatches,
    completed_arcade_games: targetArcadeGames.filter((game) => game.completed),
    missing_arcade_games: targetArcadeGames.filter((game) => !game.completed),
    target_arcade_games: targetArcadeGames,
    skill_badge_targets: skillBadgeTargets,
    completed_skill_badge_targets: skillBadgeTargets.filter((badge) => badge.completed),
    missing_skill_badge_targets: skillBadgeTargets.filter((badge) => !badge.completed)
  };
}

function getConfiguredApiBaseUrl(): string {
  return ((import.meta as unknown as { env?: { PUBLIC_API_URL?: string } }).env?.PUBLIC_API_URL || '').replace(/\/+$/, '');
}

export function buildScrapeProfileUrl(url: string, apiBaseUrl = getConfiguredApiBaseUrl()): string {
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const endpoint = `${normalizedApiBaseUrl}/api/scrape`;
  return `${endpoint}?url=${encodeURIComponent(url)}`;
}

export async function scrapePublicProfile(url: string): Promise<ScrapedProfile> {
  let response: Response;
  try {
    response = await fetch(buildScrapeProfileUrl(url), { credentials: 'omit' });
  } catch {
    throw new Error('API scraper belum berjalan. Jalankan server API di http://localhost:3001 lalu coba lagi.');
  }

  if (response.status === 404) {
    throw new Error('Endpoint scraper tidak ditemukan. Pastikan Astro dev proxy atau PUBLIC_API_URL mengarah ke server API.');
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  
  return data;
}
