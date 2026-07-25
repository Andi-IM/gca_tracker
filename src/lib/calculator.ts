import { MILESTONES, REWARD_NOTICE } from './milestones';
import type { Milestone } from './milestones';

export interface CalculatorInput {
  arcade_games_completed: number | string;
  skill_badges_completed: number | string;
  bonus_milestone_completed: boolean;
}

export interface CalculatorResult {
  errors: string[];
  game_points?: number;
  badge_points?: number;
  arcade_points?: number;
  highest_milestone?: string;
  highest_milestone_id?: string | null;
  milestone_bonus_points?: number;
  bonus_milestone_points?: number;
  total_points?: number;
  next_milestone?: Milestone | null;
  gaps?: {
    games: number;
    badges: number;
    points: number;
  };
  reward_notice?: string;
}

export function validateInputValue(value: number | string | null | undefined, label: string): { value: number; error: string | null } {
  if (value === '' || value === null || value === undefined) {
    return { value: 0, error: null };
  }
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 0) {
    return { value: 0, error: `${label} harus berupa bilangan bulat dan tidak negatif.` };
  }
  return { value: numericValue, error: null };
}

export function findHighestMilestone(arcadeGamesCompleted: number, skillBadgesCompleted: number): Milestone | undefined {
  return [...MILESTONES]
    .reverse()
    .find(
      (milestone) =>
        arcadeGamesCompleted >= milestone.requirements.arcade_games &&
        skillBadgesCompleted >= milestone.requirements.skill_badges
    );
}

export function getNextMilestone(highestMilestone: Milestone | undefined | null): Milestone | null {
  if (!highestMilestone) {
    return MILESTONES[0];
  }
  const index = MILESTONES.findIndex((milestone) => milestone.id === highestMilestone.id);
  return MILESTONES[index + 1] || null;
}

export function calculateProgress(input: CalculatorInput): CalculatorResult {
  const gameValidation = validateInputValue(input.arcade_games_completed, 'Jumlah Arcade Games selesai');
  const badgeValidation = validateInputValue(input.skill_badges_completed, 'Jumlah Badge Keahlian selesai');
  const errors = [gameValidation.error, badgeValidation.error].filter(Boolean) as string[];

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

  // Common gap calculation
  const gamesGap = nextMilestone ? Math.max(0, nextMilestone.requirements.arcade_games - arcadeGamesCompleted) : 0;
  const badgesGap = nextMilestone ? Math.max(0, nextMilestone.requirements.skill_badges - skillBadgesCompleted) : 0;
  const pointsAtNext = nextMilestone ? nextMilestone.points.total_with_bonus_points : 0;
  const pointsGap = nextMilestone ? Math.max(0, pointsAtNext - totalPoints) : 0;

  return {
    errors: [],
    game_points: gamePoints,
    badge_points: badgePoints,
    arcade_points: arcadePoints,
    highest_milestone: highestMilestone ? highestMilestone.name : 'Belum mencapai milestone',
    highest_milestone_id: highestMilestone ? highestMilestone.id : null,
    milestone_bonus_points: milestoneBonusPoints,
    bonus_milestone_points: bonusMilestonePoints,
    total_points: totalPoints,
    next_milestone: nextMilestone,
    gaps: {
      games: gamesGap,
      badges: badgesGap,
      points: pointsGap
    },
    reward_notice: REWARD_NOTICE
  };
}

export interface ProgramStatus {
  starts_at: string;
  ends_at: string;
  active: boolean;
  release_key: string;
  release_label: string;
}

export function getMonthlyReleaseKey(now: Date = new Date()): string {
  const month = now.getMonth();
  if (month === 6) return 'july_2026';
  if (month === 7) return 'august_2026';
  return 'september_2026';
}

export function getProgramStatus(now: Date = new Date()): ProgramStatus {
  const startsAt = new Date('2026-07-13T10:00:00+07:00');
  const endsAt = new Date('2026-09-14T23:59:00+07:00');
  const releaseKey = getMonthlyReleaseKey(now);

  return {
    starts_at: '2026-07-13T10:00:00+07:00',
    ends_at: '2026-09-14T23:59:00+07:00',
    active: now >= startsAt && now <= endsAt,
    release_key: releaseKey,
    release_label: releaseKey === 'july_2026' ? 'Juli 2026' : releaseKey === 'august_2026' ? 'Agustus 2026' : 'September 2026'
  };
}
