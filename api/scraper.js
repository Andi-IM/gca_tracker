import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load syllabus data
const syllabusPath = join(__dirname, '..', 'data', 'syllabus-assertions.json');
const syllabus = JSON.parse(readFileSync(syllabusPath, 'utf-8'));

// Import scraper functions
import { normalizeText, normalizeTitle, decodeHtml, escapeRegExp } from './utils.js';
import { getOfficialSkillBadges, skillBadgeNamesMatch, buildArcadeGameTargets, buildSkillBadgeTargets } from './planner.js';

const SKILL_BADGE_TEXT_PATTERN = /\b(skill badge|badge keahlian|completion badge|completed badge|google cloud skill badge)\b/i;

function extractEarnedBadges(html) {
  const lines = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .split(/\n+/)
    .map((line) => decodeHtml(line).trim())
    .filter(Boolean);
  const badges = [];

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

function isArcadeBadgeTitle(title) {
  return /\barcade\b/i.test(title);
}

function dedupeByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeTitle(item.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichCompletedSkillBadges(badges, officialBadges) {
  return badges.map((badge) => {
    const matchedBadge = officialBadges.find((officialBadge) => skillBadgeNamesMatch(officialBadge, badge.name));
    return matchedBadge ? { ...badge, official_id: matchedBadge.id } : badge;
  });
}

function findCompletedJulyArcadeGames(html, normalizedText, arcadeGames) {
  return arcadeGames.filter((game) => {
    const gameUrlPattern = new RegExp(`(?:/games/|games%2F)${game.id}(?:\\D|$)`, 'i');
    const codePattern = new RegExp(escapeRegExp(game.code), 'i');
    const namePattern = new RegExp(`\\b${escapeRegExp(game.name)}\\b`, 'i');
    return gameUrlPattern.test(html) || codePattern.test(html) || namePattern.test(normalizedText);
  });
}

function countSkillBadgesFromHtml(html) {
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

function scrapeProfileHtml(html) {
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
    matched_arcade_games: arcadeGameMatches,
    completed_arcade_games: targetArcadeGames.filter((game) => game.completed),
    missing_arcade_games: targetArcadeGames.filter((game) => !game.completed),
    target_arcade_games: targetArcadeGames,
    skill_badge_targets: skillBadgeTargets,
    completed_skill_badge_targets: skillBadgeTargets.filter((badge) => badge.completed),
    missing_skill_badge_targets: skillBadgeTargets.filter((badge) => !badge.completed)
  };
}

export async function scrapeProfileUrl(profileUrl) {
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
  });

  try {
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
    await page.waitForTimeout(2500);

    const html = await page.content();
    const pageText = await page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
    const links = await page
      .locator('a')
      .evaluateAll((anchors) =>
        anchors.map((anchor) => ({
          text: anchor.textContent ? anchor.textContent.trim() : '',
          href: anchor.href
        }))
      )
      .catch(() => []);
    const parsed = scrapeProfileHtml(`${html}\n${pageText}\n${links.map((link) => `${link.text} ${link.href}`).join('\n')}`);

    return {
      source_url: profileUrl,
      scraped_at: new Date().toISOString(),
      arcade_games_completed: parsed.arcade_games_completed,
      skill_badges_completed: parsed.skill_badges_completed,
      matched_arcade_games: parsed.matched_arcade_games.map((game) => ({
        id: game.id,
        name: game.name,
        code: game.code,
        url: game.url,
        release_month: game.release_month || '2026-07'
      })),
      completed_arcade_games: parsed.completed_arcade_games,
      missing_arcade_games: parsed.missing_arcade_games,
      target_arcade_games: parsed.target_arcade_games,
      skill_badge_targets: parsed.skill_badge_targets,
      completed_skill_badge_targets: parsed.completed_skill_badge_targets,
      missing_skill_badge_targets: parsed.missing_skill_badge_targets,
      diagnostics: {
        page_title: await page.title().catch(() => ''),
        link_count: links.length,
        body_text_length: pageText.length
      }
    };
  } finally {
    await browser.close();
  }
}

async function launchBrowser(chromium) {
  try {
    return await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
  } catch (channelError) {
    try {
      return await chromium.launch({ headless: true });
    } catch (bundledError) {
      throw new Error(
        [
          'Playwright tidak bisa membuka browser.',
          'Pastikan Chrome terpasang atau jalankan: npx playwright install chromium',
          `Chrome channel error: ${channelError.message}`,
          `Bundled browser error: ${bundledError.message}`
        ].join('\n')
      );
    }
  }
}
