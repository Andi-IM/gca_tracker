const MILESTONES = [
  {
    id: "milestone_1",
    name: "Milestone 1",
    requirements: { arcade_games: 6, skill_badges: 14 },
    points: { game_points: 6, badge_points: 7, bonus_points: 7, total_arcade_points: 13, total_with_bonus_points: 20 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 30 }
  },
  {
    id: "milestone_2",
    name: "Milestone 2",
    requirements: { arcade_games: 8, skill_badges: 28 },
    points: { game_points: 8, badge_points: 14, bonus_points: 18, total_arcade_points: 22, total_with_bonus_points: 40 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 50 }
  },
  {
    id: "milestone_3",
    name: "Milestone 3",
    requirements: { arcade_games: 10, skill_badges: 42 },
    points: { game_points: 10, badge_points: 21, bonus_points: 29, total_arcade_points: 31, total_with_bonus_points: 60 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 70 }
  },
  {
    id: "ultimate_milestone",
    name: "Ultimate Milestone",
    requirements: { arcade_games: 12, skill_badges: 56 },
    points: { game_points: 12, badge_points: 28, bonus_points: 40, total_arcade_points: 40, total_with_bonus_points: 80 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 90 }
  }
];

const WARNING_MESSAGES = [
  "Jangan mengakumulasi bonus dari beberapa milestone.",
  "Gunakan hanya bonus dari milestone tertinggi yang tercapai.",
  "Milestone tidak boleh dianggap tercapai jika hanya jumlah game atau hanya jumlah badge yang memenuhi syarat.",
  "Perhitungan Badge Keahlian harus menggunakan floor per 2 badge = 1 poin.",
  "Mencapai milestone fasilitator tidak otomatis menjamin hadiah atau swag."
];

const REWARD_NOTICE =
  "Mencapai milestone fasilitator tidak otomatis membuat peserta memenuhi syarat mendapatkan swag atau hadiah. Bonus poin hanya menambah poin Arcade untuk membantu mencapai pencapaian Google Skills Arcade Player.";

