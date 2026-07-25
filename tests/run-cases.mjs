import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from new module structure
import { calculateProgress, findHighestMilestone, getNextMilestone, getProgramStatus } from '../src/lib/calculator.js';
import { PUBLIC_PROFILE_URL_STORAGE_KEY, SCRAPED_PROFILE_STORAGE_KEY, MILESTONES } from '../src/lib/milestones.js';
import { loadPublicProfileUrl, savePublicProfileUrl, loadScrapedProfile, saveScrapedProfile, clearScrapedProfile } from '../src/lib/storage.js';
import { scrapeProfileHtml, extractEarnedBadges, buildScrapeProfileUrl } from '../src/lib/scraper.js';
import { getNextTargetPlan, loadSyllabus } from '../src/lib/planner.js';

// Load syllabus data
const syllabusPath = path.join(__dirname, '..', 'data', 'syllabus-assertions.json');
const syllabusAssertions = JSON.parse(readFileSync(syllabusPath, 'utf-8'));

// Mock localStorage for Node.js environment
const store = new Map();
global.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  }
};

const cases = [
  {
    input: { arcade_games_completed: 6, skill_badges_completed: 14, bonus_milestone_completed: false },
    expected: {
      game_points: 6,
      badge_points: 7,
      arcade_points: 13,
      highest_milestone: 'Milestone 1',
      milestone_bonus_points: 7,
      bonus_milestone_points: 0,
      total_points: 20
    }
  },
  {
    input: { arcade_games_completed: 6, skill_badges_completed: 14, bonus_milestone_completed: true },
    expected: {
      game_points: 6,
      badge_points: 7,
      arcade_points: 13,
      highest_milestone: 'Milestone 1',
      milestone_bonus_points: 7,
      bonus_milestone_points: 10,
      total_points: 30
    }
  },
  {
    input: { arcade_games_completed: 8, skill_badges_completed: 28, bonus_milestone_completed: true },
    expected: {
      game_points: 8,
      badge_points: 14,
      arcade_points: 22,
      highest_milestone: 'Milestone 2',
      milestone_bonus_points: 18,
      bonus_milestone_points: 10,
      total_points: 50
    }
  },
  {
    input: { arcade_games_completed: 10, skill_badges_completed: 42, bonus_milestone_completed: true },
    expected: {
      game_points: 10,
      badge_points: 21,
      arcade_points: 31,
      highest_milestone: 'Milestone 3',
      milestone_bonus_points: 29,
      bonus_milestone_points: 10,
      total_points: 70
    }
  },
  {
    input: { arcade_games_completed: 12, skill_badges_completed: 56, bonus_milestone_completed: true },
    expected: {
      game_points: 12,
      badge_points: 28,
      arcade_points: 40,
      highest_milestone: 'Ultimate Milestone',
      milestone_bonus_points: 40,
      bonus_milestone_points: 10,
      total_points: 90
    }
  },
  {
    input: { arcade_games_completed: 8, skill_badges_completed: 20, bonus_milestone_completed: false },
    expected: { highest_milestone: 'Milestone 1' }
  },
  {
    input: { arcade_games_completed: 12, skill_badges_completed: 14, bonus_milestone_completed: true },
    expected: { highest_milestone: 'Milestone 1', total_points: 36 }
  },
  {
    input: { arcade_games_completed: 0, skill_badges_completed: 0, bonus_milestone_completed: true },
    expected: { highest_milestone: 'Belum mencapai milestone', bonus_milestone_points: 0, total_points: 0 }
  },
  {
    input: { arcade_games_completed: 0, skill_badges_completed: 3, bonus_milestone_completed: false },
    expected: { badge_points: 1 }
  }
];

for (const testCase of cases) {
  const result = calculateProgress(testCase.input);
  assert.equal(result.errors.length, 0);

  for (const [key, value] of Object.entries(testCase.expected)) {
    assert.equal(result[key], value, `${key} mismatch for ${JSON.stringify(testCase.input)}`);
  }
}

assert.equal(calculateProgress({ arcade_games_completed: -1, skill_badges_completed: 0, bonus_milestone_completed: false }).errors.length, 1);
assert.equal(calculateProgress({ arcade_games_completed: 1.5, skill_badges_completed: 0, bonus_milestone_completed: false }).errors.length, 1);
assert.equal(PUBLIC_PROFILE_URL_STORAGE_KEY, 'google-skills-arcade:public-profile-url');
assert.equal(SCRAPED_PROFILE_STORAGE_KEY, 'google-skills-arcade:scraped-profile');
assert.equal(
  buildScrapeProfileUrl('https://www.skills.google/public_profiles/example'),
  '/api/scrape?url=https%3A%2F%2Fwww.skills.google%2Fpublic_profiles%2Fexample'
);
assert.equal(
  buildScrapeProfileUrl('https://www.skills.google/public_profiles/example', 'http://localhost:3001/'),
  'http://localhost:3001/api/scrape?url=https%3A%2F%2Fwww.skills.google%2Fpublic_profiles%2Fexample'
);

