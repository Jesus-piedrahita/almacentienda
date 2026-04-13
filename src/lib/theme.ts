export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme-preference';

interface LegacyThemeStorage {
  state?: {
    themePreference?: unknown;
  };
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

function parseStoredThemePreference(stored: string | null): ThemePreference | null {
  if (!stored) {
    return null;
  }

  if (isThemePreference(stored)) {
    return stored;
  }

  try {
    const parsed = JSON.parse(stored) as LegacyThemeStorage;
    const themePreference = parsed.state?.themePreference;

    return isThemePreference(themePreference) ? themePreference : null;
  } catch {
    return null;
  }
}

export function resolveEffectiveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (preference === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }

  return preference;
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function readStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  const preference = parseStoredThemePreference(stored);

  if (preference) {
    if (stored !== preference) {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }

    return preference;
  }

  return 'system';
}

export function writeStoredThemePreference(preference: ThemePreference): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function applyThemeToDocument(theme: EffectiveTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function resolveAndApplyTheme(preference: ThemePreference): EffectiveTheme {
  const effectiveTheme = resolveEffectiveTheme(preference, getSystemPrefersDark());
  applyThemeToDocument(effectiveTheme);
  return effectiveTheme;
}
