const { scrapeProfileHtml } = require("../app.js");

async function scrapeProfileUrl(profileUrl) {
  const { chromium } = require("playwright");
  const browser = await launchBrowser(chromium);
  const page = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
  });

  try {
    await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
    await page.waitForTimeout(2500);

    const html = await page.content();
    const pageText = await page.locator("body").innerText({ timeout: 10000 }).catch(() => "");
    const links = await page
      .locator("a")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => ({
          text: anchor.textContent ? anchor.textContent.trim() : "",
          href: anchor.href
        }))
      )
      .catch(() => []);
    const parsed = scrapeProfileHtml(`${html}\n${pageText}\n${links.map((link) => `${link.text} ${link.href}`).join("\n")}`);

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
        release_month: game.release_month || "2026-07"
      })),
      completed_arcade_games: parsed.completed_arcade_games,
      missing_arcade_games: parsed.missing_arcade_games,
      target_arcade_games: parsed.target_arcade_games,
      skill_badge_targets: parsed.skill_badge_targets,
      completed_skill_badge_targets: parsed.completed_skill_badge_targets,
      missing_skill_badge_targets: parsed.missing_skill_badge_targets,
      diagnostics: {
        page_title: await page.title().catch(() => ""),
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
    return await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", headless: true });
  } catch (channelError) {
    try {
      return await chromium.launch({ headless: true });
    } catch (bundledError) {
      throw new Error(
        [
          "Playwright tidak bisa membuka browser.",
          "Pastikan Chrome terpasang atau jalankan: npx playwright install chromium",
          `Chrome channel error: ${channelError.message}`,
          `Bundled browser error: ${bundledError.message}`
        ].join("\n")
      );
    }
  }
}

module.exports = {
  scrapeProfileUrl
};