savePublicProfileUrl('  https://www.skills.google/public_profiles/example  ');
assert.equal(loadPublicProfileUrl(), 'https://www.skills.google/public_profiles/example');
savePublicProfileUrl('');
assert.equal(loadPublicProfileUrl(), null);

const storedProfile = {
  arcade_games_completed: 2,
  skill_badges_completed: 4,
  matched_arcade_games: [],
  completed_arcade_games: [],
  missing_arcade_games: [],
  target_arcade_games: [],
  skill_badge_targets: [],
  completed_skill_badge_targets: [],
  missing_skill_badge_targets: []
};
saveScrapedProfile('https://www.skills.google/public_profiles/example', storedProfile);
assert.deepEqual(loadScrapedProfile('https://www.skills.google/public_profiles/example'), storedProfile);
assert.equal(loadScrapedProfile('https://www.skills.google/public_profiles/other'), null);
clearScrapedProfile();
assert.equal(loadScrapedProfile('https://www.skills.google/public_profiles/example'), null);

assert.equal(syllabusAssertions.source.title, 'Silabus');
assert.equal(syllabusAssertions.source.program, 'Google Skills Arcade Fasilitator 2026');
assert.equal(syllabusAssertions.source.release_month, '2026-07');
assert.equal(syllabusAssertions.source.release_label, 'Juli 2026');
assert.equal(syllabusAssertions.arcade_games.length, 6);
assert.deepEqual(
  syllabusAssertions.arcade_games.map((game) => game.id).sort((left, right) => left - right),
  [7313, 7314, 7315, 7316, 7317, 7318]
);
assert.ok(syllabusAssertions.arcade_games.every((game) => game.type === 'arcade_game'));
assert.ok(syllabusAssertions.arcade_games.every((game) => game.status === 'active'));
assert.ok(syllabusAssertions.arcade_games.every((game) => game.completed === false));
assert.ok(syllabusAssertions.arcade_games.every((game) => game.release_month === '2026-07'));
assert.ok(syllabusAssertions.arcade_games.every((game) => game.url.includes(`games/${game.id}`)));
assert.deepEqual(
  syllabusAssertions.arcade_games.map((game) => game.name).sort(),
  [
    'Arcade Adventure: Low-Code Development',
    'Arcade Base Camp July 2026',
    'Arcade Simulator: Data Mesh Architect',
    'Arcade Trail: Google Workspace Administration',
    'Arcade Voyage: Cloud Storage and Data Governance',
    'Safe Spaces'
  ]
);
assert.equal(syllabusAssertions.meta.listed_skill_badges_total, 51);
assert.equal(syllabusAssertions.meta.additional_badges_needed_for_ultimate, 15);
assert.equal(syllabusAssertions.meta.arcade_game_catalog_scope, 'july_2026_release_only');
assert.deepEqual(syllabusAssertions.meta.program_period, {
  starts_at: '2026-07-13T10:00:00+07:00',
  ends_at: '2026-09-14T23:59:00+07:00'
});
assert.deepEqual(syllabusAssertions.meta.monthly_releases.july_2026.sort((left, right) => left - right), [7313, 7314, 7315, 7316, 7317, 7318]);
assert.deepEqual(syllabusAssertions.meta.listed_distribution, {
  beginner: 17,
  intermediate: 17,
  advanced: 17
});
assert.equal(
  Object.values(syllabusAssertions.skill_badges).reduce((total, badges) => total + badges.length, 0),
  51
);
assert.equal(syllabusAssertions.skill_badges.beginner.length, 17);
assert.equal(syllabusAssertions.skill_badges.intermediate.length, 17);
assert.equal(syllabusAssertions.skill_badges.advanced.length, 17);
assert.equal(syllabusAssertions.skill_badges.beginner[0].name, 'Membuat Aplikasi Gemini Enterprise Pertama Anda');
assert.equal(syllabusAssertions.skill_badges.intermediate[0].name, 'Merekayasa Agen AI dengan Agent Development Kit (ADK)');
assert.equal(syllabusAssertions.skill_badges.advanced[16].name, 'Google DeepMind: Train A Small Language Model');
assert.ok(Object.values(syllabusAssertions.skill_badges).flat().every((badge) => badge.url.startsWith('https://www.skills.google/')));
assert.ok(syllabusAssertions.skill_badges.beginner.every((badge) => badge.level === 'Beginner' && badge.completed === false));
assert.ok(syllabusAssertions.skill_badges.intermediate.every((badge) => badge.level === 'Intermediate' && badge.completed === false));
assert.ok(syllabusAssertions.skill_badges.advanced.every((badge) => badge.level === 'Advanced' && badge.completed === false));

const activeProgram = getProgramStatus(new Date('2026-07-24T12:00:00+07:00'));
assert.equal(activeProgram.active, true);
assert.equal(activeProgram.release_key, 'july_2026');
assert.equal(activeProgram.release_label, 'Juli 2026');
assert.equal(getProgramStatus(new Date('2026-07-13T09:59:00+07:00')).active, false);
assert.equal(getProgramStatus(new Date('2026-09-15T00:00:00+07:00')).active, false);

