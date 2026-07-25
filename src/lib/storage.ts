import { PUBLIC_PROFILE_URL_STORAGE_KEY } from './milestones';

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
