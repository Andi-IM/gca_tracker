import type { ArcadeGame, SkillBadge, SyllabusAssertions, ScrapedProfile, TargetPlan } from './types';
import { normalizeTitle } from './utils';
import type { CalculatorResult } from './calculator';

// This will be loaded from the JSON file
let syllabusData: SyllabusAssertions | null = null;

export async function loadSyllabus(): Promise<SyllabusAssertions> {
  if (syllabusData) return syllabusData;
  
  // In browser, fetch from public directory
  if (typeof window !== 'undefined') {
    const response = await fetch('/data/syllabus-assertions.json');
    syllabusData = await response.json();
  } else {
    // In Node.js (for tests)
    const fs = await import('fs');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'syllabus-assertions.json');
    syllabusData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }
  
  return syllabusData!;
}

export function getOfficialSkillBadges(syllabus: SyllabusAssertions): SkillBadge[] {
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  return levels.flatMap((levelKey) => syllabus.skill_badges?.[levelKey] || []);
}

export function skillBadgeNamesMatch(officialBadge: SkillBadge, completedBadgeName: string): boolean {
  const aliases = Array.isArray(officialBadge.aliases) ? officialBadge.aliases : [];
  const candidateNames = [officialBadge.name, ...aliases].map((name) => normalizeTitle(name));
  return candidateNames.includes(normalizeTitle(completedBadgeName));
}

export function buildArcadeGameTargets(syllabus: SyllabusAssertions, matchedArcadeGames: ArcadeGame[]): ArcadeGame[] {
  const matchedIds = new Set(matchedArcadeGames.map((game) => game.id));
  return syllabus.arcade_games.map((game) => ({
    id: game.id,
    name: game.name,
    code: game.code,
    url: game.url || undefined,
    release_month: game.release_month || '2026-07',
    completed: matchedIds.has(game.id)
  }));
}

export function buildSkillBadgeTargets(
  syllabus: SyllabusAssertions,
  completedCount: number,
  completedBadges: { name: string }[] = []
): SkillBadge[] {
  let remainingCompleted = completedCount;
  const completedNames = new Set(completedBadges.map((badge) => normalizeTitle(badge.name || '')).filter(Boolean));
  const shouldMatchByName = completedNames.size > 0;

  return getOfficialSkillBadges(syllabus).map((badge) => {
    const completed = shouldMatchByName
      ? completedBadges.some((completedBadge) => skillBadgeNamesMatch(badge, completedBadge.name || ''))
      : remainingCompleted > 0;
    if (!shouldMatchByName && completed) {
      remainingCompleted -= 1;
    }

    return {
      id: badge.id,
      name: badge.name,
      level: badge.level,
      url: badge.url || buildSkillBadgeCatalogUrl(badge.name),
      completed
    };
  });
}

export function buildSkillBadgeCatalogUrl(badgeName: string): string {
  return `https://www.skills.google/catalog?skill-badge%5B%5D=skill-badge&keywords=${encodeURIComponent(badgeName)}`;
}

export function getNextTargetPlan(
  syllabus: SyllabusAssertions,
  result: CalculatorResult,
  completedGames: number,
  completedBadges: { name: string }[] = [],
  scraped: ScrapedProfile | null = null
): TargetPlan {
  const nextMilestone = result.next_milestone;
  const gameGap = result.gaps?.games ?? 0;
  const badgeGap = result.gaps?.badges ?? 0;
  const arcadeTargets = scraped?.target_arcade_games || buildArcadeGameTargets(syllabus, scraped?.matched_arcade_games || []);
  const skillTargets = scraped?.skill_badge_targets || buildSkillBadgeTargets(syllabus, completedBadges.length, completedBadges);
  const completedSkillTargets = skillTargets.filter((badge) => badge.completed);
  const missingSkillTargets = skillTargets.filter((badge) => !badge.completed);

  return {
    nextMilestone,
    gameGap,
    badgeGap,
    arcadeTargets,
    skillTargets,
    completedSkillTargets,
    missingSkillTargets,
    remainingArcadeTargets: gameGap > 0 ? arcadeTargets.filter((game) => !game.completed).slice(0, gameGap) : [],
    remainingSkillTargets: badgeGap > 0 ? missingSkillTargets.slice(0, badgeGap) : []
  };
}
