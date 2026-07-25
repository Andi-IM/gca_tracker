export interface Milestone {
  id: string;
  name: string;
  requirements: {
    arcade_games: number;
    skill_badges: number;
  };
  points: {
    game_points: number;
    badge_points: number;
    bonus_points: number;
    total_arcade_points: number;
    total_with_bonus_points: number;
  };
  bonus_milestone: {
    available: boolean;
    extra_bonus_points: number;
    total_with_bonus_milestone: number;
  };
}

export const MILESTONES: Milestone[] = [
  {
    id: 'milestone_1',
    name: 'Milestone 1',
    requirements: { arcade_games: 6, skill_badges: 14 },
    points: { game_points: 6, badge_points: 7, bonus_points: 7, total_arcade_points: 13, total_with_bonus_points: 20 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 30 }
  },
  {
    id: 'milestone_2',
    name: 'Milestone 2',
    requirements: { arcade_games: 8, skill_badges: 28 },
    points: { game_points: 8, badge_points: 14, bonus_points: 18, total_arcade_points: 22, total_with_bonus_points: 40 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 50 }
  },
  {
    id: 'milestone_3',
    name: 'Milestone 3',
    requirements: { arcade_games: 10, skill_badges: 42 },
    points: { game_points: 10, badge_points: 21, bonus_points: 29, total_arcade_points: 31, total_with_bonus_points: 60 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 70 }
  },
  {
    id: 'ultimate_milestone',
    name: 'Ultimate Milestone',
    requirements: { arcade_games: 12, skill_badges: 56 },
    points: { game_points: 12, badge_points: 28, bonus_points: 40, total_arcade_points: 40, total_with_bonus_points: 80 },
    bonus_milestone: { available: true, extra_bonus_points: 10, total_with_bonus_milestone: 90 }
  }
];

export const WARNING_MESSAGES = [
  'Jangan mengakumulasi bonus dari beberapa milestone.',
  'Gunakan hanya bonus dari milestone tertinggi yang tercapai.',
  'Milestone tidak boleh dianggap tercapai jika hanya jumlah game atau hanya jumlah badge yang memenuhi syarat.',
  'Perhitungan Badge Keahlian harus menggunakan floor per 2 badge = 1 poin.',
  'Mencapai milestone fasilitator tidak otomatis menjamin hadiah atau swag.'
];

export const REWARD_NOTICE =
  'Mencapai milestone fasilitator tidak otomatis membuat peserta memenuhi syarat mendapatkan swag atau hadiah. Bonus poin hanya menambah poin Arcade untuk membantu mencapai pencapaian Google Skills Arcade Player.';

export const PUBLIC_PROFILE_URL_STORAGE_KEY = 'google-skills-arcade:public-profile-url';
export const SCRAPED_PROFILE_STORAGE_KEY = 'google-skills-arcade:scraped-profile';
