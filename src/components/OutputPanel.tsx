/** @jsxImportSource preact */
import type { CalculatorResult } from '../lib/calculator';

interface OutputPanelProps {
  result: CalculatorResult;
}

function buildNextMilestoneStatusText(result: CalculatorResult): string {
  const nextMilestone = result.next_milestone;
  if (!nextMilestone) {
    return 'Semua milestone telah tercapai. Tidak ada milestone berikutnya.';
  }
  const gamesGap = result.gaps?.games ?? 0;
  const badgesGap = result.gaps?.badges ?? 0;

  if (gamesGap === 0 && badgesGap === 0) {
    return `${nextMilestone.name} sudah terpenuhi.`;
  }
  return `Menuju ${nextMilestone.name}: kurang ${gamesGap} Arcade Games dan ${badgesGap} Badge Keahlian. Kedua syarat harus terpenuhi bersamaan.`;
}

function buildNextMilestoneInlineText(result: CalculatorResult): string {
  const nextMilestone = result.next_milestone;
  if (!nextMilestone) {
    return 'Ultimate Milestone sudah tercapai.';
  }
  const gamesGap = result.gaps?.games ?? 0;
  const badgesGap = result.gaps?.badges ?? 0;
  const pointsGap = result.gaps?.points ?? 0;

  if (gamesGap === 0 && badgesGap === 0) {
    return `${nextMilestone.name} sudah terpenuhi.`;
  }
  const parts = [];
  if (gamesGap > 0) parts.push(`${gamesGap} Arcade Games`);
  if (badgesGap > 0) parts.push(`${badgesGap} Badge Keahlian`);
  return `Menuju ${nextMilestone.name}: butuh ${parts.join(' dan ')} lagi (+${pointsGap} poin).`;
}

export default function OutputPanel({ result }: OutputPanelProps) {
  if (result.errors && result.errors.length > 0) {
    return (
      <section class="panel output-panel" aria-label="Hasil perhitungan">
        <div class="validation" role="alert">
          {result.errors.join(' ')}
        </div>
      </section>
    );
  }

  return (
    <section class="panel output-panel" aria-label="Hasil perhitungan">
      <h2 class="output-heading">Hasil</h2>

      <div class="result-hero">
        <div class="result-hero-left">
          <p class="result-hero-label">Milestone tertinggi</p>
          <span class="milestone-pill">{result.highest_milestone}</span>
        </div>
        <div class="result-hero-right">
          <p class="result-hero-label">Total akhir poin</p>
          <strong class="result-hero-total">{result.total_points}</strong>
        </div>
      </div>

      <p class="next-milestone-inline">{buildNextMilestoneInlineText(result)}</p>

      <div class="result-breakdown" aria-label="Rincian perhitungan">
        <article>
          <span>Games</span>
          <strong>{result.game_points}</strong>
        </article>
        <article>
          <span>Badges</span>
          <strong>{result.badge_points}</strong>
        </article>
        <article>
          <span>Subtotal</span>
          <strong>{result.arcade_points}</strong>
        </article>
        <article>
          <span>Bonus Milestone</span>
          <strong>{result.milestone_bonus_points}</strong>
        </article>
        <article>
          <span>Bonus Tambahan</span>
          <strong>{result.bonus_milestone_points}</strong>
        </article>
      </div>

      <div class="status-box">
        <h3>Status menuju milestone berikutnya</h3>
        <p>{buildNextMilestoneStatusText(result)}</p>
      </div>
      <div class="status-box muted">
        <h3>Catatan kelayakan hadiah</h3>
        <p>{result.reward_notice}</p>
      </div>
    </section>
  );
}
