import { PUBLIC_PROFILE_URL_STORAGE_KEY, SCRAPED_PROFILE_STORAGE_KEY } from './milestones';
import type { ScrapedProfile } from './types';

interface StoredScrapedProfile {
  url: string;
  profile: ScrapedProfile;
}

export function loadPublicProfileUrl(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem(PUBLIC_PROFILE_URL_STORAGE_KEY);
}

export function savePublicProfileUrl(value: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const trimmedValue = value.trim();
  if (trimmedValue) {
    window.localStorage.setItem(PUBLIC_PROFILE_URL_STORAGE_KEY, trimmedValue);
  } else {
    window.localStorage.removeItem(PUBLIC_PROFILE_URL_STORAGE_KEY);
  }
}

function isScrapedProfile(value: unknown): value is ScrapedProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<ScrapedProfile>;
  return typeof profile.arcade_games_completed === 'number'
    && typeof profile.skill_badges_completed === 'number'
    && Array.isArray(profile.completed_skill_badges)
    && Array.isArray(profile.matched_arcade_games)
    && Array.isArray(profile.completed_arcade_games)
    && Array.isArray(profile.missing_arcade_games)
    && Array.isArray(profile.target_arcade_games)
    && Array.isArray(profile.skill_badge_targets)
    && Array.isArray(profile.completed_skill_badge_targets)
    && Array.isArray(profile.missing_skill_badge_targets);
}

export function loadScrapedProfile(url: string): ScrapedProfile | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const raw = window.localStorage.getItem(SCRAPED_PROFILE_STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as Partial<StoredScrapedProfile>;
    if (stored.url !== url.trim() || !isScrapedProfile(stored.profile)) return null;
    return stored.profile;
  } catch {
    window.localStorage.removeItem(SCRAPED_PROFILE_STORAGE_KEY);
    return null;
  }
}

export function saveScrapedProfile(url: string, profile: ScrapedProfile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return;

  try {
    const stored: StoredScrapedProfile = { url: trimmedUrl, profile };
    window.localStorage.setItem(SCRAPED_PROFILE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage may be unavailable or full; the in-memory result remains usable.
  }
}

export function clearScrapedProfile(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(SCRAPED_PROFILE_STORAGE_KEY);
}
