import type { CalculatorResult } from '../lib/calculator';
import type { ScrapedProfile, SyllabusAssertions, ArcadeGame, SkillBadge } from '../lib/types';
import type { ComponentChildren } from 'preact';
import { getNextTargetPlan } from '../lib/planner';
import { getProgramStatus } from '../lib/calculator';
import { useState } from 'preact/hooks';

interface TargetPanelProps {
  syllabus: SyllabusAssertions;
  result: CalculatorResult;
  scrapeResult: ScrapedProfile | null;
  arcadeGames: number;
  skillBadges: number;
}

type TargetStatusFilter = 'all' | 'todo' | 'done';

interface TargetAccordionProps {
  title: string;
  count: number;
  description: string;
  defaultOpen?: boolean;
  className?: string;
  children: ComponentChildren;
}

function TargetAccordion({ title, count, description, defaultOpen = false, className = '', children }: TargetAccordionProps) {
  return (
    <details class={`target-accordion ${className}`} open={defaultOpen}>
      <summary>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span class="section-count" aria-label={`${count} item`}>{count}</span>
      </summary>
      <div class="target-accordion-body">
        {children}
      </div>
    </details>
  );
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
    <li key={game.id}>
      <div>
        <strong>{game.name}</strong>
        <span>{game.code} - {game.release_month || '2026-07'}</span>
        {renderTargetLink(game.url, 'Buka Game')}
      </div>
      <span class={`target-status ${game.completed ? 'done' : 'todo'}`} aria-label={game.completed ? 'Status selesai' : 'Status belum selesai'}>
        <span aria-hidden="true">{game.completed ? 'OK' : '-'}</span>
        {game.completed ? 'Selesai' : 'Kerjakan'}
      </span>
    </li>
  );
}

function renderSkillTarget(badge: SkillBadge) {
  return (
    <li key={badge.id || badge.name}>
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.level}</span>
        {renderTargetLink(badge.url, 'Buka Lab')}
      </div>
      <span class={`target-status ${badge.completed ? 'done' : 'todo'}`} aria-label={badge.completed ? 'Status selesai' : 'Status belum selesai'}>
        <span aria-hidden="true">{badge.completed ? 'OK' : '-'}</span>
        {badge.completed ? 'Selesai' : 'Kerjakan'}
      </span>
    </li>
  );
}

function renderCompletedSkillBadge(badge: SkillBadge) {
  return (
    <li key={badge.id || badge.name}>
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.level}</span>
        {renderTargetLink(badge.url, 'Buka Lab')}
      </div>
      <span class="target-status done" aria-label="Status selesai">
        <span aria-hidden="true">OK</span>
        Selesai
      </span>
    </li>
  );
}

