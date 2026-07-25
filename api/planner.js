import { normalizeTitle } from './utils.js';

export function getOfficialSkillBadges(syllabus) {
  const levels = ['beginner', 'intermediate', 'advanced'];
  return levels.flatMap((levelKey) => syllabus.skill_badges?.[levelKey] || []);
}

export function skillBadgeNamesMatch(officialBadge, completedBadgeName) {
  const aliases = Array.isArray(officialBadge.aliases) ? officialBadge.aliases : [];
  const candidateNames = [officialBadge.name, ...aliases].map((name) => normalizeTitle(name));
  return candidateNames.includes(normalizeTitle(completedBadgeName));
}

export function buildArcadeGameTargets(syllabus, matchedArcadeGames) {
  const matchedIds = new Set(matchedArcadeGames.map((game) => game.id));
  return syllabus.arcade_games.map((game) => ({
    id: game.id,
    name: game.name,
    code: game.code,
    url: game.url || null,
    release_month: game.release_month || '2026-07',
    completed: matchedIds.has(game.id)
  }));
}

export function buildSkillBadgeTargets(syllabus, completedCount, completedBadges = []) {
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

export function buildSkillBadgeCatalogUrl(badgeName) {
  return `https://www.skills.google/catalog?skill-badge%5B%5D=skill-badge&keywords=${encodeURIComponent(badgeName)}`;
}