const PUBLIC_PROFILE_URL_STORAGE_KEY = "google-skills-arcade:public-profile-url";
const SKILL_BADGE_TEXT_PATTERN = /\b(skill badge|badge keahlian|completion badge|completed badge|google cloud skill badge)\b/i;
const PROGRAM_PERIOD = {
  starts_at: "2026-07-13T10:00:00+07:00",
  ends_at: "2026-09-14T23:59:00+07:00"
};
const JULY_ARCADE_GAME_ASSERTIONS = [
  {
    id: 7314,
    name: "Low Code",
    code: "1q-lowcode-92316",
    url: "https://www.skills.google/games/7314?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  },
  {
    id: 7315,
    name: "Bucket",
    code: "1q-bucket-58231",
    url: "https://www.skills.google/games/7315?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  },
  {
    id: 7316,
    name: "Workspace",
    code: "1q-workspace-31069",
    url: "https://www.skills.google/games/7316?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  },
  {
    id: 7313,
    name: "Basecamp",
    code: "1q-basecamp-07511",
    url: "https://www.skills.google/games/7313?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  },
  {
    id: 7318,
    name: "Security",
    code: "1q-security-19110",
    url: "https://www.skills.google/games/7318?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  },
  {
    id: 7317,
    name: "Data Mesh",
    code: "1q-datamesh-16451",
    url: "https://www.skills.google/games/7317?utm_source=gcaf-site&utm_medium=website&utm_campaign=arcade-facilitator26",
    release_month: "2026-07"
  }
];
let latestScrapeResult = null;

function validateInputValue(value, label) {
  if (value === "" || value === null || value === undefined) {
    return { value: 0, error: null };
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return { value: 0, error: `${label} harus berupa bilangan bulat dan tidak negatif.` };
  }

  return { value: numericValue, error: null };
}

function findHighestMilestone(arcadeGamesCompleted, skillBadgesCompleted) {
  return [...MILESTONES]
    .reverse()
    .find(
      (milestone) =>
        arcadeGamesCompleted >= milestone.requirements.arcade_games &&
        skillBadgesCompleted >= milestone.requirements.skill_badges
    );
}

function getNextMilestone(highestMilestone) {
  if (!highestMilestone) {
    return MILESTONES[0];
  }

  const index = MILESTONES.findIndex((milestone) => milestone.id === highestMilestone.id);
  return MILESTONES[index + 1] || null;
}

function calculateProgress(input) {
  const gameValidation = validateInputValue(input.arcade_games_completed, "Jumlah Arcade Games selesai");
  const badgeValidation = validateInputValue(input.skill_badges_completed, "Jumlah Badge Keahlian selesai");
  const errors = [gameValidation.error, badgeValidation.error].filter(Boolean);

  if (errors.length > 0) {
    return { errors };
  }

  const arcadeGamesCompleted = gameValidation.value;
  const skillBadgesCompleted = badgeValidation.value;
  const gamePoints = arcadeGamesCompleted;
  const badgePoints = Math.floor(skillBadgesCompleted / 2);
  const arcadePoints = gamePoints + badgePoints;
  const highestMilestone = findHighestMilestone(arcadeGamesCompleted, skillBadgesCompleted);
  const milestoneBonusPoints = highestMilestone ? highestMilestone.points.bonus_points : 0;
  const bonusMilestonePoints =
    highestMilestone && input.bonus_milestone_completed ? highestMilestone.bonus_milestone.extra_bonus_points : 0;
  const totalPoints = arcadePoints + milestoneBonusPoints + bonusMilestonePoints;
  const nextMilestone = getNextMilestone(highestMilestone);

  return {
    errors: [],
    game_points: gamePoints,
    badge_points: badgePoints,
    arcade_points: arcadePoints,
    highest_milestone: highestMilestone ? highestMilestone.name : "Belum mencapai milestone",
    highest_milestone_id: highestMilestone ? highestMilestone.id : null,
    milestone_bonus_points: milestoneBonusPoints,
    bonus_milestone_points: bonusMilestonePoints,
    total_points: totalPoints,
    next_milestone_status: buildNextMilestoneStatus(nextMilestone, arcadeGamesCompleted, skillBadgesCompleted),
    reward_notice: REWARD_NOTICE
  };
}

function scrapeProfileHtml(html) {
  const text = normalizeText(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
  const earnedBadges = extractEarnedBadges(html);
  const arcadeGameMatches = findCompletedJulyArcadeGames(html, text);
  const completedSkillBadges = enrichCompletedSkillBadges(earnedBadges.filter((badge) => !isArcadeBadgeTitle(badge.name)));
  const skillBadgeCount = completedSkillBadges.length > 0 ? completedSkillBadges.length : countSkillBadgesFromHtml(html);
  const targetArcadeGames = buildArcadeGameTargets(arcadeGameMatches);
  const skillBadgeTargets = buildSkillBadgeTargets(skillBadgeCount, completedSkillBadges);

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

function extractEarnedBadges(html) {
  const lines = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
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

function enrichCompletedSkillBadges(badges) {
  const officialBadges = getOfficialSkillBadges();

  return badges.map((badge) => {
    const matchedBadge = officialBadges.find((officialBadge) => skillBadgeNamesMatch(officialBadge, badge.name));

    if (!matchedBadge) {
      return {
        ...badge
      };
    }

    return {
      ...badge,
      official_id: matchedBadge.id
    };
  });
}

function isArcadeBadgeTitle(title) {
  return /\barcade\b/i.test(title);
}

function dedupeByName(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = normalizeTitle(item.name);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getOfficialSkillBadges() {
  const syllabus = requireSyllabusAssertions();
  const levels = ["beginner", "intermediate", "advanced"];

  return levels.flatMap((levelKey) => syllabus.skill_badges?.[levelKey] || []);
}

function skillBadgeNamesMatch(officialBadge, completedBadgeName) {
  const aliases = Array.isArray(officialBadge.aliases) ? officialBadge.aliases : [];
  const candidateNames = [officialBadge.name, ...aliases].map(normalizeTitle);

  return candidateNames.includes(normalizeTitle(completedBadgeName));
}

function buildArcadeGameTargets(matchedArcadeGames) {
  const matchedIds = new Set(matchedArcadeGames.map((game) => game.id));

  return requireSyllabusAssertions().arcade_games.map((game) => ({
    id: game.id,
    name: game.name,
    code: game.code,
    url: game.url || null,
    release_month: game.release_month || "2026-07",
    completed: matchedIds.has(game.id)
  }));
}

function buildSkillBadgeTargets(completedCount, completedBadges = []) {
  let remainingCompleted = completedCount;
  const completedNames = new Set(completedBadges.map((badge) => normalizeTitle(badge.name || badge)).filter(Boolean));
  const shouldMatchByName = completedNames.size > 0;

  return getOfficialSkillBadges().map((badge) => {
    const completed = shouldMatchByName
      ? completedBadges.some((completedBadge) => skillBadgeNamesMatch(badge, completedBadge.name || completedBadge))
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

function buildSkillBadgeCatalogUrl(badgeName) {
  return `https://www.skills.google/catalog?skill-badge%5B%5D=skill-badge&keywords=${encodeURIComponent(badgeName)}`;
}

function findCompletedJulyArcadeGames(html, normalizedText) {
  return requireSyllabusAssertions().arcade_games.filter((game) => {
    const gameUrlPattern = new RegExp(`(?:/games/|games%2F)${game.id}(?:\\D|$)`, "i");
    const codePattern = new RegExp(escapeRegExp(game.code), "i");
    const namePattern = new RegExp(`\\b${escapeRegExp(game.name)}\\b`, "i");

    return gameUrlPattern.test(html) || codePattern.test(html) || namePattern.test(normalizedText);
  });
}

function countSkillBadgesFromHtml(html) {
  if (typeof DOMParser !== "undefined") {
    const documentValue = new DOMParser().parseFromString(html, "text/html");
    const badgeNodes = Array.from(documentValue.querySelectorAll("a, article, li, div, section")).filter((node) => {
      const nodeText = normalizeText(node.textContent || "");
      return SKILL_BADGE_TEXT_PATTERN.test(nodeText) && !/\barcade\b/i.test(nodeText);
    });
    const uniqueLabels = new Set(badgeNodes.map((node) => normalizeText(node.textContent || "")).filter(Boolean));

    if (uniqueLabels.size > 0) {
      return uniqueLabels.size;
    }
  }

  const matches = normalizeText(html).match(new RegExp(SKILL_BADGE_TEXT_PATTERN.source, "gi"));
  return matches ? matches.length : 0;
}

function normalizeText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeTitle(value) {
  return normalizeText(value).toLowerCase();
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requireSyllabusAssertions() {
  if (typeof require !== "undefined") {
    return require("./data/syllabus-assertions.json");
  }

  return window.SYLLABUS_ASSERTIONS || {
    arcade_games: JULY_ARCADE_GAME_ASSERTIONS,
    skill_badges: {
      beginner: buildFallbackBadges("beginner", "Beginner"),
      intermediate: buildFallbackBadges("intermediate", "Intermediate"),
      advanced: buildFallbackBadges("advanced", "Advanced")
    }
  };
}

function buildFallbackBadges(prefix, level) {
  return Array.from({ length: 17 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `${prefix}-${number}`,
      name: `${level} Badge ${number}`,
      level,
      url: null,
      completed: false
    };
  });
}

function getProgramStatus(now = new Date()) {
  const startsAt = new Date(PROGRAM_PERIOD.starts_at);
  const endsAt = new Date(PROGRAM_PERIOD.ends_at);
  const releaseKey = getMonthlyReleaseKey(now);

  return {
    starts_at: PROGRAM_PERIOD.starts_at,
    ends_at: PROGRAM_PERIOD.ends_at,
    active: now >= startsAt && now <= endsAt,
    release_key: releaseKey,
    release_label: releaseKey === "july_2026" ? "Juli 2026" : releaseKey === "august_2026" ? "Agustus 2026" : "September 2026"
  };
}

function getMonthlyReleaseKey(now = new Date()) {
  const month = now.getMonth();
  if (month === 6) {
    return "july_2026";
  }
  if (month === 7) {
    return "august_2026";
  }
  return "september_2026";
}

function getNextTargetPlan(result, completedGames, completedBadges, scraped = null) {
  const nextMilestone = getNextMilestone(result.highest_milestone_id ? MILESTONES.find((milestone) => milestone.id === result.highest_milestone_id) : null);
  const gameGap = nextMilestone ? Math.max(0, nextMilestone.requirements.arcade_games - completedGames) : 0;
  const badgeGap = nextMilestone ? Math.max(0, nextMilestone.requirements.skill_badges - completedBadges) : 0;
  const arcadeTargets = scraped?.target_arcade_games || buildArcadeGameTargets(scraped?.matched_arcade_games || []);
  const skillTargets = scraped?.skill_badge_targets || buildSkillBadgeTargets(completedBadges);
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

function buildNextMilestoneStatus(nextMilestone, arcadeGamesCompleted, skillBadgesCompleted) {
  if (!nextMilestone) {
    return "Semua milestone telah tercapai. Tidak ada milestone berikutnya.";
  }

  const gamesGap = Math.max(0, nextMilestone.requirements.arcade_games - arcadeGamesCompleted);
  const badgesGap = Math.max(0, nextMilestone.requirements.skill_badges - skillBadgesCompleted);

  if (gamesGap === 0 && badgesGap === 0) {
    return `${nextMilestone.name} sudah terpenuhi.`;
  }

  return `Menuju ${nextMilestone.name}: kurang ${gamesGap} Arcade Games dan ${badgesGap} Badge Keahlian. Kedua syarat harus terpenuhi bersamaan.`;
}

function renderMilestoneTable() {
  const tableBody = document.getElementById("milestone-table");
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = MILESTONES.map(
    (milestone) => `
      <tr>
        <td><strong>${milestone.name}</strong></td>
        <td>${milestone.requirements.arcade_games}</td>
        <td>${milestone.requirements.skill_badges}</td>
        <td>${milestone.points.total_arcade_points}</td>
        <td>${milestone.points.bonus_points} + ${milestone.bonus_milestone.extra_bonus_points} opsional</td>
        <td>${milestone.points.total_with_bonus_points} / ${milestone.bonus_milestone.total_with_bonus_milestone}</td>
      </tr>
    `
  ).join("");
}

function renderWarnings() {
  const warningList = document.getElementById("warning-list");
  if (!warningList) {
    return;
  }

  warningList.innerHTML = WARNING_MESSAGES.map((message) => `<li>${message}</li>`).join("");
}

function updateCalculator() {
  const arcadeGamesInput = document.getElementById("arcade-games");
  const skillBadgesInput = document.getElementById("skill-badges");
  const bonusMilestoneInput = document.getElementById("bonus-milestone");
  const validationMessage = document.getElementById("validation-message");

  const result = calculateProgress({
    arcade_games_completed: arcadeGamesInput.value,
    skill_badges_completed: skillBadgesInput.value,
    bonus_milestone_completed: bonusMilestoneInput.checked
  });

  validationMessage.textContent = result.errors.join(" ");

  if (result.errors.length > 0) {
    return;
  }

  setText("game-points", result.game_points);
  setText("badge-points", result.badge_points);
  setText("arcade-points", result.arcade_points);
  setText("highest-milestone", result.highest_milestone);
  setText("milestone-bonus-points", result.milestone_bonus_points);
  setText("bonus-milestone-points", result.bonus_milestone_points);
  setText("total-points", result.total_points);
  setText("next-milestone-status", result.next_milestone_status);
  setText("reward-notice", result.reward_notice);
  renderTargetPlan(result, Number(arcadeGamesInput.value || 0), Number(skillBadgesInput.value || 0), latestScrapeResult);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = String(value);
  }
}

function renderTargetPlan(result, completedGames, completedBadges, scraped) {
  const summary = document.getElementById("target-summary");
  const arcadeList = document.getElementById("arcade-target-list");
  const completedSkillList = document.getElementById("completed-skill-list");
  const skillList = document.getElementById("skill-target-list");

  if (!summary || !arcadeList || !completedSkillList || !skillList) {
    return;
  }

  if (!scraped) {
    const plan = getNextTargetPlan(result, completedGames, completedBadges);
    summary.textContent = "Daftar di bawah berasal dari asersi silabus resmi. Klik Baca Profil untuk menandai mana yang sudah selesai.";
    arcadeList.innerHTML = plan.arcadeTargets.map(renderArcadeTarget).join("");
    completedSkillList.innerHTML = "<li><div><strong>Belum ada badge silabus yang ditandai selesai</strong><span>Progres akan dicocokkan setelah profil publik dibaca.</span></div></li>";
    skillList.innerHTML = plan.missingSkillTargets.map(renderSkillTarget).join("");
    return;
  }

  const plan = getNextTargetPlan(result, completedGames, completedBadges, scraped);
  const programStatus = getProgramStatus();
  const periodText = programStatus.active
    ? `Periode aktif sampai 14 September 2026 23:59 WIB. Target game bulan ini: ${programStatus.release_label}.`
    : "Di luar periode program 13 Juli 2026 10:00 sampai 14 September 2026 23:59 WIB.";
  const matchText = `${plan.completedSkillTargets.length} dari ${plan.skillTargets.length} badge silabus ditandai selesai berdasarkan hasil baca profil.`;
  summary.textContent = plan.nextMilestone
    ? `Menuju ${plan.nextMilestone.name}: fokus ${plan.gameGap} Arcade Games dan ${plan.badgeGap} Badge Keahlian lagi. ${matchText} ${periodText}`
    : `Ultimate Milestone sudah tercapai. ${matchText} ${periodText}`;
  arcadeList.innerHTML = plan.arcadeTargets.map(renderArcadeTarget).join("");
  completedSkillList.innerHTML = plan.completedSkillTargets.length > 0
    ? plan.completedSkillTargets.map(renderCompletedSkillBadge).join("")
    : "<li><div><strong>Belum ada badge silabus yang cocok sebagai selesai</strong><span>Badge dari profil tetap dihitung untuk poin, tetapi belum cocok dengan nama/alias di asersi silabus.</span></div></li>";
  skillList.innerHTML = plan.missingSkillTargets.map(renderSkillTarget).join("");
}

function renderArcadeTarget(game) {
  return `
    <li>
      <div>
        <strong>${game.name}</strong>
        <span>${game.code} - ${game.release_month || "2026-07"}</span>
        ${renderTargetLink(game.url, "Buka Game")}
      </div>
      <span class="target-status ${game.completed ? "done" : "todo"}">${game.completed ? "Selesai" : "Kerjakan"}</span>
    </li>
  `;
}

function renderSkillTarget(badge) {
  return `
    <li>
      <div>
        <strong>${badge.name}</strong>
        <span>${badge.level}</span>
        ${renderTargetLink(badge.url, "Buka Lab")}
      </div>
      <span class="target-status ${badge.completed ? "done" : "todo"}">${badge.completed ? "Selesai" : "Target"}</span>
    </li>
  `;
}

function renderCompletedSkillBadge(badge) {
  return `
    <li>
      <div>
        <strong>${badge.name}</strong>
        <span>${badge.level}</span>
        ${renderTargetLink(badge.url, "Buka Lab")}
      </div>
      <span class="target-status done">Selesai</span>
    </li>
  `;
}

function renderTargetLink(url, label) {
  if (!url) {
    return '<span class="target-link missing">Link belum tersedia</span>';
  }

  return `<a class="target-link" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
}

function loadPublicProfileUrl() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(PUBLIC_PROFILE_URL_STORAGE_KEY);
}

function savePublicProfileUrl(value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const trimmedValue = value.trim();
  if (trimmedValue) {
    window.localStorage.setItem(PUBLIC_PROFILE_URL_STORAGE_KEY, trimmedValue);
  } else {
    window.localStorage.removeItem(PUBLIC_PROFILE_URL_STORAGE_KEY);
  }
}

function updateUrlStorageStatus(value) {
  const status = document.getElementById("url-storage-status");
  if (!status) {
    return;
  }

  status.textContent = value.trim()
    ? "URL tersimpan sementara di browser ini."
    : "URL belum diisi. Jika diisi, URL akan disimpan sementara di browser ini.";
}

async function scrapePublicProfile() {
  const urlInput = document.getElementById("public-profile-url");
  const arcadeGamesInput = document.getElementById("arcade-games");
  const skillBadgesInput = document.getElementById("skill-badges");
  const status = document.getElementById("url-storage-status");

  if (!urlInput || !arcadeGamesInput || !skillBadgesInput || !status) {
    return;
  }

  if (!urlInput.value.trim()) {
    status.textContent = "Isi URL publik Skills Google terlebih dahulu.";
    return;
  }

  savePublicProfileUrl(urlInput.value);
  updateUrlStorageStatus(urlInput.value);
  status.textContent = "Membaca profil publik...";

  try {
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(urlInput.value.trim())}`, { credentials: "omit" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const scraped = await response.json();
    if (scraped.error) {
      throw new Error(scraped.error);
    }

    latestScrapeResult = scraped;
    arcadeGamesInput.value = String(scraped.arcade_games_completed);
    skillBadgesInput.value = String(scraped.skill_badges_completed);
    status.textContent = `Profil terbaca: ${scraped.arcade_games_completed} Arcade Games Juli dan ${scraped.skill_badges_completed} Badge Keahlian terdeteksi.`;
    updateCalculator();
  } catch (error) {
    status.textContent = `Profil publik belum bisa dibaca: ${error.message}`;
  }
}

function initializePublicProfileUrlStorage() {
  const urlInput = document.getElementById("public-profile-url");
  const clearButton = document.getElementById("clear-url");
  const scrapeButton = document.getElementById("scrape-profile");

  if (!urlInput || !clearButton || !scrapeButton) {
    return;
  }

  const storedUrl = loadPublicProfileUrl();
  if (storedUrl !== null) {
    urlInput.value = storedUrl;
  } else if (urlInput.value.trim()) {
    savePublicProfileUrl(urlInput.value);
  }
  updateUrlStorageStatus(urlInput.value);

  urlInput.addEventListener("input", () => {
    savePublicProfileUrl(urlInput.value);
    updateUrlStorageStatus(urlInput.value);
  });

  clearButton.addEventListener("click", () => {
    urlInput.value = "";
    savePublicProfileUrl("");
    updateUrlStorageStatus("");
    urlInput.focus();
  });

  scrapeButton.addEventListener("click", scrapePublicProfile);
}

function initializeApp() {
  renderMilestoneTable();
  renderWarnings();
  initializePublicProfileUrlStorage();
  updateCalculator();

  ["arcade-games", "skill-badges", "bonus-milestone"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateCalculator);
    document.getElementById(id).addEventListener("change", updateCalculator);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeApp);
}

if (typeof module !== "undefined") {
  module.exports = {
    MILESTONES,
    WARNING_MESSAGES,
    PUBLIC_PROFILE_URL_STORAGE_KEY,
    JULY_ARCADE_GAME_ASSERTIONS,
    calculateProgress,
    getNextTargetPlan,
    scrapeProfileHtml,
    extractEarnedBadges,
    getProgramStatus,
    loadPublicProfileUrl,
    savePublicProfileUrl,
    findHighestMilestone,
    getNextMilestone
  };
}