function renderReceivedSkillBadge(badge: NonNullable<ScrapedProfile['completed_skill_badges']>[number]) {
  return (
    <li key={`${badge.name}-${badge.earned_at_label}`}>
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.earned_at_label}{badge.official_id ? ` - Cocok dengan silabus` : ' - Badge profil'}</span>
      </div>
      <span class="target-status done" aria-label="Badge diterima">
        <span aria-hidden="true">OK</span>
        Diterima
      </span>
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
    return <div class="completed-summary">Tidak ada badge yang cocok dengan filter.</div>;
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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TargetStatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState('all');
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

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesCommon = (item: ArcadeGame | SkillBadge) => {
    const searchable = [item.name, 'code' in item ? item.code : '', 'level' in item ? item.level : '', 'release_month' in item ? item.release_month : '']
      .join(' ')
      .toLocaleLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesLevel = !('level' in item) || levelFilter === 'all' || item.level.toLocaleLowerCase() === levelFilter;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'done' && item.completed)
      || (statusFilter === 'todo' && !item.completed);
    return matchesQuery && matchesLevel && matchesStatus;
  };

  const filteredArcadeTargets = plan.arcadeTargets.filter(matchesCommon);
  const filteredMissingSkillTargets = plan.missingSkillTargets.filter(matchesCommon);
  const filteredCompletedSkillTargets = plan.completedSkillTargets.filter(matchesCommon);
  const filteredPriorityItems = priorityItems.filter(matchesCommon);
  const visiblePriorityItems = filteredPriorityItems.slice(0, 3);
  const hasActiveFilters = Boolean(normalizedQuery) || statusFilter !== 'all' || levelFilter !== 'all';
  const hasFilteredTargets = filteredArcadeTargets.length > 0 || filteredMissingSkillTargets.length > 0 || filteredCompletedSkillTargets.length > 0;
  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setLevelFilter('all');
  };

  return (
    <section class="panel target-panel" aria-label="Target badge berikutnya">
      <div class="section-heading">
        <h2>Target dan Progres Badge</h2>
        <p id="target-summary">{summaryText}</p>
      </div>

      <div class="target-filters" aria-label="Filter target">
        <label class="target-search">
          <span>Cari target</span>
          <input
            type="search"
            value={query}
            placeholder="Cari nama, kode, atau level"
            onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
          />
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter((event.currentTarget as HTMLSelectElement).value as TargetStatusFilter)}>
            <option value="all">Semua status</option>
            <option value="todo">Belum selesai</option>
            <option value="done">Selesai</option>
          </select>
        </label>
        <label>
          <span>Level badge</span>
          <select value={levelFilter} onChange={(event) => setLevelFilter((event.currentTarget as HTMLSelectElement).value)}>
            <option value="all">Semua level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        {hasActiveFilters && (
          <button class="filter-reset" type="button" onClick={resetFilters}>Reset filter</button>
        )}
      </div>

      {showPriority && filteredPriorityItems.length > 0 && (
        <div class="priority-callout">
          <h3>Fokus: {priorityParts.join(' dan ')}</h3>
          <ul class="priority-list">
            {visiblePriorityItems.map((item) => (
              <li key={item.name}>
                <span class="priority-type">{item._type}</span>
                <strong>{item.name}</strong>
                {renderTargetLink(item.url, item._type === 'Arcade Game' ? 'Buka Game' : 'Buka Lab')}
              </li>
            ))}
          </ul>
          {filteredPriorityItems.length > visiblePriorityItems.length && (
            <p class="priority-more">+{filteredPriorityItems.length - visiblePriorityItems.length} target lainnya tersedia di daftar bawah.</p>
          )}
        </div>
      )}

      <div class="target-grid target-accordion-list" aria-live="polite">
        <TargetAccordion
          title="Arcade Games Juli 2026"
          count={filteredArcadeTargets.length}
          description="Target game resmi bulan ini."
          defaultOpen={filteredArcadeTargets.some((target) => !target.completed)}
        >
          <ul class="target-list">
            {filteredArcadeTargets.map(renderArcadeTarget)}
          </ul>
        </TargetAccordion>
        <TargetAccordion
          title="Badge Belum Selesai"
          count={filteredMissingSkillTargets.length}
          description="Buka saat ingin memilih badge berikutnya dari silabus resmi."
          defaultOpen={hasActiveFilters && filteredMissingSkillTargets.length > 0}
        >
          {renderSkillTargetGroups(filteredMissingSkillTargets)}
        </TargetAccordion>
        <TargetAccordion
          title="Badge Selesai"
          count={filteredCompletedSkillTargets.length}
          description="Buka jika ingin memeriksa badge silabus yang sudah cocok."
          defaultOpen={hasActiveFilters && filteredCompletedSkillTargets.length > 0}
          className="completed-targets"
        >
          {filteredCompletedSkillTargets.length > 0 && (
            <p id="completed-skill-summary">
              {filteredCompletedSkillTargets.length} dari {plan.skillTargets.length} badge ditandai selesai.
            </p>
          )}
          {filteredCompletedSkillTargets.length > 0
            ? <ul class="target-list">{filteredCompletedSkillTargets.map(renderCompletedSkillBadge)}</ul>
            : (!hasActiveFilters || hasFilteredTargets) && (
              <div class="target-empty-state">
                <strong>{hasActiveFilters ? 'Tidak ada badge selesai yang cocok' : 'Belum ada badge silabus yang cocok sebagai selesai'}</strong>
                <span>{hasActiveFilters ? 'Coba ubah status, level, atau kata pencarian.' : 'Badge dari profil tetap dihitung untuk poin, tetapi belum cocok dengan nama/alias di asersi silabus.'}</span>
                {hasActiveFilters && <button type="button" onClick={resetFilters}>Reset filter</button>}
              </div>
            )}
        </TargetAccordion>
        <TargetAccordion
          title="Badge Diterima dari Profil"
          count={scrapeResult?.completed_skill_badges.length || 0}
          description="Data mentah dari profil publik, dipisahkan dari daftar silabus resmi."
          className="received-targets"
        >
          {scrapeResult?.completed_skill_badges.length ? (
            <ul class="target-list">{scrapeResult.completed_skill_badges.map(renderReceivedSkillBadge)}</ul>
          ) : (
            <div class="target-empty-state">
              <strong>Belum ada hasil scraping profil</strong>
              <span>Jalankan baca profil untuk menyimpan daftar badge yang diterima.</span>
            </div>
          )}
        </TargetAccordion>
      </div>

      {!hasFilteredTargets && (
        <div class="target-empty-state target-empty-state-global" role="status">
          <strong>Tidak ada target yang cocok</strong>
          <span>Ubah kata pencarian atau filter untuk melihat target lainnya.</span>
          <button type="button" onClick={resetFilters}>Reset filter</button>
        </div>
      )}
    </section>
  );
}