const earnedBadgeSample = extractEarnedBadges(`
  Build a Data Warehouse with BigQuery
  Earned Jul 21, 2026 WIB
  Arcade Basecamp
  Earned Jul 22, 2026 WIB
`);
assert.deepEqual(
  earnedBadgeSample.map((badge) => badge.name),
  ['Build a Data Warehouse with BigQuery', 'Arcade Basecamp']
);

const unmatchedEarnedSample = scrapeProfileHtml(`
  Build a Data Warehouse with BigQuery
  Earned Jul 21, 2026 WIB
`, syllabusAssertions);
assert.equal(unmatchedEarnedSample.skill_badges_completed, 1);
assert.equal(Object.hasOwn(unmatchedEarnedSample, 'completed_skill_badges'), false);
assert.equal(unmatchedEarnedSample.completed_skill_badge_targets.length, 0);
assert.equal(unmatchedEarnedSample.missing_skill_badge_targets.length, 51);

const matchedEarnedSample = scrapeProfileHtml(`
  Build Global and Regional Load Balancing Solutions
  Earned Jul 21, 2026 WIB
`, syllabusAssertions);
assert.equal(matchedEarnedSample.skill_badges_completed, 1);
assert.equal(Object.hasOwn(matchedEarnedSample, 'completed_skill_badges'), false);
assert.deepEqual(
  matchedEarnedSample.completed_skill_badge_targets.map((badge) => badge.name),
  ['Build Global and Regional Load Balancing Solutions']
);

const scrapedSample = scrapeProfileHtml(`
  <main>
    <a href="https://www.skills.google/games/7314">Low Code</a>
    <a href="https://www.skills.google/games/7315">Bucket</a>
    <article>Skill Badge: Build a Data Warehouse</article>
    <article>Skill Badge: Set Up an App Dev Environment</article>
    <article>Badge Keahlian: Cloud Run Functions</article>
  </main>
`, syllabusAssertions);
assert.equal(scrapedSample.arcade_games_completed, 2);
assert.equal(scrapedSample.skill_badges_completed, 3);
assert.equal(Object.hasOwn(scrapedSample, 'completed_skill_badges'), false);
assert.equal(scrapedSample.target_arcade_games.length, 6);
assert.equal(scrapedSample.skill_badge_targets.length, 51);
assert.equal(scrapedSample.completed_arcade_games.length, 2);
assert.equal(scrapedSample.missing_arcade_games.length, 4);
assert.equal(scrapedSample.completed_skill_badge_targets.length, 3);
assert.equal(scrapedSample.missing_skill_badge_targets.length, 48);
assert.ok(scrapedSample.target_arcade_games.every((game) => game.url.includes(`games/${game.id}`)));
assert.equal(scrapedSample.skill_badge_targets[0].name, 'Membuat Aplikasi Gemini Enterprise Pertama Anda');
assert.equal(scrapedSample.skill_badge_targets[0].url, 'https://www.skills.google/paths/3546/course_templates/1586?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26');
assert.ok(scrapedSample.skill_badge_targets.every((badge) => badge.url.startsWith('https://www.skills.google/')));
assert.deepEqual(
  scrapedSample.matched_arcade_games.map((game) => game.id).sort((left, right) => left - right),
  [7314, 7315]
);
assert.deepEqual(
  scrapedSample.target_arcade_games.filter((game) => !game.completed).map((game) => game.name).sort(),
  ['Arcade Base Camp July 2026', 'Arcade Simulator: Data Mesh Architect', 'Arcade Trail: Google Workspace Administration', 'Safe Spaces']
);
assert.deepEqual(
  scrapedSample.skill_badge_targets.slice(0, 3).map((badge) => badge.completed),
  [true, true, true]
);
assert.equal(scrapedSample.skill_badge_targets[3].completed, false);

const sampleProgress = calculateProgress({
  arcade_games_completed: scrapedSample.arcade_games_completed,
  skill_badges_completed: scrapedSample.skill_badges_completed,
  bonus_milestone_completed: false
});
const targetPlan = getNextTargetPlan(syllabusAssertions, sampleProgress, scrapedSample.arcade_games_completed, [], scrapedSample);
assert.equal(targetPlan.nextMilestone.name, 'Milestone 1');
assert.equal(targetPlan.gameGap, 4);
assert.equal(targetPlan.badgeGap, 11);
assert.equal(targetPlan.completedSkillTargets.length, 3);
assert.equal(targetPlan.missingSkillTargets.length, 48);
assert.equal(targetPlan.remainingArcadeTargets.length, 4);
assert.equal(targetPlan.remainingSkillTargets.length, 11);

const officialAssertionPlan = getNextTargetPlan(
  syllabusAssertions,
  calculateProgress({ arcade_games_completed: 0, skill_badges_completed: 1, bonus_milestone_completed: false }),
  0,
  [],
  matchedEarnedSample
);
assert.deepEqual(
  officialAssertionPlan.completedSkillTargets.map((badge) => badge.name),
  ['Build Global and Regional Load Balancing Solutions']
);
assert.equal(officialAssertionPlan.missingSkillTargets.length, 50);

console.log('All milestone calculation cases passed.');
