export interface ArcadeGame {
  id: number;
  name: string;
  code: string;
  url?: string;
  release_month?: string;
  type?: string;
  status?: string;
  aliases?: string[];
  completed?: boolean;
}

export interface SkillBadge {
  id?: string;
  name: string;
  level: string;
  url?: string;
  aliases?: string[];
  completed?: boolean;
}

export interface CompletedSkillBadge {
  name: string;
  earned_at_label: string;
  url: string | null;
  official_id?: string;
}

export interface SyllabusAssertions {
  source: {
    title: string;
    program: string;
    release_month: string;
    release_label: string;
  };
  meta: {
    listed_skill_badges_total: number;
    additional_badges_needed_for_ultimate: number;
    arcade_game_catalog_scope: string;
    program_period: {
      starts_at: string;
      ends_at: string;
    };
    monthly_releases: {
      july_2026: number[];
    };
    listed_distribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
  };
  arcade_games: ArcadeGame[];
  skill_badges: {
    beginner: SkillBadge[];
    intermediate: SkillBadge[];
    advanced: SkillBadge[];
  };
}

export interface ScrapedProfile {
  arcade_games_completed: number;
  skill_badges_completed: number;
  completed_skill_badges: CompletedSkillBadge[];
  matched_arcade_games: ArcadeGame[];
  completed_arcade_games: ArcadeGame[];
  missing_arcade_games: ArcadeGame[];
  target_arcade_games: ArcadeGame[];
  skill_badge_targets: SkillBadge[];
  completed_skill_badge_targets: SkillBadge[];
  missing_skill_badge_targets: SkillBadge[];
}

export interface TargetPlan {
  nextMilestone: import('./milestones').Milestone | null;
  gameGap: number;
  badgeGap: number;
  arcadeTargets: ArcadeGame[];
  skillTargets: SkillBadge[];
  completedSkillTargets: SkillBadge[];
  missingSkillTargets: SkillBadge[];
  remainingArcadeTargets: ArcadeGame[];
  remainingSkillTargets: SkillBadge[];
}
