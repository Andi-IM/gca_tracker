import type { CalculatorResult } from '../lib/calculator';
import type { ScrapedProfile, SyllabusAssertions, ArcadeGame, SkillBadge } from '../lib/types';
import { getNextTargetPlan } from '../lib/planner';
import { getProgramStatus } from '../lib/calculator';

interface TargetPanelProps {
  syllabus: SyllabusAssertions;
  result: CalculatorResult;
  scrapeResult: ScrapedProfile | null;
  arcadeGames: number;
  skillBadges: number;
}

function renderTargetLink(url: string | undefined | null, label: string) {
  if (!url) return <span class="target-link missing">Link belum tersedia</span>;
  return (
    <a class="target-link" href={url} target="_blank" rel="noreferrer" aria-label={`${label} (buka di tab baru)`}>
      {label}
    </a>
  );
}

function renderArcadeTarget(game: ArcadeGame) {
  return (
    <li>
      <div>
        <strong>{game.name}</strong>
        <span>{game.code} - {game.release_month || '2026-07'}</span>
        {renderTargetLink(game.url, 'Buka Game')}
      </div>
      <span class={`target-status ${game.completed ? 'done' : 'todo'}`}>
        {game.completed ? 'Selesai' : 'Kerjakan'}
      </span>
    </li>
  );
}

function renderSkillTarget(badge: SkillBadge) {
  return (
    <li>
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.level}</span>
        {renderTargetLink(badge.url, 'Buka Lab')}
      </div>
      <span class={`target-status ${badge.completed ? 'done' : 'todo'}`}>
        {badge.completed ? 'Selesai' : 'Kerjakan'}
      </span>
    </li>
  );
}

function renderCompletedSkillBadge(badge: SkillBadge) {
  return (
    <li>
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.level}</span>
        {renderTargetLink(badge.url, 'Buka Lab')}
      </div>
      <span class="target-status done">Selesai</span>
    </li>
  );
}

function renderSkillTargetGroups(missingTargets: SkillBadge[]) {
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  const levelLabels: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  
  const grouped = levels.map((level) => ({
    level,
    label: levelLabels[level],
    badges: missingTargets.filter((b) => b.level === levelLabels[level])
  })).filter((g) => g.badges.length > 0);

  if (grouped.length === 0) {
    return <div class="completed-summary">Semua badge silabus sudah selesai.</div>;
  }

  return (
    <>
      {grouped.map((group) => (
        <div class="level-group">
          <div class="level-group-header">
            <h4>{group.label}</h4>
            <span class="level-group-count">{group.badges.length}</span>
          </div>
          <ul class="target-list">
            {group.badges.map(renderSkillTarget)}
          </ul>
        </div>
      ))}
    </>
  );
}

export default function TargetPanel({ syllabus, result, scrapeResult, arcadeGames, skillBadges }: TargetPanelProps) {
  const plan = getNextTargetPlan(syllabus, result, arcadeGames, [], scrapeResult);
  const programStatus = getProgramStatus();
  
  const periodText = programStatus.active
    ? `Periode aktif sampai 14 September 2026 23:59 WIB. Target game bulan ini: ${programStatus.release_label}.`
    : 'Di luar periode program 13 Juli 2026 10:00 sampai 14 September 2026 23:59 WIB.';
  
  const matchText = `${plan.completedSkillTargets.length} dari ${plan.skillTargets.length} badge silabus ditandai selesai.`;

  let summaryText = '';
  if (plan.nextMilestone && (plan.gameGap > 0 || plan.badgeGap > 0)) {
    const parts = [];
    if (plan.gameGap > 0) parts.push(`${plan.gameGap} Arcade Games`);
    if (plan.badgeGap > 0) parts.push(`${plan.badgeGap} Badge Keahlian`);
    summaryText = `Menuju ${plan.nextMilestone.name}: butuh ${parts.join(' dan ')} lagi.`;
  } else if (plan.nextMilestone) {
    summaryText = `${plan.nextMilestone.name} sudah terpenuhi.`;
  } else {
    summaryText = 'Ultimate Milestone sudah tercapai.';
  }
  summaryText += ` ${matchText} ${periodText}`;

  const showPriority = (plan.gameGap > 0 || plan.badgeGap > 0) && plan.nextMilestone;
  const priorityParts = [];
  if (plan.gameGap > 0) priorityParts.push(`${plan.gameGap} Arcade Games`);
  if (plan.badgeGap > 0) priorityParts.push(`${plan.badgeGap} Badge Keahlian`);

  const priorityItems = [
    ...plan.remainingArcadeTargets.map((g) => ({ ...g, _type: 'Arcade Game' })),
    ...plan.remainingSkillTargets.map((b) => ({ ...b, _type: 'Badge Keahlian' }))
  ];

  return (
    <section class="panel target-panel" aria-label="Target badge berikutnya">
      <div class="section-heading">
        <h2>Target dan Progres Badge</h2>
        <p id="target-summary">{summaryText}</p>
      </div>

      {showPriority && (
        <div class="priority-callout">
          <h3>Fokus: {priorityParts.join(' dan ')}</h3>
          <ul class="priority-list">
            {priorityItems.map((item) => (
              <li>
                <span class="priority-type">{item._type}</span>
                <strong>{item.name}</strong>
                {renderTargetLink(item.url, item._type === 'Arcade Game' ? 'Buka Game' : 'Buka Lab')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div class="target-grid" aria-live="polite">
        <section>
          <h3>Arcade Games Juli 2026</h3>
          <ul class="target-list">
            {plan.arcadeTargets.map(renderArcadeTarget)}
          </ul>
        </section>
        <section>
          <h3>Badge Belum Selesai</h3>
          {renderSkillTargetGroups(plan.missingSkillTargets)}
        </section>
        <section>
          <h3>Badge Selesai</h3>
          {plan.completedSkillTargets.length > 0 && (
            <p id="completed-skill-summary">
              {plan.completedSkillTargets.length} dari {plan.skillTargets.length} badge ditandai selesai.
            </p>
          )}
          <ul class="target-list">
            {plan.completedSkillTargets.length > 0
              ? plan.completedSkillTargets.map(renderCompletedSkillBadge)
              : (
                <li>
                  <div>
                    <strong>Belum ada badge silabus yang cocok sebagai selesai</strong>
                    <span>Badge dari profil tetap dihitung untuk poin, tetapi belum cocok dengan nama/alias di asersi silabus.</span>
                  </div>
                </li>
              )
            }
          </ul>
        </section>
      </div>
    </section>
  );
}
